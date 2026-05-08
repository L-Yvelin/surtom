-- Phase 2: backfill WorldID and ScoreContent.WordHistoryID for legacy rows.
-- All existing data was produced before multi-world support, so it belongs to 'fr'.
-- Idempotent: only touches NULLs.

UPDATE `WordHistory` SET `WorldID` = 'fr' WHERE `WorldID` IS NULL;

UPDATE `Message` SET `WorldID` = 'fr' WHERE `WorldID` IS NULL;

UPDATE `ScoreContent` sc
JOIN `Message` m ON m.`ID` = sc.`ID`
JOIN `WordHistory` wh
  ON DATE(m.`Timestamp`) = DATE(wh.`AssignedDate`)
  AND wh.`WorldID` = 'fr'
SET sc.`WordHistoryID` = wh.`ID`
WHERE sc.`WordHistoryID` IS NULL;
