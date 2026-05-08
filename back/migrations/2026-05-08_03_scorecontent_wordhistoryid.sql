-- Phase 1.c: Tie ScoreContent rows to a specific WordHistory row.
-- Replaces the date-based "already shared today" check with a per-game predicate.
-- Idempotent.

SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ScoreContent' AND COLUMN_NAME = 'WordHistoryID');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `ScoreContent` ADD COLUMN `WordHistoryID` int NULL AFTER `ID`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ScoreContent' AND INDEX_NAME = 'ScoreContent_idx_WordHistoryID');
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `ScoreContent` ADD KEY `ScoreContent_idx_WordHistoryID` (`WordHistoryID`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ScoreContent' AND CONSTRAINT_NAME = 'ScoreContent_fk_WordHistory');
SET @sql := IF(@fk_exists = 0,
  'ALTER TABLE `ScoreContent` ADD CONSTRAINT `ScoreContent_fk_WordHistory` FOREIGN KEY (`WordHistoryID`) REFERENCES `WordHistory` (`ID`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
