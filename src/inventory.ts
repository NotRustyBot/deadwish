import { Assets, Container, Sprite, Text } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { MouseButton } from "./input";
import { fitSprite } from "./utils";
import { TimeManager } from "./timeManager";

export enum ItemType {
    nightmarePotion = "nightmarePotion",
    antiallergen = "antiallergen",
    summoningPotion = "summoningPotion",
}

export const itemTypeToTexture = {
    [ItemType.nightmarePotion]: "item-potion_0",
    [ItemType.antiallergen]: "item-potion_1",
    [ItemType.summoningPotion]: "item-potion_2",
}

export class Inventory {
    container = new Container();
    items: ItemType[] = [];
    constructor() {
        scene.add(Inventory, this);
        game.addUpdatable(UpdateOrder.ui, this);
        game.uiContainer.addChild(this.container);
    }

    add(item: ItemType) {
        this.items.push(item);
    }

    private itemSelectionCallback(item?: ItemType) { }

    isItemSelectMode = false;
    async selectItem(): Promise<undefined | ItemType> {
        if (this.items.length == 0) {

            const text = new Text({
                text: "You don't have any items",
                style: {
                    fontSize: 24,
                    fill: 0xffffff,
                    fontFamily: "Caveat",
                }
            });
            text.y = game.app.screen.height / 2 + 100;
            text.anchor.set(0.5);
            game.uiContainer.addChild(text);
            text.alpha = 0;
            text.x = game.app.screen.width / 2;
            TimeManager.animate(0.5, (progress, time) => {
                text.alpha = progress;
            });
            TimeManager.wait(1500).then(() => {
                TimeManager.animate(0.5, (progress, time) => {
                    text.alpha = 1 - progress;
                });
            });

            TimeManager.wait(2000).then(() => {
                text.destroy();
            });

            return;
        }
        this.isItemSelectMode = true;


        return new Promise((resolve) => {
            this.itemSelectionCallback = (item?: ItemType) => {
                this.hideItemSelection();
                this.items = this.items.filter(i => i != item);
                resolve(item);
            };
            this.renderItems();
        })
    }

    hideItemSelection() {
        this.isItemSelectMode = false;
        [...this.inventoryItems].forEach(item => item.destroy());
        this.inventoryItems = [];
    }

    inventoryItems: InventoryItem[] = [];
    renderItems() {
        this.container.removeChildren();
        const text = new Text({
            text: "Select an item",
            style: {
                fontSize: 24,
                fill: 0xffffff,
                fontFamily: "Caveat",
            }
        });
        text.y = -100;
        text.anchor.set(0.5);
        this.container.addChild(text);
        let i = 0;
        this.items.forEach(item => {
            const inventoryItem = new InventoryItem(item, this.itemSelectionCallback);
            const x = this.items.length / 2 * -100 + i * 100 + 50;
            inventoryItem.container.position.set(x, 0);
            this.container.addChild(inventoryItem.container);
            this.inventoryItems.push(inventoryItem);
            i++;
        });
    }

    update() {
        this.container.visible = this.isItemSelectMode;
        if (!this.isItemSelectMode) return;
        this.container.position.set(game.app.screen.width / 2, game.app.screen.height / 2);
    }

    destroy() {
        game.removeUpdatable(UpdateOrder.ui, this);
        scene.remove(Inventory, this);
        this.container.destroy();
    }

}

class InventoryItem {
    container = new Container();
    type: ItemType;
    sprite: Sprite;
    background: Sprite;
    constructor(type: ItemType, selectionCallback: (type: ItemType) => void) {
        this.type = type;
        this.sprite = new Sprite(Assets.get(itemTypeToTexture[this.type]));
        this.sprite.anchor.set(0.5);
        this.background = new Sprite(Assets.get("rect"));
        this.background.width = 95;
        this.background.height = 95;
        fitSprite(this.sprite, 100, 100);
        this.background.anchor.set(0.5);
        this.container.addChild(this.background);
        this.container.addChild(this.sprite);
        game.app.stage.addChild(this.container);
        this.container.interactive = true;
        this.container.on("pointerdown", () => {
            selectionCallback(this.type);
        });

        this.container.on("pointerenter", () => {
            this.background.tint = 0xffffff;
        });

        this.container.on("pointerleave", () => {
            this.background.tint = 0x555555;
        });
        this.background.tint = 0x555555;
    }

    destroy() {
        this.container.destroy();
    }
}