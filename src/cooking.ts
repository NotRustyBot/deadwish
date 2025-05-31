import { Assets, Sprite, Text } from "pixi.js";
import { Vector } from "./vector";
import { game, scene, UpdateOrder } from "./game";
import { MouseButton } from "./input";
import { pickRandom } from "./utils";
import { Inventory, ItemType } from "./inventory";


export type Recipe = Array<{
    ingredient: string,
    temperature: number
}>

const smoke = [
    0xffffff,
    0x5555ff,
    0x00ff00,
    0xffaa00,
    0x333333
]

export class CookingPot {
    bgSprite: Sprite;
    sprite: Sprite;

    temperature = 0;

    currentRecipe: Recipe = [];

    recipeText: Text;

    get smokeColor() {
        return smoke[Math.floor(this.temperature)];
    }

    get inventory(){
        return scene.getFirst<Inventory>(Inventory)!;
    }

    constructor() {
        this.bgSprite = new Sprite(Assets.get("alchemy-0001"));
        this.bgSprite.anchor.set(0.5);
        game.app.stage.addChild(this.bgSprite);

        this.sprite = new Sprite(Assets.get("rect"));
        this.sprite.width = 300;
        this.sprite.height = 200;
        game.app.stage.addChild(this.sprite);

        this.recipeText = new Text({
            text: "",
            style: {
                fontSize: 24,
                fill: 0xffffff
            }
        });

        this.recipeText.resolution = 2;
        game.app.stage.addChild(this.recipeText);

        this.recipeText.y = 200;

        game.scene.add(CookingPot, this);
        game.addUpdatable(UpdateOrder.cooking, this);

        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            this.makePotion();
        })
    }

    makePotion() {
        for (const key in recipes) {
            if (JSON.stringify(this.currentRecipe) == JSON.stringify(recipes[key as unknown as ItemType])) {
                this.inventory.add(key as unknown as ItemType);
            }
        }
        this.currentRecipe = [];
        this.temperature = 0;
        this.recipeText.text = this.currentRecipe.map(r => `${r.ingredient} ${r.temperature}`).join("\n");
    }

    intersects(ingredient: Ingredient) {
        if (true
            && ingredient.position.x > this.sprite.x
            && ingredient.position.x < this.sprite.x + this.sprite.width
            && ingredient.position.y > this.sprite.y
            && ingredient.position.y < this.sprite.y + this.sprite.height) {
            return true;
        }
    }

    update() {

        //fit height

        const ratio = game.app.screen.height / this.bgSprite.texture.height;
        this.bgSprite.position.set(game.app.screen.width / 2, game.app.screen.height / 2);
        this.bgSprite.scale.set(ratio);

        if (this.currentRecipe.length != 0) {
            this.temperature += game.dt / 5;
            if (this.temperature > 4) this.temperature = 4;
        }

        this.sprite.tint = this.smokeColor;

        this.sprite.x = game.app.screen.width / 2 - this.sprite.width / 2;
        this.sprite.y = game.app.screen.height - this.sprite.height;

        const ingredients = game.scene.get<Ingredient>(Ingredient);

        for (const ingredient of ingredients) {
            if (this.intersects(ingredient)) {
                ingredient.destroy();
                this.currentRecipe.push({ ingredient: ingredient.type, temperature: Math.floor(this.temperature) });
                this.temperature = 0;
                this.recipeText.text = this.currentRecipe.map(r => `${r.ingredient} ${r.temperature}`).join("\n");
            }
        }
    }

    destroy() {
        game.scene.remove(CookingPot, this);
        game.removeUpdatable(UpdateOrder.cooking, this);
        this.sprite.destroy();
    }
}

export class Ingredient {
    static types = ["cannon", "light", "rect"];
    position = new Vector();
    velocity = new Vector();
    sprite: Sprite;
    static clicked?: Ingredient;
    type: string;

    constructor(type: string) {
        this.type = type;
        this.sprite = new Sprite(Assets.get(type));
        this.sprite.anchor.set(0.5);
        game.addUpdatable(UpdateOrder.cooking, this);
        game.app.stage.addChild(this.sprite);

        game.scene.add(Ingredient, this);

        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            Ingredient.clicked = this;
        });
    }

    update() {
        const rate = game.rate;
        const startingposition = this.position.clone();

        if (this.position.y > game.app.screen.height - 100) {
            this.position.y = game.app.screen.height - 100;
            this.velocity.y = 0;
            this.velocity.x *= 0.9;
        } else {
            this.velocity.y += 0.5;
        }


        this.velocity.mult(0.99);

        this.position = this.position.add(this.velocity.clone().mult(rate));

        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;

        if (Ingredient.clicked == this) {
            if (game.input.mouse.getButtonDown(MouseButton.Left) === false) {
                this.position.set(Vector.lerp(this.position, game.input.mouse.position, 0.25));
            } else {
                Ingredient.clicked = undefined;
            }
        }

        this.velocity = this.position.diff(startingposition);
        if (this.position.x < 0 || this.position.x > game.app.screen.width) {
            this.destroy();
        }
    }

    destroy() {
        game.scene.remove(Ingredient, this);
        game.removeUpdatable(UpdateOrder.cooking, this);
        this.sprite.destroy();
    }
}



export class BagOStuff {
    sprite: Sprite;
    constructor() {
        this.sprite = new Sprite(Assets.get("rect"));
        this.sprite.width = 100;
        this.sprite.height = 100;
        game.app.stage.addChild(this.sprite);
        game.scene.add(BagOStuff, this);

        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            Ingredient.clicked = new Ingredient(pickRandom(Ingredient.types));
        });
    }

    destroy() {
        game.scene.remove(BagOStuff, this);
        this.sprite.destroy();
    }
}

export const recipes: Record<ItemType, Recipe> = {
    [ItemType.nightmarePotion]: [{ ingredient: "light", temperature: 0 }, { ingredient: "cannon", temperature: 1 }],
    [ItemType.antialergen]: [{ ingredient: "light", temperature: 0 }, { ingredient: "light", temperature: 0 }],
}