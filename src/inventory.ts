import { Assets, Container, Sprite, Text } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { MouseButton } from "./input";

export enum ItemType {
    nightmarePotion = "nightmarePotion",
    antiallergen = "antiallergen",
    summoningPotion = "summoningPotion",
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
        this.container.addChild(text);
        let i = 0;
        this.items.forEach(item => {
            const inventoryItem = new InventoryItem(item, this.itemSelectionCallback);
            const x = this.items.length / 2 * 100 + i * 100;
            inventoryItem.container.position.set(x, 0);
            this.container.addChild(inventoryItem.container);
            this.inventoryItems.push(inventoryItem);
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
        this.sprite = new Sprite(Assets.get("inventory-" + type));
        this.sprite.anchor.set(0.5);
        this.background = new Sprite(Assets.get("rect"));
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