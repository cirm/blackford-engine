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
	decker_id INTEGER,
	event_id INTEGER,
	value INTEGER,
	FOREIGN KEY (decker_id) REFERENCES characters.deckers(id),
	FOREIGN KEY (event_id) REFERENCES game.events(id)
);

create table game.objects(
	id SERIAL PRIMARY KEY,
	type VARCHAR(20),
	meta VARCHAR(100),
	value INT
);

create table game.decker2objects(
	id SERIAL PRIMARY KEY,
	object_id INT,
	decker_id INT,
	FOREIGN KEY (object_id) REFERENCES game.objects(id),
	FOREIGN KEY (decker_id) REFERENCES characters.deckers(id),
	UNIQUE (object_id, decker_id)
);

create table game.nodes(
	id SERIAL PRIMARY KEY,
	active BOOLEAN NOT NULL,
	captured BOOLEAN NOT NULL DEFAULT FALSE,
	level INT NOT NULL
);

create table game.node_status_events(
	id serial PRIMARY KEY,
	node_id INT NOT NULL,
	owner INT NOT NULL,
	captured TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	FOREIGN KEY (owner) REFERENCES characters.deckers(id),
	FOREIGN KEY (node_id) REFERENCES game.nodes(id)
);

create table game.node_compensation_events(
	id serial PRIMARY Key,
	node_event_id INT NOT NULL,
	timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
	ammount INT NOT NULL,
	recipient INT NOT NULL,
	FOREIGN KEY (node_event_id) REFERENCES game.node_status_events(id),
	FOREIGN KEY (recipient) REFERENCES characters.deckers(id)
);

create table game.mobs(
	id SERIAL PRIMARY KEY,
	level INT NOT NULL,
	bounty INT NOT NULL,
	meta VARCHAR(100)
);

