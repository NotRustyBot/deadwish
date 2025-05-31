import { Assets, FederatedPointerEvent, Graphics, Rectangle, Sprite } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";

export class Home {
    bgSprite: Sprite;
    graphics: Graphics;
    constructor() {
        this.bgSprite = new Sprite(Assets.get("home-0001"));
        this.bgSprite.anchor.set(0.5);
        game.app.stage.addChild(this.bgSprite);

        this.bgSprite.addEventListener("pointermove", (e) => { this.mouseMove(e) }, true);
        this.bgSprite.interactive = true;
        this.graphics = new Graphics();

        this.setBg();
        scene.add(Home, this);
        game.addUpdatable(UpdateOrder.ui, this);
        this.bgSprite.addChild(this.graphics);
    }

    mouseMove(e: FederatedPointerEvent) {
        const crystalBallRect = new Rectangle(100, 100, 100, 100);
        const localPos = e.getLocalPosition(this.bgSprite);

        this.graphics.clear();
        this.graphics.rect(crystalBallRect.x, crystalBallRect.y, crystalBallRect.width, crystalBallRect.height);
        this.graphics.fill(0xffaa00);
        if (crystalBallRect.contains(localPos.x, localPos.y)) {
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

        const ratio = game.app.screen.height / this.bgSprite.texture.height;
        this.bgSprite.position.set(game.app.screen.width / 2, game.app.screen.height / 2);
        this.bgSprite.scale.set(ratio);
    }
    destroy() {
        game.app.stage.removeChild(this.bgSprite);
        this.bgSprite.destroy();
    }
}