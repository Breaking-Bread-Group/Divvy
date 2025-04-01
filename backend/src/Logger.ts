import process from "process";
import { logInput } from "./logInput";
import { Database } from "./Database";

/**
 * @class Logger
 * 
 * Responsible for logging all, if not most, occurrences on the system to ensure easier long-term troubleshooting which is persistently stored
 * 
 */
export class Logger {
    db: Database;

    /**
     * Constructs class, placing references to important running classes within it
     * 
     * @param db - Reference to Database class, used for interfacing with the mysql database for logging
     */
    constructor(db: Database) {
        this.db = db;

        // These are unfortunately necessary to solve the undefined 'this' bug
        this.logEntry = this.logEntry.bind(this);
        this.catchError = this.catchError.bind(this);

        // Will catch fatal system errors and log them before dying
        process.on(
            "uncaughtException",
            function (err) {
                this.catchError(err);
                console.error(err);
                process.exit(1);
            }.bind(this),
        );
    }

    /**
     * Logs anything on the database
     * 
     * @param log - The info to be logged. All fields must be included as this is important information to keep track of. See any usage of this for an example.
     */
    public logEntry(
        // Default values just in case someone forgets to put anything. These are pretty useless though so don't forget to set them in your calls.
        log: logInput = {
            ip: "N/A",
            issuer_id: null,
            issuer_state: 254,
            msg: "",
            tag: "INFO",
            verbosity: 0,
        },
    ) {
        this.db.querySanitized(
            "INSERT INTO log (tag, log_time, message, issuer_id, issuerState, ip, verbosity) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                log.tag,
                new Date().toISOString().slice(0, 19).replace("T", " "),
                log.msg,
                log.issuer_id,
                log.issuer_state,
                log.ip,
                log.verbosity,
            ],
        );
    }

    /**
     * Specialized usecase of logEntry in which a big error must be reported. This functions the same, but needs less inputs to work.
     * 
     * @param err - Error information to be logged
     */
    public catchError(err: Error) {
        this.db.querySanitized(
            "INSERT INTO log (tag, log_time, message, issuer_id, issuerState, ip, verbosity) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                "FATAL",
                new Date().toISOString().slice(0, 19).replace("T", " "),
                err.message,
                null,
                255,
                "N/A",
                255,
            ],
        );
    }
}
