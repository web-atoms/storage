export interface IQueryPart {
    literal?: string;
    hasArgument?: boolean;
    argument?: any;
}

export interface IQueryFragments {
    add(query: IQuery ): IQueryFragments;
    add(query: TemplateStringsArray, ... args: any[]): IQueryFragments;
}

class QueryFragments implements IQueryFragments {

    public readonly fragments: IQueryPart[][] = [];

    public readonly prefix: string;

    public readonly separator: string;

    constructor(
        separator: string,
        prefix?: string) {
        this.prefix = prefix;
        this.separator = separator;
    }

    public add(query: IQuery | TemplateStringsArray, ... args: any[]): QueryFragments {

        const isEmpty = this.fragments.length === 0;

        if (!(query instanceof QueryObject)) {
            query = QueryObject.create(query as TemplateStringsArray, ... args);
        }
        // this.fragments.push(query);
        const fa = (query as any).fragments as IQueryPart[];
        this.fragments.push(fa);
        return this;
    }

    public toQuery(): QueryObject {
        const f: IQueryPart[] = [];
        if (this.prefix) {
            f.push({ literal: this.prefix });
        }
        let i = 0;
        for (const iterator of this.fragments) {
            if (i++) {
                f.push({ literal: this.separator });
            }
            for (const fa of iterator) {
                f.push(fa);
            }
        }
        return new QueryObject(f);
    }

}

export interface IQuery {
    toQuery(): IQueryWithParameters;
    toQueryArguments(): { command: string, arguments: any[] };
}

function fragments(separator: string): IQueryFragments;
// tslint:disable-next-line: unified-signatures
function fragments(prefix: string, separator?: string): IQueryFragments;
function fragments(prefix: string, separator?: string): IQueryFragments {
    return new QueryFragments(separator ? separator : prefix, separator ? prefix : "");
}

class QueryObject {

    public static create(query: TemplateStringsArray, ... args: any[]): IQuery {
        const q = new QueryObject(null);
        for (let index = 0; index < args.length; index++) {
            const element = args[index];
            const raw = query.raw[index];
            if (raw) {
                q.fragments.push({ literal: raw });
            }
            if (element instanceof QueryObject) {
                q.fragments = q.fragments.concat(element.fragments);
            } else if (element instanceof QueryFragments) {
                q.fragments = q.fragments.concat(element.toQuery().fragments);
            } else {
                q.fragments.push({ hasArgument: true, argument: element });
            }
        }
        const last = query.raw[args.length];
        if (last) {
            q.fragments.push({ literal: last });
        }
        return q;
    }

    public static literal(text: string, escape?: ((t: string) => string)): IQuery {
        const q = new QueryObject(null);
        q.fragments.push({ literal: escape
            ? escape(text)
            : text });
        return q;
    }

    private fragments: IQueryPart[] = [];

    constructor(fragments: IQueryPart[]);
    constructor(text: string | IQueryPart[], args?: any[]) {
        if (!text) {
            return;
        }

        if (typeof text !== "string" && Array.isArray(text)) {
            this.fragments = text;
            return;
        }

        if (!args) {
            return;
        }
        for (let i = 0; i < args.length; i++) {
            const sep = `{${i}}`;
            const index = text.indexOf(sep);

            const prefix = text.substring(0, index);
            text = text.substring(index + sep.length);
            const arg = args[i];
            this.fragments.push({ literal: prefix });
            if (arg instanceof QueryObject) {
                this.fragments = this.fragments.concat(arg.fragments);
            } else if (arg instanceof QueryFragments) {
                const qf = arg.toQuery();
                this.fragments = this.fragments.concat(qf.fragments);
            } else if (typeof arg !== "string" && Array.isArray(arg)) {
                let i2 = 0;
                for (const iterator of arg) {
                    if (i2++) {
                        this.fragments.push({ literal: "," });
                    }
                    this.fragments.push({ hasArgument: true, argument: iterator });
                }
            } else {
                this.fragments.push({ hasArgument: true, argument: arg});
            }
        }
        this.fragments.push({ literal: text });
    }

    /**
     * Returns key value pair style parameters and command
     * @param prefix Parameter Prefix
     */
    public toQuery(prefix?: string): IQueryWithParameters {
        const args: {[key: string]: any} = {};
        prefix = prefix || "@p";
        let s = "";
        let i = 0;
        for (const iterator of this.fragments) {
            if (iterator.hasArgument) {
                const a = prefix + i;
                args[a] = iterator.argument;
                i++;
                s += a;
            } else {
                s += iterator.literal;
            }
        }
        return {
            command: s,
            parameters: args
        };
    }

    /**
     * Returns question mark and arguments array
     */
    public toQueryArguments(): { command: string, arguments: any[] } {
        const args = [];
        let s = "";
        for (const iterator of this.fragments) {
            if (iterator.hasArgument) {
                args.push(iterator.argument);
                s += "?";
            } else {
                s += iterator.literal;
            }
        }

        return {
            command: s,
            arguments: args
        };

    }
}

export interface IQueryWithParameters {
    command: string;
    parameters: {[key: string]: any};
}

const Query = {

    create: QueryObject.create,
    literal: QueryObject.literal,
    fragments

};

export default Query;
