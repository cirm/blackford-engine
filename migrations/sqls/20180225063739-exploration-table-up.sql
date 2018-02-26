/* Creating table decker.zones */
CREATE TABLE decker.zones (
	id SERIAL PRIMARY KEY,
	zone_name VARCHAR(20),
	zone_level INTEGER,
	zone_cap INTEGER,
	open BOOLEAN
);

/* Creating table decker.zone_history */
CREATE TABLE decker.zone_history (
	id SERIAL PRIMARY KEY,
	zone_id INTEGER NOT NULL,
	player_id INTEGER NOT NULL,
	entry TIMESTAMPTZ,
	exit TIMESTAMPTZ,
	budget INT NOT NULL,
	FOREIGN KEY (zone_id) REFERENCES decker.zones (id),
	FOREIGN KEY (player_id) REFERENCES decker.players (id)
);

/* Creating table decker.zone_status */
CREATE TABLE decker.zone_status (
	player_id	INTEGER NOT NULL,
	zone_id	INTEGER NOT NULL,
	entry TIMESTAMPTZ,
	timeout INT NOT NULL,
	UNIQUE (player_id),
	FOREIGN KEY (player_id) REFERENCES decker.players (id),
	FOREIGN KEY (zone_id) REFERENCES decker.zones (id)
);

/* Populating table decker.zones */
INSERT INTO decker.zones (zone_name, zone_level, zone_cap, open) VALUES 
('haven', 0, 100, 'true'),
('void', 1, 100, 'true'),
('pharmaceuticals', 8, 1, 'false');

/* Update zone status function */
CREATE OR REPLACE FUNCTION decker.enter_room(
	IN i_userId INTEGER,
	IN i_zoneId INTEGER,
	IN i_entry TIMESTAMPTZ,
	IN i_timeout INTEGER
) RETURNS VOID AS 
$BODY$
BEGIN
	INSERT INTO decker.zone_status (player_id, zone_id, entry, timeout) VALUES (i_userId, i_zoneId, i_entry, i_timeout)
	ON CONFLICT (player_id) DO UPDATE SET zone_id = i_zoneId, entry = i_entry, timeout = i_timeout;
END;
$BODY$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION decker.log_zone_history()
RETURNS trigger AS 
$BODY$
BEGIN
    INSERT INTO decker.zone_history (zone_id, player_id, entry, exit, budget) 
		VALUES (OLD.zone_id, OLD.player_id, OLD.entry, now(), OLD.timeout);
		RETURN NEW;
END;
$BODY$
LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_log_zone_history ON decker.zone_status;
CREATE TRIGGER trg_log_zone_history BEFORE UPDATE ON decker.zone_status
FOR EACH ROW 
WHEN (OLD.zone_id IS DISTINCT FROM NEW.zone_id)
EXECUTE PROCEDURE decker.log_zone_history();