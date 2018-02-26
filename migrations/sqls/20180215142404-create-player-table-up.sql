CREATE SCHEMA decker;

CREATE TABLE decker.players (
  id SERIAL PRIMARY KEY,
  username  VARCHAR(15),
  salt      VARCHAR(29),
  hpassword VARCHAR(60),
  created   TIMESTAMP NOT NULL DEFAULT NOW(),
  updated   TIMESTAMP NOT NULL DEFAULT NOW(),
  visited   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (username)
);

CREATE TABLE decker.services (
    id      SERIAL      PRIMARY KEY,
    name    VARCHAR(15) NOT NULL,
    UNIQUE (name)
);

CREATE TABLE decker.roles (
    id SERIAL PRIMARY KEY,
    service_id INTEGER NOT NULL,
    name VARCHAR(10) NOT NULL,
    FOREIGN KEY (service_id) REFERENCES decker.services (id),
    UNIQUE (service_id, name)
);

CREATE TABLE decker.player_roles (
    id SERIAL PRIMARY KEY,
    player_id SMALLINT NOT NULL,
    role_id SMALLINT NOT NULL,
    FOREIGN KEY (player_id) REFERENCES decker.players (id),
    FOREIGN KEY (role_id) REFERENCES decker.roles (id),
    UNIQUE (player_id, role_id)
);

INSERT INTO decker.services (name) VALUES
    ('decker_web'),
    ('decker_node');

INSERT INTO decker.roles (service_id, name) VALUES
    ((SELECT id FROM decker.services where name = 'decker_web'), 'tracker'),
    ((SELECT id FROM decker.services where name = 'decker_web'), 'cracker'),
    ((SELECT id FROM decker.services where name = 'decker_web'), 'decker'),
    ((SELECT id FROM decker.services where name = 'decker_web'), 'admin'),
    ((SELECT id FROM decker.services where name = 'decker_web'), 'skiddle');
