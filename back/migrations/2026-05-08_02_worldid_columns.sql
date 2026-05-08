-- Phase 1.b: Add WorldID columns + indexes + FKs to WordHistory and Message.
-- Each ALTER is guarded so the script is idempotent.

-- WordHistory.WorldID
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'WordHistory' AND COLUMN_NAME = 'WorldID');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `WordHistory` ADD COLUMN `WorldID` varchar(32) NULL AFTER `ID`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'WordHistory' AND INDEX_NAME = 'WordHistory_idx_WorldID_AssignedDate');
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `WordHistory` ADD KEY `WordHistory_idx_WorldID_AssignedDate` (`WorldID`, `AssignedDate`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'WordHistory' AND CONSTRAINT_NAME = 'WordHistory_fk_World');
SET @sql := IF(@fk_exists = 0,
  'ALTER TABLE `WordHistory` ADD CONSTRAINT `WordHistory_fk_World` FOREIGN KEY (`WorldID`) REFERENCES `World` (`ID`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- Message.WorldID
SET @col_exists := (SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Message' AND COLUMN_NAME = 'WorldID');
SET @sql := IF(@col_exists = 0,
  'ALTER TABLE `Message` ADD COLUMN `WorldID` varchar(32) NULL AFTER `PlayerID`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @idx_exists := (SELECT COUNT(*) FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Message' AND INDEX_NAME = 'Message_idx_WorldID_Timestamp');
SET @sql := IF(@idx_exists = 0,
  'ALTER TABLE `Message` ADD KEY `Message_idx_WorldID_Timestamp` (`WorldID`, `Timestamp`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Message' AND CONSTRAINT_NAME = 'Message_fk_World');
SET @sql := IF(@fk_exists = 0,
  'ALTER TABLE `Message` ADD CONSTRAINT `Message_fk_World` FOREIGN KEY (`WorldID`) REFERENCES `World` (`ID`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
