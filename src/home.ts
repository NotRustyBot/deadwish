import { Assets, FederatedPointerEvent, Rectangle, Sprite } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";

export class Home {
    bgSprite: Sprite;
    constructor() {
        this.bgSprite = new Sprite(Assets.get("home-0001"));
        this.bgSprite.anchor.set(0.5);
        game.app.stage.addChild(this.bgSprite);

        this.bgSprite.addEventListener("pointermove", this.mouseMove, true);
        this.setBg();
        scene.add(Home, this);
        game.addUpdatable(UpdateOrder.ui, this);
    }

    mouseMove() {
        const crystalBallRect = new Rectangle(0.3 * game.app.screen.width, 0.2 * game.app.screen.height, 0.1 * game.app.screen.width, 0.6 * game.app.screen.height);
        if (crystalBallRect.contains(game.input.mouse.position.x, game.input.mouse.position.y)) {
            this.setBg(2);
        }
        else {
            this.setBg(1);
        }
    }

    setBg(number: 1 | 2 | 3 | 4 = 1) {
        this.bgSprite.texture = Assets.get("home-000" + number);
    }

    update() {
        //fit height
        this.mouseMove()
        const ratio = game.app.screen.height / this.bgSprite.texture.height;
        this.bgSprite.position.set(game.app.screen.width / 2, game.app.screen.height / 2);
        this.bgSprite.scale.set(ratio);
    }
    destroy() {
        game.app.stage.removeChild(this.bgSprite);
        this.bgSprite.destroy();
    }
}