import { and, desc, eq, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { minecraftSolution, minecraftWord, dictionary, wordHistory } from '../db/schema.js';
import { DEFAULT_LANGUAGE } from '../state/worldRegistry.js';

const DEFAULT_WORLD_ID = 'fr';

export async function getTodaysWord(worldId: string = DEFAULT_WORLD_ID): Promise<string | null> {
  const rows = await db
    .select({ word: minecraftSolution.word })
    .from(minecraftSolution)
    .innerJoin(wordHistory, eq(wordHistory.wordId, minecraftSolution.id))
    .where(and(sql`DATE(${wordHistory.assignedDate}) = CURDATE()`, eq(wordHistory.worldId, worldId)))
    .orderBy(desc(wordHistory.assignedDate))
    .limit(1);
  return rows.length ? rows[0].word : null;
}

export async function getOrCreateTodaysWord(worldId: string = DEFAULT_WORLD_ID, language: string = DEFAULT_LANGUAGE): Promise<string> {
  const todaysWord = await getTodaysWord(worldId);
  if (todaysWord) return todaysWord;

  const candidates = await db
    .select({ id: minecraftSolution.id, word: minecraftSolution.word })
    .from(minecraftSolution)
    .where(
      and(
        eq(minecraftSolution.language, language),
        sql`${minecraftSolution.rotation} = (SELECT MIN(${minecraftSolution.rotation}) FROM ${minecraftSolution} WHERE ${minecraftSolution.language} = ${language})`,
      ),
    )
    .orderBy(sql`RAND()`)
    .limit(1);

  if (!candidates.length) throw new Error(`No words available in MinecraftSolution for language ${language}`);
  const { id, word } = candidates[0];

  await db.insert(wordHistory).values({
    worldId,
    wordId: id,
    assignedDate: sql`CURDATE()` as unknown as Date,
  });
  await db
    .update(minecraftSolution)
    .set({ rotation: sql`${minecraftSolution.rotation} + 1` })
    .where(eq(minecraftSolution.id, id));

  return word;
}

export async function getValidWords(word: string, language: string = DEFAULT_LANGUAGE): Promise<string[]> {
  const pattern = word[0] + '_'.repeat(word.length - 1);
  const result = await db.execute<{ Word: string }>(
    sql`
      SELECT ${minecraftWord.word} AS Word FROM ${minecraftWord}
        WHERE ${minecraftWord.language} = ${language} AND ${minecraftWord.word} LIKE ${pattern}
      UNION
      SELECT ${dictionary.word} AS Word FROM ${dictionary}
        WHERE ${dictionary.language} = ${language} AND ${dictionary.word} LIKE ${pattern}
    `,
  );
  const rows = result[0] as unknown as Array<{ Word: string }>;
  return rows.map((r) => r.Word);
}

export async function getTodaysWordAndHistoryId(
  worldId: string = DEFAULT_WORLD_ID,
): Promise<{ wordHistoryId: number; todaysWord: string }> {
  const rows = await db
    .select({
      wordHistoryId: wordHistory.id,
      word: minecraftSolution.word,
    })
    .from(wordHistory)
    .innerJoin(minecraftSolution, eq(wordHistory.wordId, minecraftSolution.id))
    .where(and(sql`DATE(${wordHistory.assignedDate}) = CURDATE()`, eq(wordHistory.worldId, worldId)))
    .orderBy(desc(wordHistory.assignedDate))
    .limit(1);

  if (!rows.length) throw new Error('Mot du jour introuvable.');
  return {
    wordHistoryId: rows[0].wordHistoryId,
    todaysWord: rows[0].word.toUpperCase(),
  };
}
