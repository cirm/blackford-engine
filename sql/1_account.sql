CREATE SCHEMA account;

CREATE TABLE account.authentication (
    id SERIAL PRIMARY KEY,
    salt    VARCHAR(29),
    hpassword    VARCHAR(60),
    created   TIMESTAMP NOT NULL DEFAULT NOW(),
    visited   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE account.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(10) NOT NULL,
    UNIQUE (name)
);

CREATE TABLE account.player_roles (
    id SERIAL PRIMARY KEY,
    account_id SMALLINT NOT NULL,
    role_id SMALLINT NOT NULL,
    FOREIGN KEY (account_id) REFERENCES account.authentication (id),
    FOREIGN KEY (role_id) REFERENCES account.roles (id),
    UNIQUE (account_id, role_id)
);

