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

CREATE TABLE IF NOT EXISTS `groups` (
    group_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    persistent TINYINT UNSIGNED NOT NULL,
    group_name VARCHAR(255),
    admin INT UNSIGNED NOT NULL,
    FOREIGN KEY (admin) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS userGroups (
    userGroup_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (group_id) REFERENCES `groups` (group_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS pendingGroups (
    pendingGroup_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    user_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenses (
    expense_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    group_id INT UNSIGNED NOT NULL,
    expense_name VARCHAR(255) NOT NULL,
    total_cost DECIMAL(7,2) NOT NULL,
    active TINYINT NOT NULL,
    settled TINYINT NOT NULL,
    paid TINYINT NOT NULL,
    payment_card VARCHAR(255),
    payment_date DATETIME,
    creation_date DATETIME NOT NULL,
    FOREIGN KEY (group_id) REFERENCES `groups`(group_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS expenseSplits (
    expenseSplit_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    expense_id INT UNSIGNED NOT NULL,
    percentage DECIMAL(4,2) NOT NULL,
    accepted TINYINT NOT NULL,
    paid TINYINT NOT NULL,
    intent_id VARCHAR(255),
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS scheduledExpenses (
    scheduleExpense_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    expense_id INT UNSIGNED NOT NULL,
    start_date DATETIME NOT NULL,
    delay INT UNSIGNED NOT NULL,
    `repeat` TINYINT NOT NULL,
    repeat_time INT UNSIGNED,
    FOREIGN KEY (expense_id) REFERENCES expenses(expense_id)
        ON DELETE CASCADE
);

