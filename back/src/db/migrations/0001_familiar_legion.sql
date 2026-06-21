CREATE TABLE `ChatRead` (
	`PlayerID` int NOT NULL,
	`WorldID` varchar(32) NOT NULL,
	`LastReadAt` datetime NOT NULL,
	CONSTRAINT `ChatRead_PlayerID_WorldID_pk` PRIMARY KEY(`PlayerID`,`WorldID`)
);
--> statement-breakpoint
ALTER TABLE `ChatRead` ADD CONSTRAINT `ChatRead_fk_Player` FOREIGN KEY (`PlayerID`) REFERENCES `Player`(`ID`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ChatRead` ADD CONSTRAINT `ChatRead_fk_World` FOREIGN KEY (`WorldID`) REFERENCES `World`(`ID`) ON DELETE no action ON UPDATE no action;