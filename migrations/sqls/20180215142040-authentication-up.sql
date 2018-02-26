CREATE OR REPLACE FUNCTION decker.get_player_data(
    IN i_username VARCHAR(25)
) RETURNS JSON AS
$BODY$
SELECT array_to_json(array_agg(row_to_json(p)))
FROM
    (SELECT
        pl.id,
        pl.username,
        pl.hpassword,
        (SELECT ARRAY((SELECT ro.name FROM decker.roles ro WHERE ro.id IN (SELECT pr.role_id FROM decker.player_roles pr WHERE pr.player_id = pl.id)))) as roles
    FROM decker.players pl WHERE pl.username = i_username) p;
$BODY$
LANGUAGE SQL;