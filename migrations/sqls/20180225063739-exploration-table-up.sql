CREATE SCHEMA exploration;

/* Creating table exploration.zones */
CREATE TABLE exploration.zones (
	id SERIAL PRIMARY KEY,
	zone_name VARCHAR(20),
	zone_level INTEGER,
	zone_cap INTEGER,
	zone_timeout INTERVAL,
	open BOOLEAN
);

/* Creating table exploration.zone_history */
CREATE TABLE exploration.zone_history (
	id SERIAL PRIMARY KEY,
	zone_id INTEGER NOT NULL,
	player_id INTEGER NOT NULL,
	entry TIMESTAMPTZ,
	exit TIMESTAMPTZ,
	budget INTERVAL NOT NULL,
	FOREIGN KEY (zone_id) REFERENCES exploration.zones (id),
	FOREIGN KEY (player_id) REFERENCES decker.players (id)
);

/* Creating table exploration.zone_status */
CREATE TABLE exploration.zone_status (
	player_id INTEGER NOT NULL,
	zone_id INTEGER NOT NULL,
	entry TIMESTAMPTZ,
	timeout INTERVAL NOT NULL,
	UNIQUE (player_id),
	FOREIGN KEY (player_id) REFERENCES decker.players (id),
	FOREIGN KEY (zone_id) REFERENCES exploration.zones (id)
);

/* Populating table exploration.zones */
INSERT INTO exploration.zones (zone_name, zone_level, zone_cap, zone_timeout, open) VALUES 
('haven', 0, 100, '3600', 'true'),
('void', 1, 100, '1200','true'),
('bionics', 4, 3, '800', 'true'),
('pharmaceuticals', 8, 1, '300','false');

/* Update zone status function */
CREATE OR REPLACE FUNCTION exploration.enter_room(
	IN i_userId INTEGER,
	IN i_zoneId INTEGER,
	IN i_entry TIMESTAMPTZ
) RETURNS VOID AS 
$BODY$
DECLARE 
 _timeout INTERVAL := (SELECT zone_timeout FROM exploration.zones ez WHERE i_zoneId = ez.id);
BEGIN
	INSERT INTO exploration.zone_status (player_id, zone_id, entry, timeout) VALUES (i_userId, i_zoneId, i_entry, _timeout)
	ON CONFLICT (player_id) DO UPDATE SET zone_id = i_zoneId, entry = i_entry, timeout = _timeout;
END;
$BODY$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION exploration.log_zone_history()
RETURNS trigger AS 
$BODY$
BEGIN
    INSERT INTO exploration.zone_history (zone_id, player_id, entry, exit, budget) 
		VALUES (OLD.zone_id, OLD.player_id, OLD.entry, now(), (OLD.timeout - (now() - OLD.entry)));
		RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_zone_history ON exploration.zone_status;
CREATE TRIGGER trg_log_zone_history BEFORE UPDATE ON exploration.zone_status
FOR EACH ROW 
WHEN (OLD.zone_id IS DISTINCT FROM NEW.zone_id)
EXECUTE PROCEDURE exploration.log_zone_history();

CREATE OR REPLACE FUNCTION exploration.active_room_timeouts() 
RETURNS TABLE ( 
	zone_id INTEGER,
	zone_name VARCHAR(20),
	player_id INTEGER,
	username VARCHAR(20),
	_timeout INTERVAL) AS
$BODY$
BEGIN 
RETURN QUERY select ezs.zone_id, ez.zone_name, ezs.player_id, dp.username, (ezs.entry - (now() - ezs.timeout)) as _timeout from exploration.zone_status ezs inner join decker.players dp on ezs.player_id = dp.id inner join exploration.zones ez on ez.id = ezs.zone_id order by _timeout ASC;
END;		
$BODY$
LANGUAGE plpgsql;