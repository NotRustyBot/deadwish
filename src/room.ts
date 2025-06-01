import { Sprite, Assets } from "pixi.js";
import { game, scene, type IUpdatable } from "./game";
import type { IDestroyable } from "./scene";
import { sound } from "@pixi/sound";
import { Inventory } from "./inventory";
import type { Home } from "./home";

export class Room implements IDestroyable, IUpdatable {
    bgSprite: Sprite;
    homeSign?: HTMLImageElement;
    constructor(asset: string, isHome = false) {
        this.bgSprite = new Sprite(Assets.get(asset));
        this.bgSprite.anchor.set(0.5);
        game.roomContainer.addChild(this.bgSprite);
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

export function createHomeSign(room: Room, className?: string) {
    const homeSign = new Image();
    homeSign.src = "img/home_sign.png";
    document.getElementById("app")!.after(homeSign);
    homeSign.classList.add("home-sign");
    if (className) homeSign.classList.add(className);

    homeSign.addEventListener("mouseenter", () => sound.play("sfx-door_open", { volume: 0.4, singleInstance: true }));
    homeSign.addEventListener("mouseleave", () => sound.play("sfx-door_close", { volume: 0.4, singleInstance: true }));
    homeSign.addEventListener("click", () => {
        room.hide();
        scene.getFirst<Inventory>(Inventory)?.hideItemSelection();
        scene.getFirst<Home>("home")?.show();
    });

    return homeSign;
}