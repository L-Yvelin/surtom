-- Phase 2.5: drop the legacy single-language word tables now that data lives in
-- Dictionary / MinecraftWord / MinecraftSolution and WordHistory points at the new pool.
-- Idempotent: DROP TABLE IF EXISTS is a no-op once already dropped.

DROP TABLE IF EXISTS `MotFrancais`;
DROP TABLE IF EXISTS `MotMinecraftValide`;
DROP TABLE IF EXISTS `MotMinecraft`;
