import { Assets, Container, Sprite } from "pixi.js";
import { Emotion, type Person } from "./person";
import { game, UpdateOrder, type IUpdatable } from "./game";
import type { IDestroyable } from "./scene";

export class ClickablePerson implements IUpdatable, IDestroyable {
    person: Person;
    sprite: Sprite;
    xOffset = 0;
    scale = 0.6;
    constructor(person: Person, container: Container, scale = 0.6, xOffset = 0) {
        this.scale = scale;
        this.person = person;
        this.xOffset = xOffset;
        let textureName = (person.emotionImages[Emotion.standing] ?? person.emotionImages[Emotion.neutral]!).slice(4).replaceAll("/", "-").replace(".png", "");
        this.sprite = new Sprite(Assets.get(textureName));
        this.sprite.anchor.set(0.5, 0.7);
        this.sprite.scale.set(scale);
        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => this.person.showChat());
        container.addChild(this.sprite);
        game.addUpdatable(UpdateOrder.ui, this);
    }
    update() {
        this.sprite.scale.set(game.app.screen.height / this.sprite.texture.height * this.scale * 1.3);
        this.sprite.position.set(game.app.screen.width / 2 - (660 + this.xOffset)*game.app.screen.height / 1080, game.app.screen.height * .7);
        this.sprite.visible = !(this.person.chat.htmlChat.parentElement.style.display == "block")
    }
    destroy(): void {
        this.sprite.destroy();
        game.removeUpdatable(UpdateOrder.ui, this);
    }
}