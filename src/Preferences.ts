import DISingleton from "web-atoms-core/dist/di/DISingleton";

@DISingleton({
    inject: "./{platform}/Preferences"
})
export default abstract class Preferences {

    public abstract get session(): ISynchronousStorage;
    public abstract get permanent(): ISynchronousStorage;

}

export interface ISynchronousStorage {
    getItem<T>(name: string, def?: T): T;
    setItem<T>(name: string, value: T): void;
    removeItem(name: string);
    clearAll();
}
