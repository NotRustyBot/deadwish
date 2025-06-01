import { Assets, Container, Sprite, Text } from "pixi.js";
import { game, scene } from "./game";
import { Person, PersonType } from "./person";

export class CrystalBall {
    container: Container;
    sprite: Sprite;
    dialButton: Sprite;
    constructor() {
        this.container = new Container();
        this.sprite = new Sprite(Assets.get("ball"));
        this.dialButton = new Sprite(Assets.get("cannon"));
        scene.add(CrystalBall, this);
        this.container.addChild(this.sprite);
        this.container.addChild(this.dialButton);
        game.roomContainer.addChild(this.container);


        this.dialButton.interactive = true;
        this.dialButton.on("pointerdown", () => {
            const people = scene.get<Person>(Person);
            const dialed = this.symbols.map(s => s.symbol).join('');
            people.forEach(person => person.chat.hideChat());
            for (const person of people) {
                if (!person.isKnown) continue;
                if (person.type != PersonType.ball) continue;
                if(person.symbols != dialed) continue;
                person.showChat();
            }
        });
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
            this.container.addChild(symbol.container);
            symbol.container.x = 100 * index + 100;
            this.symbols.push(symbol);
        }
    }



    destroy() {
        this.container.destroy();
        for (const contact of this.symbols) {
            contact.destroy();
        }
        this.symbols = [];
    }
}

export class DialSymbol {
    textures = [
        Assets.get("ball-symbol_0"),
        Assets.get("ball-symbol_1"),
        Assets.get("ball-symbol_2"),
        Assets.get("ball-symbol_3"),
        Assets.get("ball-symbol_4"),
    ]

    container: Container;
    sprite: Sprite;
    symbol = 0;
    constructor() {
        this.container = new Container();
        this.sprite = new Sprite(this.textures[0]);

        this.container.addChild(this.sprite);
        game.roomContainer.addChild(this.container);

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