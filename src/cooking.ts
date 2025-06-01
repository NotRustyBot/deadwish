import { Assets, Container, Sprite, spritesheetAsset, Text } from "pixi.js";
import { Vector } from "./vector";
import { game, scene, UpdateOrder, type IUpdatable } from "./game";
import { MouseButton } from "./input";
import { pickRandom, randomRange } from "./utils";
import { Inventory, ItemType } from "./inventory";
import { sound } from "@pixi/sound";
import type { IDestroyable } from "./scene";
import { createHomeSign } from "./home";


export type Recipe = Array<{
    ingredient: string,
    temperature: number
}>

const smoke = [
    0xffeecc,
    0x5544cc,
    0x00ee00,
    0xffaa00,
    0x111111
]



export class CookingPot implements IUpdatable, IDestroyable {
    homeSign: HTMLImageElement;
    particleContainer: Container;
    bgSprite: Sprite;
    sprite: Sprite;
    frontSprite: Sprite;
    potContainer: Container;

    temperature = 0;

    currentRecipe: Recipe = [];

    recipeText: Text;

    particleBuildup = 0;

    get smokeColor() {
        return smoke[Math.floor(this.temperature)];
    }

    get inventory() {
        return scene.getFirst<Inventory>(Inventory)!;
    }

    constructor() {
        this.homeSign = createHomeSign(this, "cooking");


        this.bgSprite = new Sprite(Assets.get("alchemy-0001"));
        this.bgSprite.anchor.set(0.5);
        game.app.stage.addChild(this.bgSprite);

        this.particleContainer = new Container({
        })

        this.potContainer = new Container();

        this.sprite = new Sprite(Assets.get("alchemy-pot"));
        this.sprite.width = 300;
        this.sprite.anchor.set(0.5, 1);
        this.potContainer.addChild(this.sprite);

        this.potContainer.addChild(this.particleContainer);

        this.frontSprite = new Sprite(Assets.get("alchemy-pot_front"));
        this.frontSprite.width = 300;
        this.frontSprite.anchor.set(0.5, 1);
        this.potContainer.addChild(this.frontSprite);
        game.app.stage.addChild(this.potContainer);


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
        let madeRecipe = false;
        for (const key in recipes) {
            if (JSON.stringify(this.currentRecipe) == JSON.stringify(recipes[key as unknown as ItemType])) {
                this.inventory.add(key as unknown as ItemType);
                madeRecipe = true;
            }
        }
        if (madeRecipe) sound.play("sfx-potion_success");
        else sound.play("sfx-sizzle");
        this.currentRecipe = [];
        this.temperature = 0;
        this.recipeText.text = this.currentRecipe.map(r => `${r.ingredient} ${r.temperature}`).join("\n");
    }

    intersects(ingredient: Ingredient) {
        if (true
            && ingredient.position.x > this.potContainer.x - this.sprite.width / 2
            && ingredient.position.x < this.potContainer.x + this.sprite.width / 2
            && ingredient.position.y > this.potContainer.y - this.sprite.height
            && ingredient.position.y < this.potContainer.y) {
            return true;
        }
    }

    update() {
        //fit height

        const ratio = game.app.screen.height / this.bgSprite.texture.height;
        this.bgSprite.position.set(game.app.screen.width / 2, game.app.screen.height / 2);
        this.bgSprite.scale.set(ratio);

        if (this.currentRecipe.length != 0) {
            sound.volume("loop-cooking", this.temperature / 4);
            this.temperature += game.dt / 5;
            if (this.temperature > 4) this.temperature = 4;
            this.particleBuildup += game.dt * 10 * (this.temperature + 1);
            while (this.particleBuildup > 0) {
                this.particleContainer.addChild(new SmokeParticle(Vector.fromLike(this.sprite.position).add(new Vector(randomRange(-30, 30) - this.sprite.skew.x * 500, -this.sprite.height)), this.smokeColor));
                this.particleBuildup--;
            }
        }
        else {
            sound.volume("loop-cooking", 0);
        }

        for (const particle of this.particleContainer.children as SmokeParticle[]) {
            particle.update();
            if (particle.age > particle.lifetime) this.particleContainer.removeChild(particle);
        }

        this.potContainer.x = game.app.screen.width / 2;
        this.potContainer.y = game.app.screen.height;

        this.sprite.skew.x = Math.sin(this.temperature * 25) / 10;
        this.sprite.scale.y = 1 - Math.sin(this.temperature * 50) / 10;

        //this.sprite.x = randomRange(-1, 1) * (this.currentRecipe.length > 0 ? 2 : 0);
        //this.sprite.y = randomRange(-1, 1) * (this.currentRecipe.length > 0 ? 2 : 0);

        this.frontSprite.skew.x = this.sprite.skew.x;
        this.frontSprite.scale.y = this.sprite.scale.y;
        this.frontSprite.position.set(this.sprite.x, this.sprite.y);

        const ingredients = game.scene.get<Ingredient>(Ingredient);

        for (const ingredient of ingredients) {
            if (this.intersects(ingredient)) {
                sound.play("sfx-splash");
                if (this.temperature > 1) {
                    sound.play("sfx-sizzle");
                    this.particleBuildup += 50;
                }
                ingredient.destroy();
                this.currentRecipe.push({ ingredient: ingredient.type, temperature: Math.floor(this.temperature) });
                this.temperature = 0;
                sound.play("loop-cooking", { loop: true, singleInstance: true });
                this.recipeText.text = this.currentRecipe.map(r => `${r.ingredient} ${r.temperature}`).join("\n");
            }
        }
    }

    destroy() {
        game.scene.remove(CookingPot, this);
        game.removeUpdatable(UpdateOrder.cooking, this);
        this.sprite.destroy();
        this.homeSign.remove();
    }
}

class SmokeParticle extends Sprite {
    public get vecPosition(): Vector {
        return new Vector(this.x, this.y);
    }
    public set vecPosition(value: Vector) {
        this.x = value.x;
        this.y = value.y;
    }
    velocity: Vector;
    age = 0;
    lifetime = 2;
    constructor(position: Vector, tint?: number) {
        super({ texture: Assets.get("light") });
        this.vecPosition = position;
        this.scale = randomRange(0.2, .5);
        this.velocity = new Vector(randomRange(-1, 1), randomRange(-2, -1) - 2);
        this.lifetime = randomRange(1.5, 2.5);
        this.tint = tint ?? 0xffffff;
        this.anchor.set(0.5);
    }
    update() {
        this.age += game.dt;
        this.alpha = 1 - this.age / this.lifetime;
        this.vecPosition = this.vecPosition.add(this.velocity);
        this.velocity.mult(1 - game.dt);
        this.velocity.y -= 2 * game.dt;
    }

}

export class Ingredient {
    static types = ["herb", "egg", "bone"];
    position = new Vector();
    velocity = new Vector();
    sprite: Sprite;
    static clicked?: Ingredient;
    type: string;

    constructor(type: string) {
        this.type = type;
        this.sprite = new Sprite(Assets.get("alchemy-" + type));
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


        this.velocity.mult(1 - 0.001 * game.dt);

        this.position = this.position.add(this.velocity.clone().mult(rate));

        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;

        if (Ingredient.clicked == this) {
            if (game.input.mouse.getButtonDown(MouseButton.Left) === false) {
                this.position.set(Vector.lerp(this.position, game.input.mouse.position, 0.25));
                this.velocity = this.position.diff(startingposition);

            } else {
                Ingredient.clicked = undefined;
            }
        }
        else {
            this.sprite.angle += game.dt * this.velocity.length() * 5;
        }

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



export class BagOStuff implements IUpdatable, IDestroyable {
    sprite: Sprite;
    constructor() {
        this.sprite = new Sprite(Assets.get("alchemy-bag"));
        game.app.stage.addChild(this.sprite);
        game.scene.add(BagOStuff, this);
        game.addUpdatable(UpdateOrder.cooking, this);

        this.sprite.anchor.set(0.5);

        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            Ingredient.clicked = new Ingredient(pickRandom(Ingredient.types));
        });
    }

    update(): void {
        this.sprite.position.set(game.app.screen.width / 2 - 500, game.app.screen.height * .55);
    }

    destroy() {
        game.removeUpdatable(UpdateOrder.cooking, this);
        game.scene.remove(BagOStuff, this);
        this.sprite.destroy();
    }
}

export const recipes: Record<ItemType, Recipe> = {
    [ItemType.nightmarePotion]: [{ ingredient: "egg", temperature: 0 }, { ingredient: "bone", temperature: 1 }],
    [ItemType.antiallergen]: [{ ingredient: "herb", temperature: 0 }, { ingredient: "egg", temperature: 0 }],
}