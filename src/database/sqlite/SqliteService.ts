import DISingleton from "@web-atoms/core/dist/di/DISingleton";

declare var bridge;

export interface ISqliteResult {
    error?: string;
    insertId?: number;
    rowsAffected?: number;
    rows?: any[];
}

export interface ISqliteRecord {
    [key: string]: (Date | number | string | boolean | null);
}

export class SqliteTransaction {
    constructor(private tx: any) {}

    public executeSql(text: string, p: any[], cb?: (r: ISqliteResult) => void) {
        this.tx.executeSql(text, p, cb);
    }

    public executeSqlAsync(text: string, p: any[]): Promise<ISqliteResult> {
        return this.tx.executeSqlAsync(text, p);
    }

    public insertAsync(table: string, obj: ISqliteResult): Promise<ISqliteResult> {
        const fields = [];
        const values = [];
        const params = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const element = obj[key];
                params.push("?");
                fields.push(key);
                values.push(element);
            }
        }
        const sql = `INSERT INTO ${table} (${fields.join(",")}) VALUES (${params.join(",")})`;
        return this.executeSqlAsync(sql, values);
    }

    public updateAsync(table: string, obj: ISqliteResult): Promise<ISqliteResult> {
        const fields = [];
        const values = [];
        const params = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const element = obj[key];
                params.push("?");
                fields.push(key);
                values.push(element);
            }
        }
        const sql = `INSERT INTO ${table} (${fields.join(",")}) VALUES (${params.join(",")})`;
        return this.executeSqlAsync(sql, values);
    }
}

export class SqliteConnection {

    constructor(private conn: any) {

    }

    public transaction(tx: (t: SqliteTransaction) => void, callback?: (e: string) => void) {
        return this.conn.transaction((x) => tx(new SqliteTransaction(x)), callback);
    }

    public transactionAsync(tx: (t: SqliteTransaction) => void) {
        return this.conn.transactionAsync((x) => tx(new SqliteTransaction(x)));
    }
}

@DISingleton()
export default class SqliteService {

    public openDatabase(name: string, ... p: any[] ): SqliteConnection {
        return new SqliteConnection(bridge.database.openDatabase(name));
    }

}
