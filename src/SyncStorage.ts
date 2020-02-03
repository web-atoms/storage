import { JsonService } from "@web-atoms/core/dist/services/JsonService";
import { ISynchronousStorage } from "./Preferences";
export class SyncStorage implements ISynchronousStorage {
    /**
     *
     */
    constructor(private prefix: string, private storage: Storage, private jsonService: JsonService) {
    }
    public getItem<T>(name: string, def?: T): T {
        name = `${this.prefix}-${name}`;
        const v = this.storage.getItem(name);
        if (v === undefined || v === null) {
            return def;
        }
        if (!v) {
            return def;
        }
        return this.jsonService.parse(v);
    }
    public setItem<T>(name: string, value: T): void {
        name = `${this.prefix}-${name}`;
        if (!value) {
            this.storage.removeItem(name);
            return;
        }
        this.storage.setItem(name, this.jsonService.stringify(value));
    }
    public removeItem(name: string) {
        name = `${this.prefix}-${name}`;
        this.storage.removeItem(name);
    }
    public clearAll() {
        const keys = [];
        for (let i = 0; i < this.storage.length; i++) {
            const key = this.storage.key(i);
            if (key.startsWith(this.prefix)) {
                keys.push(key);
            }
        }
        for (const iterator of keys) {
            this.storage.removeItem(iterator);
        }
    }
}
