import { Container, HTMLText, Text } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";

export enum FactType {
    misc = 0,
    general = 1,
    problem = 2,
    person = 3,
    location = 4,
    item = 5
}

export function factStylelookup(id: number): string {
    const notebook = scene.getFirst<Notebook>(Notebook)!;
    if (notebook.facts.has(Fact.lookup.get(id)!)) return 'color: #999999;'
    const type = Fact.lookup.get(id)!.type;
    return styleLookup(type);
}

export function styleLookup(type: FactType): string {
    const styles = {
        1: 'color: #ffaa00;',
        2: 'color: #ff0000;',
        3: 'color: #99ffff;',
        4: 'color: #55ff55;',
        5: 'color: #ff55ff;',
    };
    return styles[type as keyof typeof styles] ?? '';
}


export class Fact {
    static id = 0;
    static lookup = new Map<number, Fact>();
    id = Fact.id++;

    type: FactType;
    text = "";
    image?: string;
    constructor(type: FactType, text: string, image?: string) {
        this.text = text;
        this.type = type;
        if (image) this.image = image;
        Fact.lookup.set(this.id, this);
    }

    reference?: any;
    resolved = false;
}

export class Notebook {
    facts = new Set<Fact>();
    container = new Container();

    add(fact: Fact) {
        this.facts.add(fact);
        this.render();
    }


    constructor() {
        scene.add(Notebook, this);
        game.addUpdatable(UpdateOrder.ui, this);
        game.app.stage.addChild(this.container);
    }

    update() {
        this.container.x = game.app.screen.width - 500;
    }

    rendered = new Set<RenderFact>();
    render() {
        for (const f of this.rendered) {
            f.destroy();
        }
        this.rendered.clear();

        let y = 0;
        for (const fact of this.facts) {
            if (fact.type === FactType.misc) continue;
            const renderFact = new RenderFact(this, fact);
            y += renderFact.container.height + 20
            renderFact.container.y = y;
            this.rendered.add(renderFact);
        }
    }

    destroy() {
        for (const f of this.rendered) {
            f.destroy();
        }
        this.rendered.clear();

        scene.remove(Notebook, this);
        game.removeUpdatable(UpdateOrder.ui, this);
    }
}

class RenderFact {
    fact: Fact;
    container = new Container();
    constructor(notebook: Notebook, fact: Fact) {
        this.fact = fact;
        const text = new HTMLText({
            text: fact.text,
            style: {
                //fontFamily: "Caveat",
                fontSize: 24,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 400, 
            }
        });
        if(fact.resolved) text.text = `<s>${fact.text}</s>`
        this.container.addChild(text);
        notebook.container.addChild(this.container);
    }

    destroy() {
        this.container.destroy();
    }
}