import { AnimatedSprite, Assets, Container, Sprite, Text } from "pixi.js";
import { game, scene } from "./game";
import { Person } from "./person";

export class CrystalBall {
    container: Container;
    sprite: Sprite;
    constructor() {
        this.container = new Container();
        this.sprite = new Sprite(Assets.get("ball"));
        scene.add(CrystalBall, this);
        this.container.addChild(this.sprite);
        game.app.stage.addChild(this.container);
    }

    contacts = new Set<ContactPerson>();
    render() {
        for (const contact of this.contacts) {
            contact.destroy();
        }
        this.contacts.clear();

        const people = scene.get<Person>(Person);
        let y = 50;
        for (const person of people) {
            if (!person.isKnown) continue;
            const contact = new ContactPerson(person);
            this.contacts.add(contact);
            contact.container.position.y = y;
            y += 50;
        }
    }

    destroy() {
        this.container.destroy();
        for (const contact of this.contacts) {
            contact.destroy();
        }
        this.contacts.clear();
    }
}

export class ContactPerson {
    container: Container;
    sprite: Sprite;
    text: Text;
    person: Person
    constructor(person: Person) {
        this.person = person;
        this.container = new Container();
        this.sprite = new Sprite(Assets.get("cannon"));
        this.text = new Text({
            text: person.name,
            style: {
                fontSize: 24,
                fill: 0xffffff
            }
        });

        this.container.addChild(this.sprite);
        game.app.stage.addChild(this.container);

        this.container.interactive = true;
        this.container.on("pointerdown", () => {
            this.person.showChat();
        });
    }

    destroy() {
        this.container.destroy();
    }
}