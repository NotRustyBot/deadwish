import type { Application } from "pixi.js";

export let game: Game;

export class Game {
    app: Application;

    get dt() { return this.app.ticker.elapsedMS / 1000; }

    constructor(app: Application) {
        this.app = app;
        game = this;
        app.ticker.add(() => game.update());
    }

    init() { }

    update() { }
}