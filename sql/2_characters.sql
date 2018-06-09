/* Replace with your SQL commands */
CREATE SCHEMA characters;

CREATE TABLE characters.deckers (
id SERIAL PRIMARY KEY,
decker VARCHAR(60),
humanity INT,
wallet INT NOT NULL,
account_id INT NOT NULL UNIQUE,
level INT,
FOREIGN KEY (account_id) REFERENCES account.authentication (id),
CONSTRAINT level_range CHECK (level BETWEEN 1 and 10),
CONSTRAINT humanity_range CHECK (humanity BETWEEN 1 AND 10)
);

CREATE OR REPLACE FUNCTION characters.create_decker(
	IN i_account_id INT,
	IN i_decker VARCHAR(20)
) RETURNS TABLE (
	id INT,
	decker VARCHAR(20),
	humanity INT,
	wallet INT,
	level INT
)AS 
$BODY$
BEGIN
INSERT INTO characters.deckers (humanity, wallet, account_id, decker, level) VALUES (10, 1000, i_account_id, i_decker, 1);
RETURN QUERY SELECT cd.id, cd.decker, cd.humanity, cd.wallet, cd.level FROM characters.deckers cd WHERE cd.account_id = i_account_id;
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
	decker_id INT,
	status INT,
	FOREIGN KEY (decker_id) REFERENCES characters.deckers (id),
	FOREIGN KEY (upgrade_id) REFERENCES characters.upgrades (id)
);

CREATE OR REPLACE FUNCTION characters.buy_upgrade(
 IN i_decker_id INTEGER,
 IN i_upgrade_id INTEGER,

 OUT text VARCHAR(20),
 OUT order_id INT,
 OUT status BOOLEAN
) AS 
$BODY$
DECLARE
  _wallet INT; 
	_upgrade_price INT;
	_upgrade_multiplier INT;
	_final_price INT;
	_count INT;
BEGIN
SELECT wallet INTO _wallet FROM characters.deckers WHERE id = i_decker_id;
SELECT cost, multiplier INTO _upgrade_price, _upgrade_multiplier FROM characters.upgrades WHERE id = i_upgrade_id;
_count := (SELECT count(upgrade_id) FROM characters.orders WHERE decker_id = i_decker_id and upgrade_id = i_upgrade_id);
IF _count = 0 THEN _final_price:= _upgrade_price; ELSE _final_price := _count * _upgrade_multiplier * _upgrade_price;
END IF;
IF _wallet < _final_price THEN text:= 'Not enough balance'; status:=FALSE; order_id := NULL;
ELSE
UPDATE characters.deckers SET wallet =_wallet - _final_price WHERE id = i_decker_id;
INSERT INTO characters.orders (timestamp, ammount, wallet_statement, upgrade_id, decker_id, status) VALUES (now(), _final_price, _wallet, i_upgrade_id, i_decker_id, 0 ) RETURNING id INTO order_id;
text:= 'Payment Successful';
status:=TRUE;
END IF;
END;
$BODY$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION account.get_account_data(
    IN i_username VARCHAR(25),
    
    OUT id INTEGER,
    OUT username VARCHAR(25),
    OUT hpassword VARCHAR(36),
    OUT ROLES VARCHAR(25)[]
) AS $BODY$
SELECT
        aa.id,
        cd.decker,
        aa.hpassword,
        (SELECT ARRAY((SELECT ar.name FROM account.roles ar WHERE ar.id IN (SELECT apr.role_id FROM account.player_roles apr WHERE apr.account_id = aa.id)))) as roles
    FROM account.authentication aa, characters.deckers cd WHERE cd.decker = i_username AND cd.account_id = aa.id
$BODY$
LANGUAGE SQL;