DROP TABLE IF EXISTS urls CASCADE;
CREATE TABLE urls (
id TEXT PRIMARY KEY,
longurl TEXT,
user_id UUID REFERENCCES users(id)
);