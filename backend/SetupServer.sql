CREATE DATABASE divvy;
USE divvy;

CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    hash CHAR(60) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(16),
    stripe_id VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    data TEXT,
    expired TIMESTAMP
);

CREATE TABLE IF NOT EXISTS log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    tag CHAR(8) NOT NULL,
    log_time DATETIME NOT NULL,
    message VARCHAR(2048) NOT NULL,
    issuer_id INT,
    issuerState TINYINT NOT NULL,
    ip VARCHAR(32) NOT NULL,
    verbosity TINYINT NOT NULL
);

