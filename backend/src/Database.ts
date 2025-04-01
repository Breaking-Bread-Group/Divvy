import mysql from "mysql2";

/**
 * @class Database
 * 
 * Responsible for interfacing with the mysql database. That's it
 */
export class Database {
    access: mysql.PoolOptions;
    pool: mysql.Pool;

    /**
     * Constructs class, establishing connection to database using provided information. All info should come from ServerSettings.json
     * 
     * @param URL - URL of the mysql database which will be connected to
     * @param user - Username of user we will be interfacing with mysql database as, usually I have this as 'root'
     * @param database - Name of database schema, usually 'divvy'
     * @param password - Password of mysql database for connection, should be kept secret which is why ServerSettings.json is gitignored
     */
    constructor(URL: string, user: string, database: string, password: string) {
        
        // These are unfortunately necessary to solve the undefined 'this' bug
        this.query = this.query.bind(this);
        this.querySanitized = this.querySanitized.bind(this);
        this.execute = this.execute.bind(this);
        this.executeSanitized = this.executeSanitized.bind(this);

        this.access = {
            connectionLimit: 99,
            host: URL,
            user: user,
            database: database,
            password: password,
        };
        this.pool = mysql.createPool(this.access);
    }

    /**
     * Method for querying database
     * This simple one takes a plaintext string prompt and returns the response, or at least a promise to it as this is an asynchronous operation
     * 
     * @param prompt - Plaintext string prompt in SQL for the query
     * @returns - Promise for results depending on the type of query made
     */
    public query(prompt: string) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>(
            (resolve, reject) => {
                this.pool.query(prompt, (error, rows) => {
                    if (error) reject(error);
                    resolve(rows);
                });
            },
        );
    }

    /**
     * Method for querying database
     * This slightly more advanced one takes a prompt which includes ? substitution markers which are substituted with values in a provided array
     * This is for sanitation and safety purposes as SQL injections are one of the most common and dangerous cyberattacks
     * For the love of God, please use this every time you need to place some user-provided input into a SQL query
     * 
     * @param prompt - String prompt in SQL for the query, including ? markers wherever substitution is needed
     * @param args - Array of things to be substituted into the ? markers, in the same order as the markers appear in the prompt
     * @returns - Promise for results depending on the type of query made
     */
    public querySanitized(prompt: string, args: any[]) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>(
            (resolve, reject) => {
                this.pool.query(prompt, args, (error, rows) => {
                    if (error) reject(error);
                    resolve(rows);
                });
            },
        );
    }

    /**
     * Method for querying database
     * This simple one takes a plaintext string prompt and returns the response, or at least a promise to it as this is an asynchronous operation
     * 
     * idk how execute is different from query yet but it's better to at least have the option
     * 
     * @param prompt - Plaintext string prompt in SQL for the query
     * @returns - Promise for results depending on the type of query made
     */
    public execute(prompt: string) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>(
            (resolve, reject) => {
                this.pool.execute(prompt, (error, rows) => {
                    if (error) reject(error);
                    resolve(rows);
                });
            },
        );
    }

    /**
     * Method for querying database
     * This slightly more advanced one takes a prompt which includes ? substitution markers which are substituted with values in a provided array
     * This is for sanitation and safety purposes as SQL injections are one of the most common and dangerous cyberattacks
     * For the love of God, please use this every time you need to place some user-provided input into a SQL query
     * 
     * idk how execute is different from query yet but it's better to at least have the option
     * 
     * @param prompt - String prompt in SQL for the query, including ? markers wherever substitution is needed
     * @param args - Array of things to be substituted into the ? markers, in the same order as the markers appear in the prompt
     * @returns - Promise for results depending on the type of query made
     */
    public executeSanitized(prompt: string, args: any[]) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>(
            (resolve, reject) => {
                this.pool.execute(prompt, args, (error, rows) => {
                    if (error) reject(error);
                    resolve(rows);
                });
            },
        );
    }
}
