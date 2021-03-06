import { Inject } from "@web-atoms/core/dist/di/Inject";
import { JsonService } from "@web-atoms/core/dist/services/JsonService";
import Preferences, { ISynchronousStorage } from "../Preferences";
import { SyncStorage } from "../SyncStorage";

export default class WebPreferences extends Preferences {

    private mSession: ISynchronousStorage;
    private mPermanent: ISynchronousStorage;

    constructor(
        @Inject private jsonService: JsonService) {
        super();
    }

    public get session(): ISynchronousStorage {
        return this.mSession || (this.mSession = new SyncStorage("wa-pref", window.sessionStorage, this.jsonService));
    }

    public get permanent(): ISynchronousStorage {
        return this.mPermanent ||
            (this.mPermanent = new SyncStorage("wa-pref", window.localStorage, this.jsonService));
    }
}
