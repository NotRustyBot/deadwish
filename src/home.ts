import { Assets, FederatedPointerEvent, Graphics, Rectangle, Sprite } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { sound } from "@pixi/sound";
import { Chat } from "./chat";
import { TimeManager } from "./timeManager";

export class Home {
    bgSprite: Sprite;
    graphics: Graphics;
    currentNumber = 1;
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
        if(Chat.isInChat) return;
        const doorDist = 500;
        const doorWidth = 250;
        const doorHeight = 700;
        const ritualRect = new Rectangle(-doorWidth/2, -doorHeight/2, doorWidth, doorHeight);
        const crystalBallRect = new Rectangle(-doorWidth/2 - doorDist, -doorHeight/2, doorWidth, doorHeight);
        const alchemyRect = new Rectangle(-doorWidth/2 + doorDist, -doorHeight/2, doorWidth, doorHeight);
        const localPos = e.getLocalPosition(this.bgSprite);

        //this.graphics.clear();
        //this.graphics.rect(crystalBallRect.x, crystalBallRect.y, crystalBallRect.width, crystalBallRect.height);
        //this.graphics.fill(0xffaa00);
        if (crystalBallRect.contains(localPos.x, localPos.y)) {
            this.setBg(2);
        }
        else if (ritualRect.contains(localPos.x, localPos.y)) {
            this.setBg(3);
        }
        else if (alchemyRect.contains(localPos.x, localPos.y)) {
            this.setBg(4);
        }
        else {
            this.setBg(1);
        }
    }

    async transition() {
        TimeManager.animate(0.5, (progress, time) => {
            game.app.stage.alpha = 1 - progress;
        })
        await TimeManager.wait(500);
        TimeManager.animate(0.5, (progress, time) => {
            game.app.stage.alpha = progress;
        })
    }

    setBg(number: 1 | 2 | 3 | 4 = 1) {
        this.bgSprite.texture = Assets.get("home-000" + number);
        if(this.currentNumber !== number) {
            if(number > 1) {
                sound.play("sfx-door_open",{volume:0.4});
            }
            else {
                sound.play("sfx-door_close",{volume:0.2});
            }
            this.currentNumber = number;
        }
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