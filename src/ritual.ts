import { Assets, Container, Sprite } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { Inventory, ItemType } from "./inventory";
import { TimeManager } from "./timeManager";
import { createHomeSign } from "./home";
import { Room } from "./room";

export class Ritual extends Room {
    container: Container;
    candles: RitualCandle[] = [];
    itemStand: Sprite;
    itemSprite: Sprite;
    itemHeld?: ItemType;
    static instance?: Ritual;

    get inventory() {
        return scene.getFirst<Inventory>(Inventory)!;
    }
    constructor() {
        super("ritual-0001");
        Ritual.instance = this;

        this.container = new Container();

        this.itemSprite = new Sprite();
        this.itemSprite.anchor.set(0.5);
        this.container.addChild(this.itemSprite);

        this.itemStand = new Sprite(Assets.get("light"));
        this.itemStand.anchor.set(0.5);
        this.itemStand.interactive = true;
        this.itemStand.on("pointerdown", () => {
            this.itemSelectedCallback(ItemType.summoningPotion);
        })
        this.container.addChild(this.itemStand);
        scene.add(Ritual, this);
        game.app.stage.addChild(this.container);

        for (let index = 0; index < 6; index++) {
            const angle = index * Math.PI * 2 / 6;
            const candle = new RitualCandle(this);
            candle.container.x = 300 * Math.cos(angle);
            candle.container.y = 100 * Math.sin(angle);
            this.candles.push(candle);
        }

        game.addUpdatable(UpdateOrder.cooking, this);

        this.hide();
    }

    itemSelectedCallback(item?: ItemType) {
        this.itemHeld = item;
        this.itemSprite.texture = Assets.get("ritual-" + item);
        this.checkConditions();
    }

    failRitual() {
        if (this.itemHeld) this.inventory.add(this.itemHeld);
        this.itemHeld = undefined;

        for (const candle of this.candles) {
            TimeManager.wait(1000 * Math.random()).then(() => candle.isLit = false);
        }
    }

    customLogic = (ritual: Ritual) => { return false; };

    show() {
        this.container.visible = true;
        super.show();
    }
    hide() {
        this.container.visible = false;
        super.hide();
    }
    
    update() {
        this.container.position.set(game.width / 2, game.height - 100);
        super.update();
    }

    checkConditions() {
        let allLit = this.candles.every(candle => candle.isLit);
        if (allLit && this.itemHeld != undefined) {
            let result = this.customLogic(this);
            if (result) {

            } else {
                this.failRitual();
            }
        }
    }

    destroy() {
        Ritual.instance = undefined;
        this.container.destroy();
        scene.remove(Ritual, this);
        game.removeUpdatable(UpdateOrder.cooking, this);
        super.destroy();
    }
}


export class RitualCandle {
    container: Container;
    sprite: Sprite;
    isLit = false;
    constructor(ritual: Ritual) {
        this.container = new Container();
        this.sprite = new Sprite(Assets.get("ritual-candle_unlit"));
        scene.add(RitualCandle, this);
        this.container.addChild(this.sprite);
        ritual.container.addChild(this.container);
        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5);

        this.container.interactive = true;
        this.container.on("pointerdown", () => {
            this.setLit(!this.isLit);
            ritual.checkConditions();
        });
    }

    setLit(state: boolean) {
        this.isLit = state;
        this.sprite.texture = this.isLit ? Assets.get("ritual-candle_lit") : Assets.get("ritual-candle_unlit");
    }

    destroy() {
        this.container.destroy();
        scene.remove(RitualCandle, this);
    }
}