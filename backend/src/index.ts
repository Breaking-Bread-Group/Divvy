import fs from 'fs';
import path from 'path';
import https from 'https';
import {Router} from "./Router";
import {Logger} from "./Logger";
import {Database} from "./Database";

const port = 443;

const certs = {
    key: fs.readFileSync(path.normalize(`${__dirname}/../certs/key.pem`)),
    cert: fs.readFileSync(path.normalize(`${__dirname}/../certs/cert.pem`))
}

const settings = JSON.parse(fs.readFileSync(path.normalize(`${__dirname}/../ServerSettings.json`), 'utf-8'))

const db = new Database(settings.database_url, settings.database_user, settings.database, settings.database_password);
const logger = new Logger(db);
const router = new Router(logger, db, settings.stripe_key);

https.createServer(certs, router.app).listen(port, () => {
    console.log(`Server Running at https://localhost:${port}`);
});
