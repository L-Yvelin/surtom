-- MySQL dump 10.13  Distrib 8.0.42, for Linux (x86_64)
--
-- Host: localhost    Database: surtom
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Message`
--

DROP TABLE IF EXISTS `Message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Message` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `PlayerID` int NOT NULL,
  `Timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `Type` enum('TEXT','ENHANCED','SCORE') COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'TEXT',
  `Deleted` tinyint DEFAULT '0',
  PRIMARY KEY (`ID`),
  KEY `PlayerID` (`PlayerID`),
  CONSTRAINT `Message_fk_Player` FOREIGN KEY (`PlayerID`) REFERENCES `Player` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=54398 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotFrancais`
--

DROP TABLE IF EXISTS `MotFrancais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MotFrancais` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MotFrancais` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=653022 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotMinecraft`
--

DROP TABLE IF EXISTS `MotMinecraft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MotMinecraft` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MotMinecraft` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Date` date DEFAULT NULL,
  `Rotation` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotMinecraftValide`
--

DROP TABLE IF EXISTS `MotMinecraftValide`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MotMinecraftValide` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MotMinecraftValide` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=339 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotValideCombine`
--

DROP TABLE IF EXISTS `MotValideCombine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `MotValideCombine` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `MotValide` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=406901 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Player`
--

DROP TABLE IF EXISTS `Player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Player` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `SessionHash` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `RegistrationDate` date NOT NULL,
  `IsAdmin` tinyint(1) NOT NULL DEFAULT '0',
  `IsBanned` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=154 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ScoreContent`
--

DROP TABLE IF EXISTS `ScoreContent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ScoreContent` (
  `ID` int NOT NULL,
  `Answer` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `Attempts` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `IsCustom` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`ID`),
  CONSTRAINT `ScoreContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `ScoreContent_chk_1` CHECK (json_valid(`Attempts`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TextContent`
--

DROP TABLE IF EXISTS `TextContent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `TextContent` (
  `ID` int NOT NULL,
  `Text` longtext COLLATE utf8mb4_general_ci NOT NULL,
  `ImageData` longtext COLLATE utf8mb4_general_ci,
  `ReplyID` int DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ReplyID` (`ReplyID`),
  CONSTRAINT `TextContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TextContent_fk_Reply` FOREIGN KEY (`ReplyID`) REFERENCES `Message` (`ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Try`
--

DROP TABLE IF EXISTS `Try`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Try` (
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WordHistory`
--

DROP TABLE IF EXISTS `WordHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `WordHistory` (
  `ID` int NOT NULL AUTO_INCREMENT,
  `WordID` int NOT NULL,
  `AssignedDate` date NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `WordID` (`WordID`),
  CONSTRAINT `WordHistory_ibfk_1` FOREIGN KEY (`WordID`) REFERENCES `MotMinecraft` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=610 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping routines for database 'surtom'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-30 19:03:09
