export interface IDestroyable {
    destroy(): void;
}

export class Scene {
    objects: Record<any, Set<IDestroyable>> = {}

    add(name: any, object: IDestroyable) {
        if (!this.objects[name]) this.objects[name] = new Set();
        this.objects[name].add(object);
    }

    remove(name: any, object: IDestroyable) {
        if (!this.objects[name]) return;
        this.objects[name].delete(object);
    }

    get<T>(name: any): Set<T> {
        if (!this.objects[name]) return new Set();
        return this.objects[name] as Set<T>;
    }

    getFirst<T>(name: any): T | null {
        if (!this.objects[name]) return null;
        return Array.from(this.objects[name])[0] as T;
    }

    clear() {
        for (const key in this.objects) {
            const set = this.objects[key];
            for (const object of set) {
                object.destroy();
            }
        }
    }

    setup() { this._setup(this); }
    private _setup: (scene: Scene) => void = () => { }


    static define(setup: (scene: Scene) => void) {
        const scene = new Scene();
        scene._setup = setup;
        return scene;
    }
}