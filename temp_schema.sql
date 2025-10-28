/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.5.26-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: 127.0.0.1    Database: surtom
-- ------------------------------------------------------
-- Server version	10.5.26-MariaDB-0+deb11u2-log

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
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
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Message` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `PlayerID` int(11) NOT NULL,
  `Timestamp` datetime NOT NULL,
  `Type` enum('MAIL_ALL','ENHANCED_MESSAGE','SCORE') NOT NULL,
  `Deleted` tinyint(4) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `PlayerID` (`PlayerID`),
  CONSTRAINT `Message_fk_Player` FOREIGN KEY (`PlayerID`) REFERENCES `Player` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=53621 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MessageImages`
--

DROP TABLE IF EXISTS `MessageImages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MessageImages` (
  `ImageID` int(11) NOT NULL AUTO_INCREMENT,
  `MessageID` int(11) NOT NULL,
  `ImageData` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `CreatedAt` datetime NOT NULL ,
  PRIMARY KEY (`ImageID`),
  KEY `MessageID` (`MessageID`),
  CONSTRAINT `MessageImages_ibfk_1` FOREIGN KEY (`MessageID`) REFERENCES `Messages` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=68 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Messages`
--

DROP TABLE IF EXISTS `Messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Messages` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Pseudo` varchar(255) NOT NULL,
  `Texte` longtext NOT NULL,
  `Date` datetime NOT NULL ,
  `Moderator` tinyint(1) NOT NULL DEFAULT 0,
  `Type` enum('score','message','enhancedMessage') NOT NULL DEFAULT 'message',
  `Supprime` tinyint(1) NOT NULL DEFAULT 0,
  `Reply` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `fk_messages_answer` (`Reply`) USING BTREE,
  CONSTRAINT `fk_messages_answer` FOREIGN KEY (`Reply`) REFERENCES `Messages` (`ID`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=53645 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotFrancais`
--

DROP TABLE IF EXISTS `MotFrancais`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MotFrancais` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `MotFrancais` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=653022 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotMinecraft`
--

DROP TABLE IF EXISTS `MotMinecraft`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MotMinecraft` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `MotMinecraft` varchar(255) NOT NULL,
  `Date` date DEFAULT NULL,
  `Rotation` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=305 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotMinecraftValide`
--

DROP TABLE IF EXISTS `MotMinecraftValide`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MotMinecraftValide` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `MotMinecraftValide` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=339 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `MotValideCombine`
--

DROP TABLE IF EXISTS `MotValideCombine`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `MotValideCombine` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `MotValide` varchar(255) NOT NULL DEFAULT '',
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=406901 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Player`
--

DROP TABLE IF EXISTS `Player`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Player` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Username` varchar(255) NOT NULL,
  `Password` varchar(255) NOT NULL,
  `SessionHash` varchar(255) DEFAULT NULL,
  `RegistrationDate` date NOT NULL ,
  `IsAdmin` tinyint(1) NOT NULL DEFAULT 0,
  `IsBanned` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `Username` (`Username`)
) ENGINE=InnoDB AUTO_INCREMENT=132 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Score`
--

DROP TABLE IF EXISTS `Score`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Score` (
  `Mots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`Mots`)),
  `Date` date NOT NULL ,
  `Surtomien` varchar(255) NOT NULL,
  PRIMARY KEY (`Date`,`Surtomien`),
  KEY `fk_Score_SurtomienID` (`Surtomien`),
  CONSTRAINT `fk_Score_SurtomienID` FOREIGN KEY (`Surtomien`) REFERENCES `Surtomien` (`Pseudo`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ScoreContent`
--

DROP TABLE IF EXISTS `ScoreContent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ScoreContent` (
  `ID` int(11) NOT NULL,
  `Answer` varchar(255) NOT NULL,
  `Attempts` longtext NOT NULL CHECK (json_valid(`Attempts`)),
  `IsCustom` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  CONSTRAINT `ScoreContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `ScoreData`
--

DROP TABLE IF EXISTS `ScoreData`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `ScoreData` (
  `MessageID` int(11) NOT NULL,
  `Couleurs` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Couleurs`)),
  `Mots` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`Mots`)),
  `Answer` varchar(255) DEFAULT NULL,
  `Attempts` int(11) DEFAULT NULL,
  `Custom` tinyint(4) NOT NULL DEFAULT 0,
  PRIMARY KEY (`MessageID`),
  CONSTRAINT `ScoreData_ibfk_1` FOREIGN KEY (`MessageID`) REFERENCES `Messages` (`ID`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Surtomien`
--

DROP TABLE IF EXISTS `Surtomien`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Surtomien` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `Pseudo` varchar(255) NOT NULL,
  `MotDePasse` varchar(255) NOT NULL,
  `HashSession` varchar(255) DEFAULT NULL,
  `DateInscription` date NOT NULL ,
  `Admin` tinyint(1) NOT NULL DEFAULT 0,
  `lastIp` varchar(20) DEFAULT NULL,
  `banned` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`ID`),
  UNIQUE KEY `uq_surtomien_pseudo` (`Pseudo`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `TextContent`
--

DROP TABLE IF EXISTS `TextContent`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `TextContent` (
  `ID` int(11) NOT NULL,
  `Text` longtext NOT NULL,
  `ImageData` longtext DEFAULT NULL,
  `ReplyID` int(11) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `ReplyID` (`ReplyID`),
  CONSTRAINT `TextContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message` (`ID`) ON DELETE CASCADE,
  CONSTRAINT `TextContent_fk_Reply` FOREIGN KEY (`ReplyID`) REFERENCES `Message` (`ID`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `WordHistory`
--

DROP TABLE IF EXISTS `WordHistory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `WordHistory` (
  `ID` int(11) NOT NULL AUTO_INCREMENT,
  `WordID` int(11) NOT NULL,
  `AssignedDate` date NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `WordID` (`WordID`),
  CONSTRAINT `WordHistory_ibfk_1` FOREIGN KEY (`WordID`) REFERENCES `MotMinecraft` (`ID`)
) ENGINE=InnoDB AUTO_INCREMENT=502 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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

-- Dump completed on 2025-06-27 21:58:59
