-- Phase 2.5: create the three language-keyed words tables.
--   Dictionary        \u2014 every word the player can submit as a try (full language dictionary).
--   MinecraftWord     \u2014 theme words including plurals, valid as inputs.
--   MinecraftSolution \u2014 the rotation pool (theme nouns, non-plural) used to pick the daily solution.
-- All three are partitioned by Language. WordHistory.WordID will retarget MinecraftSolution.ID.
-- Idempotent: re-running this file is a no-op.

CREATE TABLE IF NOT EXISTS `Dictionary` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Language` varchar(8) NOT NULL,
  `Word` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Dictionary_uk_Language_Word` (`Language`, `Word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `MinecraftWord` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Language` varchar(8) NOT NULL,
  `Word` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `MinecraftWord_uk_Language_Word` (`Language`, `Word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `MinecraftSolution` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Language` varchar(8) NOT NULL,
  `Word` varchar(255) NOT NULL,
  `Rotation` int NOT NULL DEFAULT '0',
  `AssignedDate` date DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `MinecraftSolution_uk_Language_Word` (`Language`, `Word`),
  KEY `MinecraftSolution_idx_Language_Rotation` (`Language`, `Rotation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
