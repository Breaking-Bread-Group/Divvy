import process from 'process';
import {logInput} from "./logInput";
import {Database} from "./Database";

export class Logger {
    db : Database

    constructor(db : Database) {
        this.db = db;
        this.logEntry.bind(this);
        this.catchError.bind(this);

        process.on('uncaughtException', function(err) {
            this.catchError(err);
            console.error(err);
            process.exit(1);
        }.bind(this));
    }

    public logEntry(log : logInput = {
        ip: "N/A", issuer_id: null, issuer_state: 254, msg: "", tag: "INFO", verbosity: 0
    }){
        this.db.queryARGS("INSERT INTO log (tag, log_time, message, issuer_id, issuerState, ip, verbosity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                log.tag,
                `${new Date().getFullYear()}-` +
                `${String(new Date().getMonth() + 1).padStart(2, '0')}-` +
                `${String(new Date().getDate()).padStart(2, '0')} ` +
                `${String(new Date().getHours()).padStart(2, '0')}:` +
                `${String(new Date().getMinutes()).padStart(2, '0')}:` +
                `${String(new Date().getSeconds()).padStart(2, '0')}.` +
                `${String(new Date().getMilliseconds()).padStart(3, '0')}`,
                log.msg,
                log.issuer_id,
                log.issuer_state,
                log.ip,
                log.verbosity
            ]
        )
    }

    public catchError(err : Error){
        this.db.queryARGS("INSERT INTO log (tag, log_time, message, issuer_id, issuerState, ip, verbosity) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [
                "FATAL",
                `${new Date().getFullYear()}-` +
                `${String(new Date().getMonth() + 1).padStart(2, '0')}-` +
                `${String(new Date().getDate()).padStart(2, '0')} ` +
                `${String(new Date().getHours()).padStart(2, '0')}:` +
                `${String(new Date().getMinutes()).padStart(2, '0')}:` +
                `${String(new Date().getSeconds()).padStart(2, '0')}.` +
                `${String(new Date().getMilliseconds()).padStart(3, '0')}`,
                err.message,
                null,
                255,
                "N/A",
                255
            ]
        )
    }
}
