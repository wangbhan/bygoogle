\getenv app_password MAIGU_DB_PASSWORD

BEGIN;
CREATE ROLE maigu_app LOGIN PASSWORD :'app_password';
ALTER DATABASE maigu OWNER TO maigu_app;
COMMIT;
