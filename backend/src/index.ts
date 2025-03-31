import fs from 'fs';
import path from 'path';
import http from 'http';
import {Router} from "./Router";
import {Logger} from "./Logger";
import {Database} from "./Database";

const port = 80;

const settings = JSON.parse(fs.readFileSync(path.normalize(`${__dirname}/../ServerSettings.json`), 'utf-8'))

const db = new Database(settings.database_url, settings.database_user, settings.database, settings.database_password);
const logger = new Logger(db);
const router = new Router(logger, db, settings.stripe_key);

http.createServer(router.app).listen(port, () => {
    console.log(`Server Running at http://localhost:${port}`);
});
