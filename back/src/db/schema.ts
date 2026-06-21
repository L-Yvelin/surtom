import { sql } from 'drizzle-orm';
import {
  check,
  customType,
  date,
  datetime,
  foreignKey,
  index,
  int,
  longtext,
  mysqlEnum,
  mysqlTable,
  primaryKey,
  tinyint,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

const longtextUtf8 = customType<{ data: string; notNull: false; default: false }>({
  dataType() {
    return 'longtext';
  },
});

export const player = mysqlTable(
  'Player',
  {
    id: int('ID').autoincrement().notNull(),
    username: varchar('Username', { length: 255 }).notNull(),
    password: varchar('Password', { length: 255 }).notNull(),
    sessionHash: varchar('SessionHash', { length: 255 }),
    registrationDate: datetime('RegistrationDate', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    isAdmin: tinyint('IsAdmin').default(0).notNull(),
    isBanned: int('IsBanned').default(0).notNull(),
  },
  (t) => [primaryKey({ columns: [t.id] }), uniqueIndex('Username').on(t.username)],
);

export const world = mysqlTable(
  'World',
  {
    id: varchar('ID', { length: 32 }).notNull(),
    displayName: varchar('DisplayName', { length: 255 }).notNull(),
    language: varchar('Language', { length: 8 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.id] }), index('World_idx_Language').on(t.language)],
);

export const dictionary = mysqlTable(
  'Dictionary',
  {
    id: int('ID').autoincrement().notNull(),
    language: varchar('Language', { length: 8 }).notNull(),
    word: varchar('Word', { length: 255 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.id] }), uniqueIndex('Dictionary_uk_Language_Word').on(t.language, t.word)],
);

export const minecraftWord = mysqlTable(
  'MinecraftWord',
  {
    id: int('ID').autoincrement().notNull(),
    language: varchar('Language', { length: 8 }).notNull(),
    word: varchar('Word', { length: 255 }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.id] }), uniqueIndex('MinecraftWord_uk_Language_Word').on(t.language, t.word)],
);

export const minecraftSolution = mysqlTable(
  'MinecraftSolution',
  {
    id: int('ID').autoincrement().notNull(),
    language: varchar('Language', { length: 8 }).notNull(),
    word: varchar('Word', { length: 255 }).notNull(),
    rotation: int('Rotation').default(0).notNull(),
    assignedDate: date('AssignedDate', { mode: 'date' }),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    uniqueIndex('MinecraftSolution_uk_Language_Word').on(t.language, t.word),
    index('MinecraftSolution_idx_Language_Rotation').on(t.language, t.rotation),
  ],
);

export const message = mysqlTable(
  'Message',
  {
    id: int('ID').autoincrement().notNull(),
    playerId: int('PlayerID').notNull(),
    worldId: varchar('WorldID', { length: 32 }).notNull(),
    timestamp: datetime('Timestamp', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    type: mysqlEnum('Type', ['TEXT', 'ENHANCED', 'SCORE']).default('TEXT').notNull(),
    deleted: tinyint('Deleted').default(0),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    index('PlayerID').on(t.playerId),
    index('Message_idx_WorldID_Timestamp').on(t.worldId, t.timestamp),
    foreignKey({
      name: 'Message_fk_Player',
      columns: [t.playerId],
      foreignColumns: [player.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'Message_fk_World',
      columns: [t.worldId],
      foreignColumns: [world.id],
    }),
  ],
);

export const chatRead = mysqlTable(
  'ChatRead',
  {
    playerId: int('PlayerID').notNull(),
    worldId: varchar('WorldID', { length: 32 }).notNull(),
    lastReadAt: datetime('LastReadAt', { mode: 'date' }).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.playerId, t.worldId] }),
    foreignKey({
      name: 'ChatRead_fk_Player',
      columns: [t.playerId],
      foreignColumns: [player.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'ChatRead_fk_World',
      columns: [t.worldId],
      foreignColumns: [world.id],
    }),
  ],
);

export const textContent = mysqlTable(
  'TextContent',
  {
    id: int('ID').notNull(),
    text: longtextUtf8('Text').notNull(),
    imageData: longtextUtf8('ImageData'),
    replyId: int('ReplyID'),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    index('ReplyID').on(t.replyId),
    foreignKey({
      name: 'TextContent_fk_Message',
      columns: [t.id],
      foreignColumns: [message.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'TextContent_fk_Reply',
      columns: [t.replyId],
      foreignColumns: [message.id],
    }).onDelete('set null'),
  ],
);

export const wordHistory = mysqlTable(
  'WordHistory',
  {
    id: int('ID').autoincrement().notNull(),
    worldId: varchar('WorldID', { length: 32 }).notNull(),
    wordId: int('WordID').notNull(),
    assignedDate: datetime('AssignedDate', { mode: 'date' })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    index('WordID').on(t.wordId),
    index('WordHistory_idx_WorldID_AssignedDate').on(t.worldId, t.assignedDate),
    foreignKey({
      name: 'WordHistory_fk_MinecraftSolution',
      columns: [t.wordId],
      foreignColumns: [minecraftSolution.id],
    }),
    foreignKey({
      name: 'WordHistory_fk_World',
      columns: [t.worldId],
      foreignColumns: [world.id],
    }),
  ],
);

export const scoreContent = mysqlTable(
  'ScoreContent',
  {
    id: int('ID').notNull(),
    wordHistoryId: int('WordHistoryID').notNull(),
    answer: varchar('Answer', { length: 255 }).notNull(),
    attempts: longtext('Attempts').notNull(),
    isCustom: tinyint('IsCustom').default(0).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.id] }),
    index('ScoreContent_idx_WordHistoryID').on(t.wordHistoryId),
    foreignKey({
      name: 'ScoreContent_fk_Message',
      columns: [t.id],
      foreignColumns: [message.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'ScoreContent_fk_WordHistory',
      columns: [t.wordHistoryId],
      foreignColumns: [wordHistory.id],
    }),
    check('ScoreContent_chk_1', sql`json_valid(\`Attempts\`)`),
  ],
);

export const tryTable = mysqlTable(
  'Try',
  {
    playerId: int('PlayerID').notNull(),
    wordHistoryId: int('WordHistoryID').notNull(),
    attempts: longtext('Attempts').notNull(),
    win: tinyint('Win').default(0).notNull(),
    attemptCount: int('AttemptCount').default(0).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.playerId, t.wordHistoryId] }),
    index('Try_idx_WordHistory').on(t.wordHistoryId),
    foreignKey({
      name: 'Try_fk_Player',
      columns: [t.playerId],
      foreignColumns: [player.id],
    }).onDelete('cascade'),
    foreignKey({
      name: 'Try_fk_WordHistory',
      columns: [t.wordHistoryId],
      foreignColumns: [wordHistory.id],
    }).onDelete('cascade'),
    check('Try_chk_1', sql`json_valid(\`Attempts\`)`),
  ],
);

export const schema = {
  player,
  world,
  dictionary,
  minecraftWord,
  minecraftSolution,
  message,
  textContent,
  wordHistory,
  scoreContent,
  try: tryTable,
};
