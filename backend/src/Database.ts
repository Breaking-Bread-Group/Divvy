import mysql from 'mysql2'

export class Database {
    access : mysql.PoolOptions;
    pool : mysql.Pool;

    constructor(URL : string, user : string, database : string, password : string) {
        this.querySOLO.bind(this);
        this.queryARGS.bind(this);
        this.executeSOLO.bind(this);
        this.executeARGS.bind(this);

        this.access = {
            connectionLimit: 99,
            host: URL,
            user : user,
            database : database,
            password: password
        };
        this.pool = mysql.createPool(this.access);
    }

    public querySOLO(prompt : string) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>((resolve, reject) => {
            this.pool.query(prompt, (error, rows) => {
                if(error) reject(error);
                resolve(rows);
            });
        });
    }
    public queryARGS(prompt : string, args : any[]) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>((resolve, reject) => {
            this.pool.query(prompt, args, (error, rows) => {
                if(error) reject(error);
                resolve(rows);
            });
        });
    }

    public executeSOLO(prompt : string) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>((resolve, reject) => {
            this.pool.execute(prompt, (error, rows) => {
                if(error) reject(error);
                resolve(rows);
            });
        });
    }
    public executeARGS(prompt : string, args : any[]) {
        return new Promise<mysql.RowDataPacket[] | mysql.ResultSetHeader | any>((resolve, reject) => {
            this.pool.execute(prompt, args, (error, rows) => {
                if(error) reject(error);
                resolve(rows);
            });
        });
    }
}
