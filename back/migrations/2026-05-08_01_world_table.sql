-- Phase 1.a: Multi-world DB integration — create World table for permanent server-defined worlds.
-- Ephemeral, user-created worlds are in-memory only and never appear in this table.
-- Idempotent: re-running this file is a no-op.

CREATE TABLE IF NOT EXISTS `World` (
  `ID` varchar(32) NOT NULL,
  `DisplayName` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `World` (`ID`, `DisplayName`) VALUES
  ('fr', 'Français');
