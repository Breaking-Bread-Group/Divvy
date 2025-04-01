import { Controller } from "./Controller";
import { ResponseHelper } from "./ResponseHelper";
import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import { Database } from "./Database";
import { UserController } from "./UserController";
import { logInput } from "./logInput";

/**
 * @class AuthenticationController
 * 
 * This is a controller responsible for handling all authentication-related requests
 * For example, login, logout, registration
 * 
 */
export class AuthenticationController implements Controller {
    responder: ResponseHelper;
    db: Database;
    uc: UserController;

    /**
     * Constructs class, placing references to important running classes within it
     * Also initializes passport and sets up basic authentication patterns
     * 
     * @param app - Reference to the express app so that passport can interface with it
     * @param responder - Reference to ResponseHelper to help simplify logging and simple responses
     * @param db - Reference to Database class to interface with database directly for authentication purposes
     * @param uc - Reference to UserController class to manage the creation of new users in the system
     */
    constructor(
        app: express.Application,
        responder: ResponseHelper,
        db: Database,
        uc: UserController,
    ) {
        this.responder = responder;
        this.db = db;
        this.uc = uc;

        // These are unfortunately necessary to solve the undefined 'this' bug
        this.register = this.register.bind(this);
        this.logout = this.logout.bind(this);
        this.login = this.login.bind(this);
        this.checkPassword = this.checkPassword.bind(this);

        app.use(passport.initialize());
        app.use(passport.session());

        // This defines the basic pattern of authentication
        // The correct user's data is taken from the entry that matches the provided email address (here referred to as username)
        // Then the provided password is securely compared against stored hash to confirm proper credentials
        passport.use(
            new LocalStrategy((username, password, done) => {
                db.querySanitized("SELECT * FROM users WHERE email = ?", [
                    username,
                ]).then(
                    (rows: any[]) => {
                        if (rows.length == 0)
                            return done(null, false, { message: "Account not found" });
                        bcrypt.compare(password, rows[0].hash, (err, result) => {
                            if (err) return done(null, false, { message: "Error" });
                            if (!result)
                                return done(null, false, {
                                    message: "Incorrect Username/Password",
                                });
                            return done(null, {
                                uid: rows[0].user_id,
                                email: rows[0].email,
                                first_name: rows[0].first_name,
                                last_name: rows[0].last_name,
                                phone: rows[0].phone,
                                stripe_id: rows[0].stripe_id,
                            });
                        });
                    },
                    (error) => {
                        return done(error);
                    },
                );
            }),
        );

        // Yeah idk exactly how this works it's really weird but this basically stores user data for quick access from req
        passport.serializeUser((user, done) => {
            done(null, (<user>user).uid);
        });
        passport.deserializeUser((id, done) => {
            this.db
                .querySanitized("SELECT * FROM users WHERE user_id = ?", [id])
                .then(
                    (rows: any[]) => {
                        if (rows.length == 0) return done(null, false);
                        return done(null, {
                            uid: rows[0].user_id,
                            email: rows[0].email,
                            first_name: rows[0].first_name,
                            last_name: rows[0].last_name,
                            phone: rows[0].phone,
                            stripe_id: rows[0].stripe_id,
                        });
                    },
                    (error) => {
                        return done(error);
                    },
                );
        });
    }

    /**
     * Responsible for logging in user. Not meant to be called directly but provided as a callback function for express.
     * 
     * @param req - Express request object
     * @param res - Express response object
     * @param next - Next call for middleware
     */
    public login(req: express.Request, res: express.Response, next) {
        passport.authenticate("local", (err, user) => {
            if (err || !user) {
                this.responder.errorResponse(res, 401, <logInput>{
                    ip: req.ip,
                    issuer_id: null,
                    issuer_state: 0,
                    msg: `Failed login of ${req.body.username} due to ${err ? err : "Failed Authentication"}`,
                    tag: err ? "ERROR" : "WARN",
                    verbosity: 255,
                });
            } else {
                req.login(user, (err) => {
                    if (err)
                        this.responder.errorResponse(res, 500, <logInput>{
                            ip: req.ip,
                            issuer_id: null,
                            issuer_state: 2,
                            msg: `Failed login of ${user.uid} due to ${err}`,
                            tag: "ERROR",
                            verbosity: 255,
                        });
                    else
                        this.responder.successResponse(res, 200, <logInput>{
                            ip: req.ip,
                            issuer_id: user.uid,
                            issuer_state: 1,
                            msg: `Successful login of ${req.body.username} | ${user.uid}`,
                            tag: "INFO",
                            verbosity: 255,
                        });
                });
            }
        })(req, res, next);
    }

    /**
     * Responsible for logging out user. Not meant to be called directly but provided as a callback function for express.
     * 
     * @param req - Express request object
     * @param res - Express response object
     */
    public logout(req: express.Request, res: express.Response) {
        let uid = req.user ? (<user>req.user).uid : null;
        req.logout((err) => {
            if (err) {
                this.responder.errorResponse(res, 500, <logInput>{
                    ip: req.ip,
                    issuer_id: uid,
                    issuer_state: 3,
                    msg: `Failed logout of ${uid} due to ${err.message}`,
                    tag: "ERROR",
                    verbosity: 255,
                });
            } else
                this.responder.successResponse(res, 200, <logInput>{
                    ip: req.ip,
                    issuer_id: uid,
                    issuer_state: 0,
                    msg: `Successful logout of ${uid}`,
                    tag: "INFO",
                    verbosity: 255,
                });
        });
    }

    /**
     * Responsible for registering new users. Also logs them in on success. Not meant to be called directly but provided as a callback function for express.
     * 
     * @param req - Express request object
     * @param res - Express response object
     */
    public register(req: express.Request, res: express.Response) {
        if (
            req.body.username &&
            req.body.password &&
            req.body.fname &&
            req.body.lname
        ) {
            this.uc.NewUser(req, res);
        } else {
            this.responder.errorResponse(res, 400, <logInput>{
                ip: req.ip,
                issuer_id: null,
                issuer_state: 0,
                msg: `Failed registration due to inadequate body ${req.body}`,
                tag: "WARN",
                verbosity: 255,
            });
        }
    }

    /**
     * Helpful method for simply checking if credentials would successfully log in. No logging in actually happens here. Mostly just here for testing purposes.
     * 
     * @param email - User's email / username
     * @param password - User's password in plaintext
     * @returns - Promise for boolean value determining if the password is correct. Since this is an asynchronous operation, promises provide a useful way to interface.
     */
    public checkPassword(email, password): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            this.db
                .querySanitized("SELECT * FROM users WHERE email = ?", [email])
                .then(
                    (rows: any[]) => {
                        if (rows.length == 0) resolve(false);
                        bcrypt.compare(password, rows[0].hash, (err, result) => {
                            if (err) resolve(false);
                            resolve(result);
                        });
                    },
                    (error) => {
                        resolve(false);
                    },
                );
        });
    }
}

// idk if I even used this lol someone should check
type user = {
    uid: number;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    stripe_id: string;
};
