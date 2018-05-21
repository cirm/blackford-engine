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

create table game.objects(
	id SERIAL PRIMARY KEY,
	type VARCHAR(20),
	meta VARCHAR(100)
);

create table game.player2objects(
	id SERIAL PRIMARY KEY,
	object_id INT,
	player_id INT,
	FOREIGN KEY (object_id) REFERENCES game.objects(id),
	FOREIGN KEY (player_id) REFERENCES decker.players(id),
	UNIQUE (object_id, player_id)
);

create table game.nodes(
	id SERIAL PRIMARY KEY,
	active BOOLEAN NOT NULL,
	owner INT,
	level INT NOT NULL,
	FOREIGN KEY (owner) REFERENCES decker.players(id)
);

create table game.mobs(
	id SERIAL PRIMARY KEY,
	level INT NOT NULL,
	bounty INT NOT NULL,
	meta VARCHAR(100)
);

INSERT INTO game.mobs (level, bounty, meta) VALUES
(1, 1000, 'It is a big fucken animal'),
(2, 4000, 'It is a big fucken mob'),
(3, 8000, 'Bakufu has arrived');

INSERT INTO game.objects (type, meta) VALUES
('movable', 'magnetic vase'),
('static', 'random cypher'),
('movable', 'a big box'),
('movable','datalog from the 20th century');

INSERT INTO game.nodes (active, owner, level) VALUES 
('true', null, 1),
('false', 1, 5),
('true', 1, 5);