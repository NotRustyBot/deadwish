import { Container, HTMLText } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { customDiv } from "./htmlChat";
import { CrystalBall } from "./crystalBall";
import { filters, sound } from "@pixi/sound";
import { recipes } from "./cooking";
import type { ItemType } from "./inventory";

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
        0: 'color: "";',
        1: 'color: #ffaa00;',
        2: 'color: #ff0000;',
        3: 'color: #99ffff;',
        4: 'color: #55ff55;',
        5: 'color: #ff55ff;',
    };
    return styles[type as keyof typeof styles] ?? '';
}

export function titleLookup(type: FactType): string {
    const personName = "John";
    const styles = {
        0: 'Notes',
        1: `General information`,
        2: `Problems`,
        3: `Personal details`,
        4: `Locations`,
        5: `Items`,
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
    notebookBG:HTMLImageElement;
    notebookDiv: HTMLDivElement;
    notebookContentsDiv: HTMLDivElement;
    pageLeftWrapper: HTMLDivElement;
    pageRightWrapper: HTMLDivElement;
    pages: HTMLDivElement[];
    pageIndex = 0;
    private _open = false;
    public get open() {
        return this._open;
    }
    public set open(value) {
        this.notebookBG.src = value ? "img/notebook.png" : "img/notebook_closed.png";
        this.notebookDiv.classList.toggle('open', value);
        if (this._open != value) {
            this.generateBook();
            if (value) sound.play("sfx-book_open");
            else sound.play("sfx-book_close");
        }
        this._open = value;
    }



    constructor() {
        scene.add(Notebook, this);
        game.addUpdatable(UpdateOrder.ui, this);
        game.app.stage.addChild(this.container);

        this.pages = [];

        this.notebookDiv = customDiv(document.body, '', 'notebook-wrapper');
        this.notebookDiv.addEventListener("mouseenter", () => this.open = true);
        this.notebookDiv.addEventListener("mouseleave", () => this.open = false);
        this.notebookBG = document.createElement('img');
        this.notebookBG.src = "img/notebook_closed.png";
        this.notebookBG.classList.add('notebook-bg');
        this.notebookDiv.appendChild(this.notebookBG);
        this.notebookContentsDiv = customDiv(this.notebookDiv, '', 'notebook-contents');
        this.pageLeftWrapper = customDiv(this.notebookContentsDiv, '', 'notebook-page-wrapper');
        this.pageLeftWrapper.addEventListener("click", () => this.movePage(-2));
        this.pageRightWrapper = customDiv(this.notebookContentsDiv, '', 'notebook-page-wrapper');
        this.pageRightWrapper.addEventListener("click", () => this.movePage(2));
        this.generateBook();
        this.render();
    }

    
    add(fact: Fact) {
        if (!this.facts.has(fact) && fact.type !== FactType.misc) sound.play("sfx-write_fact", { singleInstance: true, volume: .2, filters: [new filters.StereoFilter(.5)] });
        this.facts.add(fact);
        this.generateBook();

        const crystalBall = scene.getFirst<CrystalBall>(CrystalBall)!;
        if (crystalBall) crystalBall.render();
    }

    generateBook() {
        for (const f of this.pages) {
            f.remove();
        }
        this.pages = [];

        let y = 0;

        const sections: string[][] = new Array(6);
        for (let i = 0; i < sections.length; i++) {
            sections[i] = new Array();
        }
        for (const fact of this.facts) {
            //sections[fact.type].push(`<span class="highlight" style="${styleLookup(fact.type)}">${fact.text}</span>`);
            if (fact.resolved) {
                sections[fact.type].push(`<strike>${fact.text}</strike>`);
            }
            else {
                sections[fact.type].push(`<span>${fact.text}</span>`);
            }
        }
        for (let i = 1; i < sections.length; i++) {
            const section = sections[i];
            const title = titleLookup(i as FactType);
            const lines = Array.from(section);
            while (lines.length > 0) {
                const page = this.addPage({ title, list: lines.splice(0, 5) });
            }
        }

        this.addPage({ title: `<br><br><br><br><br><br><strike>COOKING RECIPES</strike><br><br>ALCHEMY<br><br>`, text: `Drag ingredients from the bag into the cauldron. All the ingredients are randomly mixed in one bag.` });

        for (const name in recipes) {
            const recipe = recipes[name as ItemType];
            const smokeDesc = [
                "white",
                "blue",
                "green",
                "orange",
                "dark"
            ]
            const lines = [`start with ${recipe[0].ingredient}`];
            lines.push(...recipe.slice(1).map(r => `add ${r.ingredient} when the smoke is ${smokeDesc[r.temperature]}`))
            let nameFromCamelCase = name.replace(/([A-Z])/g, ' $1').trim();
            nameFromCamelCase = nameFromCamelCase[0].toUpperCase() + nameFromCamelCase.slice(1);
            const page = this.addPage({ title: `${nameFromCamelCase}`, list: lines });

        }

        this.render();
    }

    generatePage(options: { title: string, text?: string, list?: string[] }) {
        const page = customDiv(null, '', 'notebook-page');
        page.innerHTML = `<h1>${options.title}</h1>`;
        if (options.text) page.innerHTML += `<p>${options.text}</p>`;
        if (options.list) page.innerHTML += `<ul>${options.list.map(l => `<li>${l}</li>`).join('')}</ul>`;
        return page;
    }

    addPage(options: { title: string, text?: string, list?: string[] }) {
        const page = this.generatePage(options);
        this.pages.push(page);
        return page;
    }

    render() {
        const indexLeft = 2 * Math.floor(this.pageIndex / 2);
        const indexRight = indexLeft + 1;
        this.pageLeftWrapper.innerHTML = this.pages[indexLeft]?.outerHTML ?? '';
        this.pageRightWrapper.innerHTML = this.pages[indexRight]?.outerHTML ?? '';

        this.pageLeftWrapper.classList.toggle("active", (indexLeft > 0 && indexLeft <= this.pages.length - 1));
        this.pageRightWrapper.classList.toggle("active", (indexRight > 0 && indexRight < this.pages.length - 1));
    }

    movePage(offset: number) {
        this.pageIndex += offset;
        if (this.pageIndex >= 0 && this.pageIndex <= this.pages.length - 1) {
            sound.play("sfx-page_turn");
        }
        this.pageIndex = Math.max(Math.min(this.pageIndex, this.pages.length - 1), 0);
        console.log(this.pageIndex);
        this.render();
    }

    moveToPage(index: number) {
        this.pageIndex = index;
        this.render();
    }

    update() {
        this.container.x = game.app.screen.width - 500;
    }

    destroy() {
        scene.remove(Notebook, this);
        game.removeUpdatable(UpdateOrder.ui, this);
        this.notebookDiv.remove();
        this.container.destroy();
        this.pageLeftWrapper.remove();
        this.pageRightWrapper.remove();
        this.notebookContentsDiv.remove();
        for (const page of this.pages) {
            page.remove();
        }
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
        if (fact.resolved) text.text = `<s>${fact.text}</s>`
        this.container.addChild(text);
        notebook.container.addChild(this.container);
    }

    destroy() {
        this.container.destroy();
    }
}