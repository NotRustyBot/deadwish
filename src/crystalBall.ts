import { Assets, Container, Sprite, Text } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { Person, PersonType } from "./person";
import { Room } from "./room";

export class CrystalBall extends Room {
    container: Container;
    static instance?: CrystalBall;
    sprite: Sprite;
    constructor() {
        super("ball-0001");
        CrystalBall.instance = this;
        this.container = new Container();
        this.sprite = new Sprite(Assets.get("ball-ball"));
        this.sprite.anchor.set(0.5);
        this.bgSprite.addChild(this.sprite);
        this.sprite.y = -20;
        this.sprite.tint = 0x887766;
        scene.add(CrystalBall, this);
        game.roomContainer.addChild(this.container);


        this.sprite.interactive = true;
        this.sprite.on("pointerdown", () => {
            const people = scene.get<Person>(Person);
            const dialed = this.symbols.map(s => s.symbol).join('');
            people.forEach(person => person.chat.hideChat());
            for (const person of people) {
                if (!person.isKnown) continue;
                if (person.type != PersonType.ball) continue;
                if (person.symbols != dialed) continue;
                person.showChat();
            }
        });
        this.sprite.on("mouseenter", () => {
            this.hover(true);
        });
        this.sprite.on("mouseleave", () => {
            this.hover(false);
        });
        game.addUpdatable(UpdateOrder.ui, this);
        this.hide();
    }
    hover(enter: boolean) {
        this.sprite.tint = enter ? 0xffffff : 0xccbbaa;
        //set cursor pointer maybe?
    }

    symbols = new Array<DialSymbol>();
    render() {
        for (const contact of this.symbols) {
            contact.destroy();
        }
        this.symbols = [];
        const symbolCount = 3;
        for (let index = 0; index < symbolCount; index++) {
            const symbol = new DialSymbol();
            this.bgSprite.addChild(symbol.container);
            symbol.container.y = 400;
            symbol.container.x = 100 * (index - 1);
            this.symbols.push(symbol);
        }
    }

    show() {
        this.container.visible = true;
        super.show();
    }
    hide() {
        this.container.visible = false;
        super.hide();
    }

    update() {
        super.update();
    }



    destroy() {
        CrystalBall.instance = undefined;
        this.container.destroy();
        for (const contact of this.symbols) {
            contact.destroy();
        }
        this.symbols = [];
        scene.remove(CrystalBall, this);
        game.removeUpdatable(UpdateOrder.ui, this);
        super.destroy();
    }
}

export class DialSymbol {
    textures = [
        Assets.get("symbols-white-0"),
        Assets.get("symbols-white-1"),
        Assets.get("symbols-white-2"),
        Assets.get("symbols-white-3"),
        Assets.get("symbols-white-4"),
    ]

    container: Container;
    sprite: Sprite;
    symbol = 0;
    constructor() {
        this.container = new Container();
        this.sprite = new Sprite(this.textures[0]);
        this.sprite.anchor.set(0.5);

        this.container.addChild(this.sprite);
        game.roomContainer.addChild(this.container);

        this.sprite.tint = 0x2288ff;
        this.sprite.scale = 1.5;

        this.container.interactive = true;
        this.container.on("pointerdown", () => {
            this.symbol++;
            if (this.symbol >= this.textures.length) this.symbol = 0;
            this.sprite.texture = this.textures[this.symbol];
        });
    }

    destroy() {
        this.container.destroy();
    }
}