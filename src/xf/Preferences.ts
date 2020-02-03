import { Inject } from "@web-atoms/core/dist/di/Inject";
import { JsonService } from "@web-atoms/core/dist/services/JsonService";
import Preferences, { ISynchronousStorage } from "../Preferences";
import { SyncStorage } from "../SyncStorage";

declare var bridge: { preferences: Storage };

export default class XFPreferences extends Preferences {

    private mSession: ISynchronousStorage;

    constructor(
        @Inject private jsonService: JsonService) {
        super();
    }

    public get session(): ISynchronousStorage {
        return this.mSession || (this.mSession = new SyncStorage("wa-pref", bridge.preferences, this.jsonService));
    }

    public get permanent(): ISynchronousStorage {
        return this.session;
    }
}
