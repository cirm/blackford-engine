DROP FUNCTION IF EXISTS exploration.enter_room(int, int, timestamptz, int);
DROP FUNCTION IF EXISTS exploration.log_zone_history() CASCADE;
DROP FUNCTION IF EXISTS exploration.active_room_timeouts();
DROP TRIGGER IF EXISTS trg_log_zone_history ON exploration.zone_status;
/* Removing table exploration.zone_history */
DROP TABLE exploration.zone_history CASCADE;
/* Removing table exploration.zone_status */
DROP TABLE exploration.zone_status CASCADE;
/* Removing table exploration.zones */
DROP TABLE exploration.zones CASCADE;
DROP SCHEMA exploration CASCADE;