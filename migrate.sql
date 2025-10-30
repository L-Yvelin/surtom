SET SESSION sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';
SET SESSION group_concat_max_len = 1000000;
START TRANSACTION;

DROP TABLE IF EXISTS TextContent;
DROP TABLE IF EXISTS ScoreContent;
DROP TABLE IF EXISTS Message;
DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Try;

CREATE TABLE Player (
  ID INT NOT NULL AUTO_INCREMENT,
  Username VARCHAR(255) NOT NULL,
  Password VARCHAR(255) NOT NULL,
  SessionHash VARCHAR(255) DEFAULT NULL,
  RegistrationDate DATE NOT NULL ,
  IsAdmin TINYINT(1) NOT NULL DEFAULT 0,
  IsBanned INT NOT NULL DEFAULT 0,
  PRIMARY KEY (ID),
  UNIQUE KEY (Username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO Player (ID, Username, Password, SessionHash, RegistrationDate, IsAdmin, IsBanned)
SELECT
  ID,
  Pseudo,
  MotDePasse,
  HashSession,
  DateInscription,
  Admin,
  banned
FROM Surtomien;

INSERT IGNORE INTO Player (Username, Password, RegistrationDate, IsAdmin, IsBanned)
SELECT DISTINCT Pseudo, '', CURRENT_DATE, 0, 0
FROM Messages
WHERE Pseudo NOT IN (SELECT Username FROM Player);

CREATE TABLE Message (
  ID INT NOT NULL AUTO_INCREMENT,
  PlayerID INT NOT NULL,
  Timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Type ENUM('TEXT', 'ENHANCED', 'SCORE') NOT NULL DEFAULT 'TEXT',
  Deleted TINYINT(4) DEFAULT 0,
  PRIMARY KEY (ID),
  KEY PlayerID (PlayerID),
  CONSTRAINT Message_fk_Player FOREIGN KEY (PlayerID) REFERENCES Player (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE TextContent (
  ID INT NOT NULL,
  Text LONGTEXT NOT NULL,
  ImageData LONGTEXT DEFAULT NULL,
  ReplyID INT DEFAULT NULL,
  PRIMARY KEY (ID),
  KEY ReplyID (ReplyID),
  CONSTRAINT TextContent_fk_Message FOREIGN KEY (ID) REFERENCES Message (ID) ON DELETE CASCADE,
  CONSTRAINT TextContent_fk_Reply FOREIGN KEY (ReplyID) REFERENCES Message (ID) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE ScoreContent (
  ID INT NOT NULL,
  Answer VARCHAR(255) NOT NULL,
  Attempts LONGTEXT NOT NULL CHECK (json_valid(Attempts)),
  IsCustom TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (ID),
  CONSTRAINT ScoreContent_fk_Message FOREIGN KEY (ID) REFERENCES Message (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

CREATE TABLE Try (
  PlayerID INT NOT NULL,
  WordHistoryID INT NOT NULL,
  Attempts LONGTEXT NOT NULL CHECK (json_valid(Attempts)),
  Win BOOLEAN NOT NULL DEFAULT FALSE,
  AttemptCount INT NOT NULL DEFAULT 0,
  PRIMARY KEY (PlayerID, WordHistoryID),
  CONSTRAINT Try_fk_Player FOREIGN KEY (PlayerID) REFERENCES Player (ID) ON DELETE CASCADE,
  CONSTRAINT Try_fk_WordHistory FOREIGN KEY (WordHistoryID) REFERENCES WordHistory (ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT INTO Message (ID, PlayerID, Timestamp, Type, Deleted)
SELECT 
  CAST(ID AS UNSIGNED),
  (SELECT ID FROM Player WHERE Username = Messages.Pseudo LIMIT 1),
  `Date`,
  CASE Type
    WHEN 'message' THEN 'TEXT'
    WHEN 'enhancedMessage' THEN 'ENHANCED'
  END,
  Supprime
FROM Messages
WHERE Type IN ('message', 'enhancedMessage')
  AND Pseudo IN (SELECT Username FROM Player);

INSERT INTO TextContent (ID, Text, ImageData, ReplyID)
SELECT
  CAST(m.ID AS UNSIGNED),
  m.Texte,
  GROUP_CONCAT(mi.ImageData SEPARATOR ','),
  CASE 
    WHEN m.Reply IS NULL THEN NULL
    WHEN EXISTS (SELECT 1 FROM Messages r WHERE r.ID = m.Reply AND r.Type IN ('message','enhancedMessage')) 
    THEN CAST(m.Reply AS UNSIGNED)
    ELSE NULL
  END
FROM Messages m
LEFT JOIN MessageImages mi ON mi.MessageID = m.ID
WHERE m.Type IN ('message', 'enhancedMessage')
GROUP BY m.ID;

INSERT INTO Message (ID, PlayerID, Timestamp, Type, Deleted)
SELECT 
  CAST(ID AS UNSIGNED),
  (SELECT ID FROM Player WHERE Username = Messages.Pseudo LIMIT 1),
  `Date`,
  'SCORE',
  Supprime
FROM Messages
WHERE Type = 'score'
  AND Pseudo IN (SELECT Username FROM Player);

INSERT INTO ScoreContent (ID, Answer, Attempts, IsCustom)
SELECT
  CAST(sc.MessageID AS UNSIGNED),
  COALESCE(sc.Answer, ''),
  COALESCE(sc.Mots, '[]'),
  sc.Custom
FROM ScoreData sc
JOIN Messages m ON m.ID = sc.MessageID
WHERE m.Type = 'score';

INSERT INTO Try (PlayerID, WordHistoryID, Attempts, Win, AttemptCount)
SELECT
  m.PlayerID,
  wh.ID AS WordHistoryID,
  sc.Attempts,
  CASE
    WHEN JSON_LENGTH(sc.Attempts) > 0
    THEN JSON_UNQUOTE(JSON_EXTRACT(sc.Attempts, CONCAT('$[', JSON_LENGTH(sc.Attempts) - 1, ']'))) = sc.Answer
    ELSE 0
  END AS Win,
  JSON_LENGTH(sc.Attempts) AS AttemptCount
FROM (
  SELECT
    m.ID,
    m.PlayerID,
    DATE(m.Timestamp) AS Day,
    MIN(m.Timestamp) AS MinTime
  FROM Message m
  WHERE m.Type = 'SCORE'
  GROUP BY m.PlayerID, DATE(m.Timestamp)
) firsts
JOIN Message m ON m.ID = firsts.ID
JOIN ScoreContent sc ON sc.ID = m.ID
JOIN MotMinecraft mm ON mm.MotMinecraft = sc.Answer
JOIN WordHistory wh ON wh.WordID = mm.ID AND wh.AssignedDate = DATE(m.Timestamp);

COMMIT;