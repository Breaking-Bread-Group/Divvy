import express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import crypto from "crypto";
import {AuthenticationController} from "./AuthenticationController";
import {ResponseHelper} from "./ResponseHelper";
import {Logger} from "./Logger";
import {Database} from "./Database";
import {UserController} from "./UserController";

export class Router {
    app: express.Application;
    auth: AuthenticationController;
    logger : Logger;
    responder : ResponseHelper;

    constructor(logger : Logger, db : Database, stripe_key : string) {
        this.logger = logger;
        this.responder = new ResponseHelper(this.logger);
        let uc = new UserController(new Stripe(stripe_key), db, this.responder);
        const MySQLStore = require('express-mysql-session')(session);
        this.app = express();
        this.app.use(session({
            store: new MySQLStore({
                schema: {
                    tableName: "sessions" // Correct way to specify the table name
                }
            }, db.pool),
            secret: crypto.randomBytes(64).toString('hex'),
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: false,
                maxAge: 1000 * 60 * 60 * 2
            }
        }));
        this.app.use(bodyParser.json());

        this.auth = new AuthenticationController(this.app, this.responder, db, uc);

        this.app.post("/login", ...this.auth.login());
        this.app.delete("/logout", this.auth.logout);
        this.app.post("/register", this.auth.register);
    }
}
