-- Phase: add World.Language so world->language is explicit (not inferred from World.ID).
-- Idempotent: safe to re-run.

-- 1. Add Language column (nullable so we can backfill before tightening).
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'World' AND COLUMN_NAME = 'Language');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `World` ADD COLUMN `Language` varchar(8) NULL AFTER `DisplayName`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Backfill: previous convention was World.ID == language code.
UPDATE `World` SET `Language` = `ID` WHERE `Language` IS NULL;

-- 3. Tighten to NOT NULL once all rows are populated.
SET @nullable := (SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'World' AND COLUMN_NAME = 'Language');
SET @sql := IF(@nullable = 'YES',
  'ALTER TABLE `World` MODIFY COLUMN `Language` varchar(8) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 4. Index on Language for grouping (e.g. listing worlds per language).
SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'World' AND INDEX_NAME = 'World_idx_Language');
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX `World_idx_Language` ON `World` (`Language`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 5. Seed the persistent server worlds. INSERT IGNORE keeps re-runs safe.
INSERT IGNORE INTO `World` (`ID`, `DisplayName`, `Language`) VALUES ('fr', 'Français', 'fr');
INSERT IGNORE INTO `World` (`ID`, `DisplayName`, `Language`) VALUES ('en', 'English', 'en');
