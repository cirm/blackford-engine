CREATE OR REPLACE FUNCTION decker.get_player_data(
    IN i_username VARCHAR(25),
    
    OUT id INTEGER,
    OUT username VARCHAR(25),
    OUT hpassword VARCHAR(36),
    OUT ROLES VARCHAR(25)[]
) AS $BODY$
SELECT
        pl.id,
        pl.username,
        pl.hpassword,
        (SELECT ARRAY((SELECT ro.name FROM decker.roles ro WHERE ro.id IN (SELECT pr.role_id FROM decker.player_roles pr WHERE pr.player_id = pl.id)))) as roles
    FROM decker.players pl WHERE pl.username = i_username
$BODY$
LANGUAGE SQL;