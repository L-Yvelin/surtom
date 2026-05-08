-- Phase 2.5: retarget WordHistory.WordID foreign key from legacy MotMinecraft to MinecraftSolution.
-- Idempotent: each step is guarded by INFORMATION_SCHEMA checks.

SET @fk_legacy_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'WordHistory' AND CONSTRAINT_NAME = 'WordHistory_ibfk_1');
SET @sql := IF(@fk_legacy_exists = 1,
  'ALTER TABLE `WordHistory` DROP FOREIGN KEY `WordHistory_ibfk_1`',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk_new_exists := (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'WordHistory' AND CONSTRAINT_NAME = 'WordHistory_fk_MinecraftSolution');
SET @sql := IF(@fk_new_exists = 0,
  'ALTER TABLE `WordHistory` ADD CONSTRAINT `WordHistory_fk_MinecraftSolution` FOREIGN KEY (`WordID`) REFERENCES `MinecraftSolution` (`ID`)',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
