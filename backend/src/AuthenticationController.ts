import { Controller } from "./Controller";
import {ResponseHelper} from "./ResponseHelper";
import express from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt'
import { Strategy as LocalStrategy } from 'passport-local';
import {Database} from "./Database";
import {UserController} from "./UserController"
import {logInput} from "./logInput";

export class AuthenticationController implements Controller {
    responder : ResponseHelper;
    db : Database;
    uc : UserController;

    constructor(app : express.Application, responder : ResponseHelper, db : Database, uc : UserController) {
        this.responder = responder;
        this.db = db;
        this.uc = uc;
        this.register.bind(this);
        this.logout.bind(this);
        this.login.bind(this);
        this.checkPassword.bind(this);

        app.use(passport.initialize());
        app.use(passport.session());

        passport.use(new LocalStrategy((email, password, done) => {
            db.queryARGS('SELECT * FROM users WHERE email = ?', [email]).then(
                (rows: any[]) => {
                    if(rows.length == 0) return done(null, false, {message: "Account not found"});
                    bcrypt.compare(password, rows[0].hash, (err, result) => {
                        if(err) return done(null, false, {message: "Error"});
                        if(!result) return done(null, false, {message: "Incorrect Username/Password"})
                        return done(null, {
                            uid : rows[0].user_id,
                            email : rows[0].email,
                            first_name : rows[0].first_name,
                            last_name : rows[0].last_name,
                            phone : rows[0].phone,
                            stripe_id : rows[0].stripe_id
                        });
                    });
                },
                (error) => {
                    return done(error);
                }
            )
        }));
        passport.serializeUser((user, done) => {done(null, (<user>user).uid)});
        passport.deserializeUser((id, done) => {
            this.db.queryARGS('SELECT * FROM users WHERE user_id = ?', [id]).then(
                (rows: any[]) => {
                    if(rows.length == 0) return done(null, false);
                    return done(null, {
                        uid : rows[0].user_id,
                        email : rows[0].email,
                        first_name : rows[0].first_name,
                        last_name : rows[0].last_name,
                        phone : rows[0].phone,
                        stripe_id : rows[0].stripe_id
                    });
                },
                (error) => {
                    return done(error);
                }
            )
        });
    }

    public login(){
        return [
            passport.authenticate('local', { failWithError: true }),
            (req, res) => this.responder.successResponse(res, 200, <logInput>{
                ip: req.ip, issuer_id: req.user.uid, issuer_state: 1, msg: `Successful login of ${req.body.email} | ${req.user.uid}`, tag: "INFO", verbosity: 255
            }),
            (err, req, res) => this.responder.errorResponse(res, 401, <logInput>{
                ip: req.ip, issuer_id: null, issuer_state: 0, msg: `Failed login of ${req.body.email} due to ${err.message}`, tag: "WARN", verbosity: 255
            })
        ]
    }

    public logout(req : express.Request, res : express.Response){
        let uid = req.user ? (<user>req.user).uid : null;
        req.logout((err) => {
            if(err) {this.responder.errorResponse(res, 500, <logInput>{
                ip: req.ip, issuer_id: uid, issuer_state: 3, msg: `Failed logout of ${uid} due to ${err.message}`, tag: "ERROR", verbosity: 255
            })}
            else this.responder.successResponse(res, 200, <logInput>{
                ip: req.ip, issuer_id: uid, issuer_state: 0, msg: `Successful logout of ${uid}`, tag: "INFO", verbosity: 255
            });
        });
    }

    public register(req : express.Request, res : express.Response){
        if(req.body.email && req.body.password && req.body.fname && req.body.lname){
            this.uc.NewUser(req, res);
        } else {
            this.responder.errorResponse(res, 400, <logInput>{
                ip: req.ip, issuer_id: null, issuer_state: 0, msg: `Failed registration due to inadequate body ${req.body}`, tag: "WARN", verbosity: 255
            })
        }
    }

    public checkPassword(email, password) : Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.db.queryARGS('SELECT * FROM users WHERE email = ?', [email]).then(
                (rows: any[]) => {
                    if(rows.length == 0) resolve(false);
                    bcrypt.compare(password, rows[0].hash, (err, result) => {
                        if(err) resolve(false);
                        resolve(result);
                    });
                },
                (error) => {
                    resolve(false);
                }
            )
        });
    }
}

type user = {
    uid : number,
    email : string,
    first_name : string,
    last_name : string,
    phone : string,
    stripe_id : string
}
