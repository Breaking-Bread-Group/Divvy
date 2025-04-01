/**
 * Starting file for the program
 *
 * Traditionally, the programmers' names go here:
 *
 * @author Matthew Martinez, Abdul-Malik Mohammed, Sommer Hope, Minh Nguyen, Tyus Wyche
 *
 */

import fs from "fs";
import path from "path";
import https from "https";
import { Router } from "./Router";
import { Logger } from "./Logger";
import { Database } from "./Database";

// This is the standard port for https every browser should recognize it
const port = 443;

// Generate certs with ssl.sh before running this pls
const certs = {
    key: fs.readFileSync(path.normalize(`${__dirname}/../certs/key.pem`)),
    cert: fs.readFileSync(path.normalize(`${__dirname}/../certs/cert.pem`)),
};

// Duplicate ServerSettings.json.template, remove the .template from the copy, and fill in blank values before running this pls
const settings = JSON.parse(
    fs.readFileSync(
        path.normalize(`${__dirname}/../ServerSettings.json`),
        "utf-8",
    ),
);

// Initialize Database, Logger, and Router Class
const db = new Database(
    settings.database_url,
    settings.database_user,
    settings.database,
    settings.database_password,
);
const logger = new Logger(db);
const router = new Router(logger, db, settings.stripe_key);

// Open server
https.createServer(certs, router.app).listen(port, () => {
    console.log(`Server Running at https://localhost:${port}`);
});
