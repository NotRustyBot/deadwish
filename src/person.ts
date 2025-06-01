import { Chat } from "./chat";
import { ClickablePerson } from "./clickablePerson";
import { scene } from "./game";
import { Home } from "./home";
import { Fact, FactType, Notebook } from "./notebook";
import { TimeManager } from "./timeManager";

export type Communication = {
    askAs: string;
    response: PersonResponse;
}

export enum Emotion {
    neutral = 0,
    confused = 1,
    happy = 2,
    sad = 3,
    standing = 4,
}

export enum PersonType {
    death = "death",
    ball = "ball",
    ghost = "ghost",
}

export type EmotionImages = { [key in Emotion]?: string };

export class Person {
    name: string;
    knownFromStart = false;
    responses = new Map<Fact, Communication>();
    chat: Chat;
    color: string;
    emotionImages: EmotionImages = {};
    type = PersonType.ball;
    symbols = "";
    get symbolsHtml() { return this.symbols.split('').map(symbol => `<i class=" s${symbol}"></i>`).join(''); }
    knownByFact?: Fact;
    clickablePerson?: ClickablePerson;

    get isKnown() {
        return this.knownFromStart || (this.knownByFact && this.notebook.facts.has(this.knownByFact));
    }

    askedFacts = new Set<Fact>();

    get notebook() {
        return scene.getFirst<Notebook>(Notebook)!;
    }

    constructor(options: { name: string, color?: string, image?: string, emotionImages?: EmotionImages, type: PersonType }) {
        this.type = options.type;
        this.color = options.color ?? '#ffffff';
        this.name = options.name;
        const image = options.image ?? 'img/ball.png';
        this.emotionImages = options.emotionImages ?? { 0: image };
        scene.add(Person, this);
        this.chat = new Chat(this);
        this.chat.hideChat();
        if (this.type === PersonType.death && Home.instance) {
            this.clickablePerson = new ClickablePerson(this, Home.instance?.container,0.7,160);
        }
    }

    setSymbols(symbols: string) {
        this.symbols = symbols;
        const knownByFact = new Fact(FactType.contact, `${this.name} — ${this.symbolsHtml}`);
        this.knownByFact = knownByFact;
        return knownByFact;
    }

    filterPossibleOptions(facts: Set<Fact>, allowReask = false) {
        const result = new Set<Fact>();
        for (const [key, value] of this.responses) {
            if (this.askedFacts.has(key) && !allowReask) continue;
            if (!facts.has(key)) continue;
            result.add(key);
        }

        return result;
    }

    busy = false;
    async ask(fact: Fact) {
        this.busy = true;
        this.chat.clearOptions();
        this.askedFacts.add(fact);
        const convo = this.responses.get(fact)!
        this.chat.addMessage(convo.askAs, true);
        for await (const text of convo.response.text) {
            await TimeManager.wait(1000);
            this.chat.addMessage(text, false, convo.response.emotion ?? Emotion.neutral);
        }
        for (const fact of convo.response.facts ?? []) {
            this.notebook.add(fact);
        }
        await TimeManager.wait(1000);

        convo.response.event?.();



        this.showOptions();
        this.busy = false;
    }

    followUp = new Set<Fact>();

    addCommunication(communication: Communication) {
        const fact = new Fact(FactType.misc, "");
        this.responses.set(fact, communication);
        return fact;
    }

    customLogic = () => { }

    showOptions() {
        this.customLogic();
        if (this.followUp.size > 0) {
            this.chat.showOptions(this.followUp, true);
        } else {
            this.chat.showOptions(this.notebook.facts);
        }
    }

    showChat() {
        if (this.chat.htmlChat.parentElement.style.display == "block") {
            this.chat.hideChat();
            return;
        }
        this.chat.showChat();
        this.showOptions();
    }

    destroy() {
        scene.remove(Person, this);
        this.chat.destroy();
    }

    static newDeath() {
        const death = new Person({
            name: "Death", type: PersonType.death, color: "#F13A3A", emotionImages: {
                [Emotion.neutral]: "img/death/0001.png",
                [Emotion.confused]: "img/death/0002.png",
                [Emotion.happy]: "img/death/0003.png",
                [Emotion.sad]: "img/death/0002.png",
                [Emotion.standing]: "img/death/0000.png",
            }
        });
        return death;
    }

    static newGhost(name: string, color: string, ghostNumber = 1) {
        const ghost = new Person({
            name, type: PersonType.ghost, color, emotionImages: {
                [Emotion.neutral]: `img/ghost/${ghostNumber}/0001.png`,
                [Emotion.confused]: `img/ghost/${ghostNumber}/0002.png`,
                [Emotion.happy]: `img/ghost/${ghostNumber}/0003.png`,
                [Emotion.sad]: `img/ghost/${ghostNumber}/0004.png`,
            }
        });
        return ghost;
    }

    static newBall(name: string, color: string) {
        const ball = new Person({
            name, type: PersonType.ball, color, emotionImages: {
                [Emotion.neutral]: `img/crystal-ball-talk/0001.png`,
                [Emotion.confused]: `img/crystal-ball-talk/0002.png`,
                [Emotion.happy]: `img/crystal-ball-talk/0003.png`,
                [Emotion.sad]: `img/crystal-ball-talk/0004.png`,
            }
        });
        return ball;
    }
}

export type PersonResponse = {
    text: string[];
    facts?: Fact[];
    emotion?: Emotion;
    event?: () => void
}