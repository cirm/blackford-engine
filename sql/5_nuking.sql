
create table characters.trophies (
	id SERIAL PRIMARY KEY,
	killer INT NOT NULL,
	killer_level INT NOT NULL,
	mob INT NOT NULL,
	location INT NOT NULL,
	timestamp TIMESTAMPTZ NOT NULL,
	FOREIGN KEY (mob) REFERENCES game.mobs(id),
	FOREIGN KEY (location) REFERENCES exploration.zones(id),
	FOREIGN KEY (killer) REFERENCES characters.deckers(id)
);

create table characters.kills (
	id SERIAL PRIMARY KEY,
	killer INT NOT NULL,
	killer_level INT NOT NULL,
	victim INT NOT NULL,
	victim_level INT NOT NULL,
	location INT NOT NULL,
	timestamp TIMESTAMPTZ NOT NULL,
	looted BOOLEAN NOT NULL,
	FOREIGN KEY (victim) REFERENCES characters.deckers(id),
	FOREIGN KEY (location) REFERENCES exploration.zones(id),
	FOREIGN KEY (killer) REFERENCES characters.deckers(id)
);
