-- Phase 2.5: backfill the three new language-keyed tables from the legacy ones.
-- All legacy data is French, so it's stamped Language='fr'.
-- ID preservation matters for MinecraftSolution because WordHistory.WordID points there.
-- Idempotent: INSERT IGNORE skips duplicates by (Language, Word) unique key.

INSERT IGNORE INTO `MinecraftSolution` (`ID`, `Language`, `Word`, `Rotation`, `AssignedDate`)
SELECT `ID`, 'fr', `MotMinecraft`, `Rotation`, `Date` FROM `MotMinecraft`;

INSERT IGNORE INTO `MinecraftWord` (`Language`, `Word`)
SELECT 'fr', `MotMinecraftValide` FROM `MotMinecraftValide`;

INSERT IGNORE INTO `Dictionary` (`Language`, `Word`)
SELECT 'fr', `MotFrancais` FROM `MotFrancais`;
