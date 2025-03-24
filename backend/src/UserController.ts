import {Controller} from "./Controller";
import Stripe from 'stripe';
import express from "express";
import {Database} from "./Database";
import {ResponseHelper} from "./ResponseHelper";
import bcrypt, {genSalt} from "bcrypt";
import {logInput} from "./logInput";

export class UserController implements Controller {
    stripe;
    db : Database;
    responder : ResponseHelper;

    constructor(stripe, db : Database, responder : ResponseHelper) {
        this.stripe = stripe;
        this.db = db;
        this.responder = responder;
        this.NewUser.bind(this);
        this.UpdateProfile.bind(this);
        this.genCustomer.bind(this);
    }

    public NewUser(req : express.Request, res : express.Response){
        genSalt(14, function(err, salt) {
            bcrypt.hash(req.body.password, salt, function(err, hash) {
                if(err) this.responder.errorResponse(res, 500, <logInput>{
                    ip: req.ip, issuer_id: null, issuer_state: 0, msg: `Failed to hash password ${req.body.password} due to ${err.message}`, tag: "ERROR", verbosity: 255
                })
                this.genCustomer(req.body.fname, req.body.lname, req.body.email, req.body.phone).then(result => {
                    this.db.query("INSERT INTO users (hash, first_name, last_name, email, phone, stripe_id) VALUES (?, ?, ?, ?, ?, ?)",
                        [
                            hash, req.body.fname, req.body.lname, req.body.email, req.body.phone, result.id
                        ]
                    ).then(rows => {
                        req.login({
                            uid : rows.insertId,
                            email : req.body.email,
                            first_name : req.body.fname,
                            last_name : req.body.lname,
                            phone : req.body.phone,
                            stripe_id : result.id
                        }, err => {
                            if(err) this.responder.errorResponse(res, 500, <logInput>{
                                ip: req.ip, issuer_id: rows.insertId, issuer_state: 2, msg: `Error on login for new account ${rows.insertId} due to ${err.msg}`, tag: "ERROR", verbosity: 255
                            });
                            else this.responder.successResponse(res, 200, <logInput>{
                                ip: req.ip, issuer_id: rows.insertId, issuer_state: 1, msg: `Profile created for ${rows.insertId}`, tag: "INFO", verbosity: 255
                            });
                        })
                    }, error => {
                        this.respnder.errorResponse(res, 500, <logInput>{
                            ip: req.ip, issuer_id: null, issuer_state: 0, msg: `Profile creation failed for stripe id ${result.id} due to ${error.msg}`, tag: "ERROR", verbosity: 255
                        })
                    });
                });
            });
        });
    }

    public UpdateProfile(){
        // TODO
    }

    private genCustomer(fname : string, lname : string, email : string, phone : string | null) : Promise<Stripe.Customer> {
        return new Promise<Stripe.Customer>(async resolve => {
            let customer : Stripe.Customer = await this.stripe.customers.create({
                name: fname + " " + lname,
                email: email,
                phone: phone
            });
            resolve(customer);
        })
    }
}
