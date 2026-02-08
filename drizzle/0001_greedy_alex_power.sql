CREATE TABLE `generationHistory` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`sessionId` varchar(36) NOT NULL,
	`generatedNames` json,
	`params` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `names` (
	`id` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`fullName` varchar(255) NOT NULL,
	`pinyin` varchar(255) NOT NULL,
	`gender` enum('male','female','neutral') NOT NULL,
	`source` text,
	`meaning` text,
	`fiveElements` varchar(50),
	`soundAnalysis` text,
	`score` int DEFAULT 90,
	`collected` boolean DEFAULT false,
	`generationParams` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `names_id` PRIMARY KEY(`id`)
);
