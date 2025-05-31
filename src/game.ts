import type { Application } from "pixi.js";
import type { Scene } from "./scene";
import { testing } from "./levels";
import { TimeManager } from "./timeManager";

export let game: Game;
export let scene: Scene;

export enum UpdateOrder {
    system,
    ui,
}

export interface IUpdatable {
    update(): void
}


export class Game {
    app: Application;

    get scene() { return scene; }
    set scene(value: Scene) {
        if (this.scene) this.scene.clear();
        scene = value;
    }

    updateOrder: Array<UpdateOrder> = Object.keys(UpdateOrder).filter(k => isNaN(parseInt(k))).map(k => UpdateOrder[k as keyof typeof UpdateOrder]);
    toUpdate = new Map<UpdateOrder, Array<IUpdatable>>();

    addUpdatable(order: UpdateOrder, updatable: IUpdatable) {
        if (!this.toUpdate.has(order)) this.toUpdate.set(order, []);
        this.toUpdate.get(order)!.push(updatable);
    }

    removeUpdatable(order: UpdateOrder, updatable: IUpdatable) {
        if (!this.toUpdate.has(order)) return;
        this.toUpdate.get(order)!.splice(this.toUpdate.get(order)!.indexOf(updatable), 1);
    }

    get width() { return this.app.screen.width; }
    get height() { return this.app.screen.height; }
    get dt() { return this.app.ticker.elapsedMS / 1000; }

    constructor(app: Application) {
        this.app = app;
        game = this;
        app.ticker.add(() => game.update());
    }

    init() {
        TimeManager.init();
        testing();
    }

    update() {
        for (const order of this.updateOrder) {
            if (!this.toUpdate.has(order)) continue;
            for (const updatable of this.toUpdate.get(order)!) {
                updatable.update();
            }
        }
    }

}