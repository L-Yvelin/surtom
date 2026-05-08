/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
SET NAMES utf8mb4;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

CREATE TABLE IF NOT EXISTS `Player` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `SessionHash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `RegistrationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `IsAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `IsBanned` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `World` (
  `ID` varchar(32) NOT NULL,
  `DisplayName` varchar(255) NOT NULL,
  `Language` varchar(8) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `World_idx_Language` (`Language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `World` (`ID`, `DisplayName`, `Language`) VALUES ('fr', 'Français', 'fr');
INSERT IGNORE INTO `World` (`ID`, `DisplayName`, `Language`) VALUES ('en', 'English', 'en');

CREATE TABLE IF NOT EXISTS `Dictionary` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Language` varchar(8) NOT NULL,
  `Word` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Dictionary_uk_Language_Word` (`Language`,`Word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `MinecraftWord` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Language` varchar(8) NOT NULL,
  `Word` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `MinecraftWord_uk_Language_Word` (`Language`,`Word`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `MinecraftSolution` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Language` varchar(8) NOT NULL,
  `Word` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Rotation` int NOT NULL DEFAULT '0',
  `AssignedDate` date DEFAULT NULL,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `MinecraftSolution_uk_Language_Word` (`Language`,`Word`),
  KEY `MinecraftSolution_idx_Language_Rotation` (`Language`,`Rotation`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `Message` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `PlayerID` int NOT NULL,
  `WorldID` varchar(32) NOT NULL,
  `Timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Type` enum('TEXT','ENHANCED','SCORE') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'TEXT',
  `Deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `PlayerID` (`PlayerID`),
  KEY `Message_idx_WorldID_Timestamp` (`WorldID`,`Timestamp`),
  CONSTRAINT `Message_fk_Player` FOREIGN KEY (`PlayerID`) REFERENCES `Player` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `Message_fk_World` FOREIGN KEY (`WorldID`) REFERENCES `World` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `TextContent` (
  `ID` int NOT NULL,
  `Text` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `ImageData` longtext COLLATE utf8mb4_general_ci,
  `ReplyID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ReplyID` (`ReplyID`),
  CONSTRAINT `TextContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TextContent_fk_Reply` FOREIGN KEY (`ReplyID`) REFERENCES `Message` (`ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `ScoreContent` (
  `ID` int NOT NULL,
  `WordHistoryID` int NOT NULL,
  `Answer` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Attempts` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `IsCustom` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `ScoreContent_idx_WordHistoryID` (`WordHistoryID`),
  CONSTRAINT `ScoreContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `ScoreContent_fk_WordHistory` FOREIGN KEY (`WordHistoryID`) REFERENCES `WordHistory` (`ID`),
  CONSTRAINT `ScoreContent_chk_1` CHECK (json_valid(`Attempts`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `WordHistory` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `WorldID` varchar(32) NOT NULL,
  `WordID` int NOT NULL,
  `AssignedDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ID`),
  KEY `WordID` (`WordID`),
  KEY `WordHistory_idx_WorldID_AssignedDate` (`WorldID`,`AssignedDate`),
  CONSTRAINT `WordHistory_fk_MinecraftSolution` FOREIGN KEY (`WordID`) REFERENCES `MinecraftSolution` (`ID`),
  CONSTRAINT `WordHistory_fk_World` FOREIGN KEY (`WorldID`) REFERENCES `World` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE IF NOT EXISTS `Try` (
  `PlayerID` int NOT NULL,
  `WordHistoryID` int NOT NULL,
  `Attempts` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `Win` tinyint(1) NOT NULL DEFAULT '0',
  `AttemptCount` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`PlayerID`,`WordHistoryID`),
  KEY `Try_fk_WordHistory` (`WordHistoryID`),
  CONSTRAINT `Try_fk_Player` FOREIGN KEY (`PlayerID`) REFERENCES `Player` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `Try_fk_WordHistory` FOREIGN KEY (`WordHistoryID`) REFERENCES `WordHistory` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `Try_chk_1` CHECK (json_valid(`Attempts`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
