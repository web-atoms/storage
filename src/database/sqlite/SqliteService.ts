import DISingleton from "@web-atoms/core/dist/di/DISingleton";
import Query, { IQuery, IQueryFragments } from "../../query/Query";

declare var bridge;

function escapeLiteral(name: string) {
    return `"${name.replace(/\"/g, "\\\"")}"`;
}

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

    public insertAsync(table: string, obj: ISqliteRecord): Promise<ISqliteResult> {
        table = escapeLiteral(table);
        const fields = [];
        const values = [];
        const params = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const element = obj[key];
                if (key.startsWith("_$_")
                    || (typeof element === "object" && !(element instanceof Date))
                    || Array.isArray(element)
                    || element === undefined) {
                    continue;
                }
                params.push("?");
                fields.push(escapeLiteral(key));
                values.push(element);
            }
        }
        const sql = `INSERT INTO ${table} (${fields.join(",")}) VALUES (${params.join(",")})`;
        return this.executeSqlAsync(sql, values);
    }

    public updateAsync(table: string, obj: ISqliteRecord, filter?: IQuery): Promise<ISqliteResult> {
        let set = Query.fragments(" SET ", " , ");
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const element = obj[key];
                if (key.startsWith("_$_")
                    || (typeof element === "object" && !(element instanceof Date))
                    || Array.isArray(element)
                    || element === undefined) {
                    continue;
                }
                const name = Query.literal(key, escapeLiteral);
                set = set.add ` ${name} = ${element} `;
            }
        }
        const tableName = Query.literal(table, escapeLiteral);
        const sql = filter
            ? Query.create `UPDATE ${tableName} ${set} WHERE ${filter}`
            : Query.create `UPDATE ${tableName} ${set}`;
        const q = sql.toQueryArguments();
        return this.executeSqlAsync(q.command, q.arguments);
    }

    public deleteAsync(table: string, filter?: IQuery): Promise<ISqliteResult> {
        const tableName = Query.literal(table, escapeLiteral);
        const sql = filter
            ? Query.create `DELETE ${tableName} WHERE ${filter}`
            : Query.create `DELETE ${tableName} `;
        const q = sql.toQueryArguments();
        return this.executeSqlAsync(q.command, q.arguments);
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

    /**
     * Opens database on the device, if the version is different, old database is deleted
     * and new empty one is created
     * @param file file name of Database
     * @param version version
     * @param name Description
     * @param size Ignored on Web Atoms
     */
    public openDatabase(file: string, version?: number, name?: string, size?: number ): SqliteConnection {
        return new SqliteConnection(bridge.database.openDatabase(file, version, name, size));
    }

}
