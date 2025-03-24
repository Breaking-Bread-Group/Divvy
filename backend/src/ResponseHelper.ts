import express from 'express';
import {logInput} from "./logInput";
import {Logger} from "./Logger";

export class ResponseHelper {
    logger : Logger;

    constructor(logger : Logger) {
        this.logger = logger;
        this.errorResponse.bind(this);
        this.successResponse.bind(this);
    }

    public errorResponse(res : express.Response, code : number = 501, log : logInput = {
        ip: "N/A", issuer_id: null, issuer_state: 254, msg: "", tag: "WARN", verbosity: 255
    }){
        this.logger.logEntry(log);
        res.status(code).end();
    }

    public successResponse(res : express.Response, code : number = 200, log : logInput = {
        ip: "N/A", issuer_id: null, issuer_state: 254, msg: "", tag: "INFO", verbosity: 255
    }){
        this.logger.logEntry(log);
        res.status(code).end();
    }
}
