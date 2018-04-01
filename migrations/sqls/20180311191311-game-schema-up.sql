/* Replace with your SQL commands */
create schema game;

create table game.state(
	alert INTEGER,
	termination TIMESTAMPTZ,
	hazard INTEGER,
	CONSTRAINT alert_range CHECK (alert BETWEEN 1 and 10),
	CONSTRAINT hazard_range CHECK (hazard BETWEEN 1 and 10)
);

create table game.events(
	id SERIAL PRIMARY KEY,
	name VARCHAR(20)
);

create table game.log(
	id SERIAL PRIMARY KEY,
	timestamp TIMESTAMPTZ,
	player_id INTEGER,
	event_id INTEGER,
	value INTEGER,
	FOREIGN KEY (player_id) REFERENCES decker.players(id),
	FOREIGN KEY (event_id) REFERENCES game.events(id)
);