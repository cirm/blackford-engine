
INSERT INTO account.roles (name) VALUES
    ('decker'),
    ('admin'),
    ('skiddle');

INSERT INTO characters.upgrades (name, multiplier, cost, value, type) VALUES 
('Redeem soul', 4, 1000, 2, 0),
('Buy Indulgence', 2, 2000, 1, 0),
('Level Up', 1, 1000, 1, 1);

/* Populating table exploration.zones */
INSERT INTO exploration.zones (zone_name, zone_level, zone_cap, zone_timeout, open) VALUES 
('haven', 0, 100, '3600', 'true'),
('void', 1, 100, '1200','true'),
('bionics', 4, 3, '800', 'true'),
('pharmaceuticals', 8, 1, '300','false');

INSERT INTO game.mobs (level, bounty, meta) VALUES
(1, 1000, 'It is a big fucken animal'),
(2, 4000, 'It is a big fucken mob'),
(3, 8000, 'Bakufu has arrived');

INSERT INTO game.objects (type, meta, value) VALUES
('movable', 'magnetic vase', 100),
('static', 'random cypher', 200),
('movable', 'a big box', 500),
('movable','datalog from the 20th century', 10000);

INSERT INTO game.nodes (active, owner, level) VALUES 
('true', null, 1),
('false', null, 5),
('true', null, 5);

INSERT INTO account.authentication (hpassword) VALUES ('$2a$11$kU3NTUGBlybcDbMOre8MXe2rU7i/5WEtlytm0kw07gTkyif.phEhy');
SELECT * FROM characters.create_decker(1, 'bakufu');

insert into account.player_roles (account_id, role_id) VALUES (1, 1), (1, 2);