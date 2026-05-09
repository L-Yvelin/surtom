CREATE TABLE `Dictionary` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`Language` varchar(8) NOT NULL,
	`Word` varchar(255) NOT NULL,
	CONSTRAINT `Dictionary_ID_pk` PRIMARY KEY(`ID`),
	CONSTRAINT `Dictionary_uk_Language_Word` UNIQUE(`Language`,`Word`)
);
--> statement-breakpoint
CREATE TABLE `Message` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`PlayerID` int NOT NULL,
	`WorldID` varchar(32) NOT NULL,
	`Timestamp` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`Type` enum('TEXT','ENHANCED','SCORE') NOT NULL DEFAULT 'TEXT',
	`Deleted` tinyint DEFAULT 0,
	CONSTRAINT `Message_ID_pk` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `MinecraftSolution` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`Language` varchar(8) NOT NULL,
	`Word` varchar(255) NOT NULL,
	`Rotation` int NOT NULL DEFAULT 0,
	`AssignedDate` date,
	CONSTRAINT `MinecraftSolution_ID_pk` PRIMARY KEY(`ID`),
	CONSTRAINT `MinecraftSolution_uk_Language_Word` UNIQUE(`Language`,`Word`)
);
--> statement-breakpoint
CREATE TABLE `MinecraftWord` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`Language` varchar(8) NOT NULL,
	`Word` varchar(255) NOT NULL,
	CONSTRAINT `MinecraftWord_ID_pk` PRIMARY KEY(`ID`),
	CONSTRAINT `MinecraftWord_uk_Language_Word` UNIQUE(`Language`,`Word`)
);
--> statement-breakpoint
CREATE TABLE `Player` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`Username` varchar(255) NOT NULL,
	`Password` varchar(255) NOT NULL,
	`SessionHash` varchar(255),
	`RegistrationDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`IsAdmin` tinyint NOT NULL DEFAULT 0,
	`IsBanned` int NOT NULL DEFAULT 0,
	CONSTRAINT `Player_ID_pk` PRIMARY KEY(`ID`),
	CONSTRAINT `Username` UNIQUE(`Username`)
);
--> statement-breakpoint
CREATE TABLE `ScoreContent` (
	`ID` int NOT NULL,
	`WordHistoryID` int NOT NULL,
	`Answer` varchar(255) NOT NULL,
	`Attempts` longtext NOT NULL,
	`IsCustom` tinyint NOT NULL DEFAULT 0,
	CONSTRAINT `ScoreContent_ID_pk` PRIMARY KEY(`ID`),
	CONSTRAINT `ScoreContent_chk_1` CHECK(json_valid(`Attempts`))
);
--> statement-breakpoint
CREATE TABLE `TextContent` (
	`ID` int NOT NULL,
	`Text` longtext NOT NULL,
	`ImageData` longtext,
	`ReplyID` int,
	CONSTRAINT `TextContent_ID_pk` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `Try` (
	`PlayerID` int NOT NULL,
	`WordHistoryID` int NOT NULL,
	`Attempts` longtext NOT NULL,
	`Win` tinyint NOT NULL DEFAULT 0,
	`AttemptCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `Try_PlayerID_WordHistoryID_pk` PRIMARY KEY(`PlayerID`,`WordHistoryID`),
	CONSTRAINT `Try_chk_1` CHECK(json_valid(`Attempts`))
);
--> statement-breakpoint
CREATE TABLE `WordHistory` (
	`ID` int AUTO_INCREMENT NOT NULL,
	`WorldID` varchar(32) NOT NULL,
	`WordID` int NOT NULL,
	`AssignedDate` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `WordHistory_ID_pk` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
CREATE TABLE `World` (
	`ID` varchar(32) NOT NULL,
	`DisplayName` varchar(255) NOT NULL,
	`Language` varchar(8) NOT NULL,
	CONSTRAINT `World_ID_pk` PRIMARY KEY(`ID`)
);
--> statement-breakpoint
ALTER TABLE `Message` ADD CONSTRAINT `Message_fk_Player` FOREIGN KEY (`PlayerID`) REFERENCES `Player`(`ID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Message` ADD CONSTRAINT `Message_fk_World` FOREIGN KEY (`WorldID`) REFERENCES `World`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ScoreContent` ADD CONSTRAINT `ScoreContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message`(`ID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ScoreContent` ADD CONSTRAINT `ScoreContent_fk_WordHistory` FOREIGN KEY (`WordHistoryID`) REFERENCES `WordHistory`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `TextContent` ADD CONSTRAINT `TextContent_fk_Message` FOREIGN KEY (`ID`) REFERENCES `Message`(`ID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `TextContent` ADD CONSTRAINT `TextContent_fk_Reply` FOREIGN KEY (`ReplyID`) REFERENCES `Message`(`ID`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Try` ADD CONSTRAINT `Try_fk_Player` FOREIGN KEY (`PlayerID`) REFERENCES `Player`(`ID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `Try` ADD CONSTRAINT `Try_fk_WordHistory` FOREIGN KEY (`WordHistoryID`) REFERENCES `WordHistory`(`ID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `WordHistory` ADD CONSTRAINT `WordHistory_fk_MinecraftSolution` FOREIGN KEY (`WordID`) REFERENCES `MinecraftSolution`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `WordHistory` ADD CONSTRAINT `WordHistory_fk_World` FOREIGN KEY (`WorldID`) REFERENCES `World`(`ID`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `PlayerID` ON `Message` (`PlayerID`);--> statement-breakpoint
CREATE INDEX `Message_idx_WorldID_Timestamp` ON `Message` (`WorldID`,`Timestamp`);--> statement-breakpoint
CREATE INDEX `MinecraftSolution_idx_Language_Rotation` ON `MinecraftSolution` (`Language`,`Rotation`);--> statement-breakpoint
CREATE INDEX `ScoreContent_idx_WordHistoryID` ON `ScoreContent` (`WordHistoryID`);--> statement-breakpoint
CREATE INDEX `ReplyID` ON `TextContent` (`ReplyID`);--> statement-breakpoint
CREATE INDEX `Try_idx_WordHistory` ON `Try` (`WordHistoryID`);--> statement-breakpoint
CREATE INDEX `WordID` ON `WordHistory` (`WordID`);--> statement-breakpoint
CREATE INDEX `WordHistory_idx_WorldID_AssignedDate` ON `WordHistory` (`WorldID`,`AssignedDate`);--> statement-breakpoint
CREATE INDEX `World_idx_Language` ON `World` (`Language`);