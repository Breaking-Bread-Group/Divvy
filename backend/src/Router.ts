import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import Stripe from "stripe";
import crypto from "crypto";
import { AuthenticationController } from "./AuthenticationController";
import { ResponseHelper } from "./ResponseHelper";
import { Logger } from "./Logger";
import { Database } from "./Database";
import { UserController } from "./UserController";

/**
 * @class Router
 * 
 * Very important class where all incoming communication pass through.
 * The router will take incoming http requests and determine the appropriate controller class and method to send them to.
 * For organization purposes, please do not implement the desired behavior on this script, this is only meant to route them.
 * Implement the desired behavior on a separate controller class.
 * 
 */
export class Router {
    app: express.Application;
    auth: AuthenticationController;
    logger: Logger;
    responder: ResponseHelper;

    /**
     * Constructs class, placing references to important running classes within it
     * Also does everything else because express is just like that I guess
     * All routing and setup is also done in this method
     * 
     * @param logger - Reference to Logger for ability to quickly log responses. Though router will also pass this reference on to instanced classes of its own.
     * @param db - Reference to Database class for ability to interface with database. Used for session storage, though it will also be passed to instanced classes.
     * @param stripe_key - Secret Stripe Key needed to properly instance Stripe object to interface with Stripe services. It is a string to be provided by ServerSettings.json
     */
    constructor(logger: Logger, db: Database, stripe_key: string) {
        this.logger = logger;
        this.responder = new ResponseHelper(this.logger);
        let uc = new UserController(new Stripe(stripe_key), db, this.responder);

        this.app = express();

        // Setting up session storage in mysql database and allowing express to use it
        const MySQLStore = require("express-mysql-session")(session);
        this.app.use(
            session({
                store: new MySQLStore(
                    {
                        schema: {
                            tableName: "sessions", // Correct way to specify the table name
                        },
                    },
                    db.pool,
                ),
                secret: crypto.randomBytes(64).toString("hex"),
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: true,
                    maxAge: 1000 * 60 * 60 * 2,
                },
            }),
        );

        // Needed to parse incoming request bodies in json, otherwise they would be unreadable
        this.app.use(bodyParser.json());

        this.auth = new AuthenticationController(this.app, this.responder, db, uc);

        // Basic ping request to check that server connection is working and see current user status. Mostly meant for testing purposes.
        this.app.all("/", this.ping);

        // Authentication requests for login, logout, register, etc.
        this.app.post("/login", this.auth.login);
        this.app.delete("/logout", this.auth.logout);
        this.app.post("/register", this.auth.register);

        // TODO: The rest of the app's functionality must be completed
        // Further routing to these new classes to be made will be written below this comment


    }

    /**
     * Small contained method for the ping request. This is the only exception to the 'no implementation in router' rule.
     * This will simply test that connection is working by responding with some user data carried in the request.
     * 
     * @param req - Express request object
     * @param res - Express response object
     */
    private ping(req: express.Request, res: express.Response) {
        let ping: Object = {};
        ping["ip"] = req.ip;
        ping["authenticated?"] = req.isAuthenticated();
        if (req.user) {
            ping["state"] = "logged in";
            ping["user"] = req.user;
        } else {
            ping["state"] = "logged out";
            ping["user"] = null;
        }
        ping["body"] = req.body;
        res.status(200).json(ping);
    }
}
