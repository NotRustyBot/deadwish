import { Assets, Container, Sprite } from "pixi.js";
import { Emotion, type Person } from "./person";
import { game, UpdateOrder, type IUpdatable } from "./game";
import type { IDestroyable } from "./scene";

export class ClickablePerson implements IUpdatable, IDestroyable {
    person: Person;
    sprite: Sprite;
    constructor(person: Person, container: Container) {
        this.person = person;
        let textureName = (person.emotionImages[Emotion.standing] ?? person.emotionImages[Emotion.neutral]!).slice(4).replace("/", "-").replace(".png", "");
        this.sprite = new Sprite(Assets.get(textureName));
        this.sprite.anchor.set(0.5);
        this.sprite.scale.set(0.8);
        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => this.person.showChat());
        container.addChild(this.sprite);
        game.addUpdatable(UpdateOrder.ui, this);
    }
    update() {
        this.sprite.position.set(150, game.app.screen.height / 2);
        this.sprite.visible = !(this.person.chat.htmlChat.parentElement.style.display == "block")
    }
    destroy(): void {
        this.sprite.destroy();
        game.removeUpdatable(UpdateOrder.ui, this);
    }
}