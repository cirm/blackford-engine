/* Replace with your SQL commands */
CREATE SCHEMA characters;

CREATE TABLE characters.stats (
id SERIAL PRIMARY KEY,
humanity INT,
wallet INT NOT NULL,
player_id INT NOT NULL UNIQUE,
level INT,
FOREIGN KEY (player_id) REFERENCES decker.players (id),
CONSTRAINT level_range CHECK (level BETWEEN 1 and 10),
CONSTRAINT humanity_range CHECK (humanity BETWEEN 1 AND 10)
);

CREATE OR REPLACE FUNCTION characters.create_char(
	IN i_user_id INT
) RETURNS TABLE (
	id INT,
	humanity INT,
	wallet INT,
	player_id INT,
	level INT
)AS 
$BODY$
BEGIN
INSERT INTO characters.stats (humanity, wallet, player_id, level) VALUES (10, 1000, i_user_id, 1);
RETURN QUERY SELECT cs.id, cs.humanity, cs.wallet, cs.player_id, cs.level FROM characters.stats cs WHERE cs.player_id = i_user_id;
END;
$BODY$
LANGUAGE plpgsql;

create table characters.upgrades (
	id SERIAL PRIMARY KEY,
	name VARCHAR(20),
	multiplier INT,
	cost INT,
	value INT,
	type INT
);

create table characters.orders (
	id SERIAL PRIMARY KEY,
	timestamp TIMESTAMPTZ,
	ammount INT,
	wallet_statement INT,
	upgrade_id INT,
	player_id INT,
	status INT,
	FOREIGN KEY (player_id) REFERENCES decker.players (id),
	FOREIGN KEY (upgrade_id) REFERENCES characters.upgrades (id)
);

CREATE OR REPLACE FUNCTION characters.buy_upgrade(
 IN i_player_id INTEGER,
 IN i_upgrade_id INTEGER,

 OUT text VARCHAR(20),
 OUT order_id INT,
 OUT status BOOLEAN
) AS 
$BODY$
DECLARE
  _wallet INTEGER := (SELECT wallet FROM characters.stats WHERE id = i_player_id);
	_upgrade_price INT;
	_upgrade_multiplier INT;
	_final_price INT;
	_count INT;
BEGIN
SELECT cost, multiplier INTO _upgrade_price, _upgrade_multiplier FROM characters.upgrades WHERE id = i_upgrade_id;
_count := (SELECT count(upgrade_id) FROM characters.orders WHERE player_id = i_player_id and upgrade_id = i_upgrade_id);
IF _count = 0 THEN _final_price:= _upgrade_price; ELSE _final_price := _count * _upgrade_multiplier * _upgrade_price;
END IF;
IF _wallet IS NULL OR _wallet < _final_price THEN text:= 'Not enough balance'; status:=FALSE; order_id := NULL;
ELSE
UPDATE characters.stats SET wallet = (_wallet - _final_price) WHERE player_id = i_player_id;
INSERT INTO characters.orders (timestamp, ammount, wallet_statement, upgrade_id, player_id, status) VALUES (now(), _final_price, _wallet, i_upgrade_id, i_player_id, 0 ) RETURNING id INTO order_id;
text:= 'Payment Successful';
status:=TRUE;
END IF;
END;
$BODY$
LANGUAGE plpgsql;

INSERT INTO characters.upgrades (name, multiplier, cost, value, type) VALUES 
('Redeem soul', 4, 1000, 2, 0),
('Buy Indulgence', 2, 2000, 1, 0),
('Level Up', 1, 1000, 1, 1);