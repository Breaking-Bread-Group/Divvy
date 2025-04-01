import { Controller } from "./Controller";
import Stripe from "stripe";
import express from "express";
import { Database } from "./Database";
import { ResponseHelper } from "./ResponseHelper";
import bcrypt, { genSalt } from "bcrypt";
import { logInput } from "./logInput";

/**
 * @class UserController
 * 
 * Responsible for the creation and editing of user data. New accounts are created, existing accounts are edited. That's it.
 * 
 */
export class UserController implements Controller {
    stripe;
    db: Database;
    responder: ResponseHelper;

    /**
     * Constructs class, placing references to important running classes within it
     * 
     * @param stripe - Reference to the external Stripe class for interfacing with Stripe services
     * @param db - Reference to the Database class for access to user information and editing
     * @param responder - Reference to ResponseHelper to help simplify logging and simple responses 
     */
    constructor(stripe, db: Database, responder: ResponseHelper) {
        this.stripe = stripe;
        this.db = db;
        this.responder = responder;

        // These are unfortunately necessary to solve the undefined 'this' bug
        this.NewUser = this.NewUser.bind(this);
        this.UpdateProfile = this.UpdateProfile.bind(this);
        this.genCustomer = this.genCustomer.bind(this);
    }

    /**
     * This mess of a method creates a new account for a new user using the data provided
     * Because it needs a lot of checks to make sure no bad information is inserted, this takes up a lot of space
     * Not to mention, initial password hashing and salting takes place in this method
     * New user data is stored in the users table provided nothing goes wrong
     * User is also logged in upon success
     * 
     * @param req - Express request object
     * @param res - Express response object
     */
    public NewUser(req: express.Request, res: express.Response) {
        genSalt(14, (err, salt) => {
            bcrypt.hash(req.body.password, salt, (err, hash) => {
                if (err)
                    this.responder.errorResponse(res, 500, <logInput>{
                        ip: req.ip,
                        issuer_id: null,
                        issuer_state: 0,
                        msg: `Failed to hash password ${req.body.password} due to ${err.message}`,
                        tag: "ERROR",
                        verbosity: 255,
                    });
                this.genCustomer(
                    req.body.fname,
                    req.body.lname,
                    req.body.username,
                    req.body.phone,
                ).then((result) => {
                    this.db
                        .querySanitized(
                            "INSERT INTO users (hash, first_name, last_name, email, phone, stripe_id) VALUES (?, ?, ?, ?, ?, ?)",
                            [
                                hash,
                                req.body.fname,
                                req.body.lname,
                                req.body.username,
                                req.body.phone,
                                result.id,
                            ],
                        )
                        .then(
                            (rows) => {
                                req.login(
                                    {
                                        uid: rows.insertId,
                                        email: req.body.username,
                                        first_name: req.body.fname,
                                        last_name: req.body.lname,
                                        phone: req.body.phone,
                                        stripe_id: result.id,
                                    },
                                    (err) => {
                                        if (err)
                                            this.responder.errorResponse(res, 500, <logInput>{
                                                ip: req.ip,
                                                issuer_id: rows.insertId,
                                                issuer_state: 2,
                                                msg: `Error on login for new account ${rows.insertId} due to ${err}`,
                                                tag: "ERROR",
                                                verbosity: 255,
                                            });
                                        else
                                            this.responder.successResponse(res, 200, <logInput>{
                                                ip: req.ip,
                                                issuer_id: rows.insertId,
                                                issuer_state: 1,
                                                msg: `Profile created for ${rows.insertId}`,
                                                tag: "INFO",
                                                verbosity: 255,
                                            });
                                    },
                                );
                            },
                            (error) => {
                                this.responder.errorResponse(res, 500, <logInput>{
                                    ip: req.ip,
                                    issuer_id: null,
                                    issuer_state: 0,
                                    msg: `Profile creation failed for stripe id ${result.id} due to ${error}`,
                                    tag: "ERROR",
                                    verbosity: 255,
                                });
                            },
                        );
                });
            });
        });
    }

    /**
     * Unimplemented method for updating the information of an existing profile
     * To be implemented along with several other classes which need to exist before this can be called
     */
    public UpdateProfile() {
        // TODO UpdateProfile method in UserController
    }

    /**
     * Method for creating a customer entry in the Stripe service
     * This is necessary to remember their payment information and streamline transactions
     * This has been made into its own separate method for clutter reduction
     * This is an asynchronous method so is returns a promise to make for easy interfacing
     * 
     * @param fname - Provided first name of user
     * @param lname - Provided last name of user
     * @param email - Provided email of user
     * @param phone - Provided phone number of user (could be null)
     * @returns - A promise for a new Stripe customer used to get the stripe id of the customer to be saved with user information
     */
    private genCustomer(
        fname: string,
        lname: string,
        email: string,
        phone: string | null,
    ): Promise<Stripe.Customer> {
        return new Promise<Stripe.Customer>(async (resolve) => {
            let customer: Stripe.Customer = await this.stripe.customers.create({
                name: fname + " " + lname,
                email: email,
                phone: phone,
            });
            resolve(customer);
        });
    }
}
