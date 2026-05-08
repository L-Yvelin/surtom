-- Phase 5: tighten NOT NULL on WorldID columns and ScoreContent.WordHistoryID.
-- Safe to run only AFTER 2026-05-08_04_backfill_worldid.sql.
-- Idempotent: only fires when the column is still nullable.
-- Will fail loudly if any leftover NULLs remain — that's intentional, so an
-- operator can investigate before forcing the constraint.

-- WordHistory.WorldID
SET @nullable := (SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'WordHistory' AND COLUMN_NAME = 'WorldID');
SET @sql := IF(@nullable = 'YES',
  'ALTER TABLE `WordHistory` MODIFY COLUMN `WorldID` varchar(32) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Message.WorldID
SET @nullable := (SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Message' AND COLUMN_NAME = 'WorldID');
SET @sql := IF(@nullable = 'YES',
  'ALTER TABLE `Message` MODIFY COLUMN `WorldID` varchar(32) NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ScoreContent.WordHistoryID
-- MySQL 8 InnoDB refuses to MODIFY a FK-referenced column in place, even just to
-- toggle nullability — drop the FK, change the column, re-add the FK.
SET @nullable := (SELECT IS_NULLABLE FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ScoreContent' AND COLUMN_NAME = 'WordHistoryID');

SET @fk_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ScoreContent' AND CONSTRAINT_NAME = 'ScoreContent_fk_WordHistory');
SET @sql := IF(@nullable = 'YES' AND @fk_exists = 1,
  'ALTER TABLE `ScoreContent` DROP FOREIGN KEY `ScoreContent_fk_WordHistory`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @sql := IF(@nullable = 'YES',
  'ALTER TABLE `ScoreContent` MODIFY COLUMN `WordHistoryID` int NOT NULL',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ScoreContent' AND CONSTRAINT_NAME = 'ScoreContent_fk_WordHistory');
SET @sql := IF(@fk_exists = 0,
  'ALTER TABLE `ScoreContent` ADD CONSTRAINT `ScoreContent_fk_WordHistory` FOREIGN KEY (`WordHistoryID`) REFERENCES `WordHistory` (`ID`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
