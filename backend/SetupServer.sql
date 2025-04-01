-- Used for creating the database if not already done. It will erase any old data if run so this is for fresh starts only.

DROP DATABASE IF EXISTS divvy;
CREATE DATABASE divvy;
USE divvy;

CREATE TABLE IF NOT EXISTS users (
    user_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    hash CHAR(60) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(16),
    stripe_id VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    data TEXT,
    expires BIGINT UNSIGNED
);

CREATE TABLE IF NOT EXISTS log (
    log_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tag CHAR(8) NOT NULL,
    log_time DATETIME NOT NULL,
    message VARCHAR(2048) NOT NULL,
    issuer_id INT UNSIGNED,
    issuerState TINYINT UNSIGNED NOT NULL,
    ip VARCHAR(32) NOT NULL,
    verbosity TINYINT UNSIGNED NOT NULL
);

