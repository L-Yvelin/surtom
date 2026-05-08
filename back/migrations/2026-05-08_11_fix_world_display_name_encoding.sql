-- Fix mojibake on World.DisplayName.
-- Older docker-entrypoint imports applied 01-schema.sql through a Latin-1 client
-- connection, double-encoding UTF-8 bytes (e.g. "Français" -> "FranÃ§ais"). The
-- only persistent affected row is 'fr'. Idempotent: only updates if mojibake is
-- present.

SET NAMES utf8mb4;

UPDATE `World`
SET    `DisplayName` = 'Français'
WHERE  `ID` = 'fr'
  AND  `DisplayName` <> 'Français';
