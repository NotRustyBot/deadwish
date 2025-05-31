import { scene } from "./game";

export enum ItemType {
    nightmarePotion
}

export class Inventory {
    items: ItemType[] = [];
    constructor() {
        scene.add(Inventory, this);
    }

    add(item: ItemType) {
        this.items.push(item);
    }

    destroy() {
        scene.remove(Inventory, this);
    }   
}