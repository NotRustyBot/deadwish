import { Assets, Container, Graphics, Rectangle, Sprite } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { Inventory, ItemType, itemTypeToTexture } from "./inventory";
import { TimeManager } from "./timeManager";
import { Room } from "./room";
import { sound } from "@pixi/sound";
import { fitSprite, randomRange } from "./utils";

export class Ritual extends Room {
    personContainer: Container;
    container: Container;
    candles: RitualCandle[] = [];
    itemStand: Sprite;
    itemSprite: Sprite;
    itemHeld?: ItemType;
    static instance?: Ritual;
    graphics: Graphics

    get inventory() {
        return scene.getFirst<Inventory>(Inventory)!;
    }
    constructor() {
        super("ritual-0001");
        Ritual.instance = this;

        this.container = new Container();
        this.personContainer = new Container();
        this.graphics = new Graphics();
        this.itemSprite = new Sprite();
        this.itemSprite.anchor.set(0.5, 1);


        this.itemStand = new Sprite(Assets.get("ritual-ritual_circle"));
        this.itemStand.anchor.set(0.5);
        this.itemStand.interactive = true;
        this.itemStand.on("pointerdown", () => {
            if (this.itemHeld) {
                this.inventory.add(this.itemHeld);
                this.itemHeld = undefined;
                this.itemSprite.texture = Assets.get("inventory-none");
                return;
            }

            this.inventory.selectItem().then(item => this.itemSelectedCallback(item));
        })

        this.container.addChild(this.itemStand);
        this.container.addChild(this.graphics);
        this.container.addChild(this.itemSprite);

        scene.add(Ritual, this);
        game.roomContainer.addChild(this.container);
        game.roomContainer.addChild(this.personContainer);

        for (let index = 0; index < 6; index++) {
            const angle = index * Math.PI * 2 / 6 + Math.PI / 6;
            const candle = new RitualCandle(this);
            candle.container.x = 300 * Math.cos(angle);
            candle.container.y = 120 * Math.sin(angle);
            candle.container.scale = (Math.sin(angle) * 0.5 + 0.5) * .8 + .7;
            this.candles.push(candle);
        }

        game.addUpdatable(UpdateOrder.cooking, this);

        this.hide();
    }

    matchPattern(string: string) {
        return string === this.candles.map(candle => candle.isLit ? 1 : 0).join("");
    }

    ritualSuccess(){
        sound.play("sfx-summon");
    }

    itemSelectedCallback(item?: ItemType) {
        this.itemHeld = item;
        if (item) {
            this.itemSprite.texture = Assets.get(itemTypeToTexture[item]);
        } else {
            this.itemSprite.texture = Assets.get("inventory-none");
        }

        fitSprite(this.itemSprite, 100, 100);

        this.checkConditions();
    }

    failRitual() {
        if (this.itemHeld) this.inventory.add(this.itemHeld);
        this.itemHeld = undefined;

        let i = 0;
        for (const candle of this.candles) {
            i++;
            TimeManager.wait(300 * i).then(() => candle.setLit(false));
        }
    }

    customLogic = (ritual: Ritual) => { };

    override show() {
        this.container.visible = true;
        this.personContainer.visible = true;
        super.show();
    }
    override hide() {
        this.container.visible = false;
        this.personContainer.visible = false;
        super.hide();
    }

    update() {
        this.graphics.clear();
        this.container.position.set(game.width / 2, game.height - 200);
        for (let i = 0; i < this.candles.length; i++) {
            const candle = this.candles[i];
            candle.update();
            if (candle.isLit) {
                for (const j of [(i - 2 % this.candles.length + this.candles.length) % this.candles.length, (i + 2 % this.candles.length + this.candles.length) % this.candles.length]) {
                    const otherCandle = this.candles[j];
                    if (otherCandle.isLit) {
                        const scaleX = .7;
                        const scaleY = .5;
                        const offsetY = -7;
                        this.graphics.moveTo(candle.container.x * scaleX, candle.container.y * scaleY + offsetY);
                        this.graphics.lineTo(otherCandle.container.x * scaleX, otherCandle.container.y * scaleY + offsetY);
                        this.graphics.stroke({ width: 2, color: 0xff00ff });
                    }
                }
            }
        }
        super.update();
    }

    checkConditions() {
        if (this.itemHeld != undefined) {
            let result = this.customLogic(this);
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
    light: Sprite;
    isLit = false;
    offset = randomRange(0, 5);
    constructor(ritual: Ritual) {
        this.container = new Container();
        this.light = new Sprite(Assets.get("light"));
        this.light.anchor.set(0.5);
        this.light.scale = 2;
        this.light.alpha = .2;
        this.light.tint = 0xff00ff;
        this.light.blendMode = "add";
        this.sprite = new Sprite(Assets.get("ritual-candle_unlit"));
        scene.add(RitualCandle, this);
        this.container.addChild(this.sprite);
        this.container.addChild(this.light);
        ritual.container.addChild(this.container);
        this.sprite.hitArea = new Rectangle(-this.sprite.width / 2, -this.sprite.height / 3, this.sprite.width, this.sprite.height / 3 * 2);
        this.sprite.scale.set(0.5);
        this.sprite.anchor.set(0.5, .75);

        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            sound.play("sfx-candle_light");
            this.setLit(!this.isLit);
            ritual.checkConditions();
        });
        this.sprite.on("pointerenter", () => {
            this.hover(true);
        });
        this.sprite.on("pointerleave", () => {
            this.hover(false);
        })
        this.setLit(false);
        this.hover(false);
    }

    setLit(state: boolean) {

        this.isLit = state;
        this.sprite.texture = this.isLit ? Assets.get("ritual-candle_lit") : Assets.get("ritual-candle_unlit");
        this.sprite.tint = this.isLit ? 0xffffff : 0x996699;
        this.light.visible = this.isLit;
    }

    hover(enter: boolean) {
        if (!this.isLit) {
            this.sprite.tint = enter ? 0xaa88aa : 0x885588;
        }
    }

    destroy() {
        this.container.destroy();
        scene.remove(RitualCandle, this);
    }

    update() {
        this.offset += 1 * game.dt;
        this.light.scale = Math.sin(this.offset * 2) * .5 + 2;
    }
}