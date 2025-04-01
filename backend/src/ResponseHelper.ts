import express from "express";
import { logInput } from "./logInput";
import { Logger } from "./Logger";

/**
 * @class ResponseHelper
 * 
 * Helper class for carrying out responses that are commonplace enough to warrant shared methods.
 * Meant to reduce clutter and provide consistent response behavior.
 * 
 */
export class ResponseHelper {
    logger: Logger;

    /**
     * Constructs class, placing references to important running classes within it
     * 
     * @param logger - Reference to Logger for ability to quickly log responses
     */
    constructor(logger: Logger) {
        this.logger = logger;

        // These are unfortunately necessary to solve the undefined 'this' bug
        this.errorResponse = this.errorResponse.bind(this);
        this.successResponse = this.successResponse.bind(this);
    }

    /**
     * Gives an error response to the user when something has gone wrong, on their end or ours.
     * This includes their mistakes such as wrong passwords and bad requests.
     * 
     * @param res - Express response object
     * @param code - Response code to be given to the user, consult a list of http codes for more info
     * @param log - logInput data to tell the helper how this event should be logged
     */
    public errorResponse(
        res: express.Response,
        // Default values, somewhat useless so please set them in your calls
        code: number = 501,
        log: logInput = {
            ip: "N/A",
            issuer_id: null,
            issuer_state: 254,
            msg: "",
            tag: "WARN",
            verbosity: 255,
        },
    ) {
        this.logger.logEntry(log);
        res.status(code).end();
    }

    /**
     * Gives a success responses for when the request has been received and carried out with no issues.
     * 
     * @param res - Express response object
     * @param code - Response code given to the user, consult a list of http codes for more info
     * @param log - logInput data to tell the helper how this event should be logged
     */
    public successResponse(
        res: express.Response,
        // Default values, somewhat useless so please set them in your calls
        code: number = 200,
        log: logInput = {
            ip: "N/A",
            issuer_id: null,
            issuer_state: 254,
            msg: "",
            tag: "INFO",
            verbosity: 255,
        },
    ) {
        this.logger.logEntry(log);
        res.status(code).end();
    }
}
