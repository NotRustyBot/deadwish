import { Sprite, Assets } from "pixi.js";
import { game, type IUpdatable } from "./game";
import type { IDestroyable } from "./scene";
import { createHomeSign } from "./home";

export class Room implements IDestroyable, IUpdatable {
    bgSprite: Sprite;
    homeSign?: HTMLImageElement;
    constructor(asset: string, isHome = false) {
        this.bgSprite = new Sprite(Assets.get(asset));
        this.bgSprite.anchor.set(0.5);
        game.app.stage.addChild(this.bgSprite);
        if (!isHome)
            this.homeSign = createHomeSign(this);
    }
    destroy(): void {
        this.bgSprite.destroy();
        if (this.homeSign)
            this.homeSign.remove();
    }
    update(): void {
        const ratio = game.app.screen.height / this.bgSprite.texture.height;
        this.bgSprite.position.set(game.app.screen.width / 2, game.app.screen.height / 2);
        this.bgSprite.scale.set(ratio);
    }
    hide() {
        this.bgSprite.visible = false;
        if (this.homeSign)
            this.homeSign.style.display = "none";
    };
    show() {
        console.log("showing room");
        this.bgSprite.visible = true;
        if (this.homeSign)
            this.homeSign.style.display = "block";
    };
}