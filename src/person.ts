import { Chat } from "./chat";
import { scene } from "./game";
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

    get isKnown() {
        return this.knownFromStart || (this.knownByFact && this.notebook.facts.has(this.knownByFact));
    }

    askedFacts = new Set<Fact>();

    get notebook() {
        return scene.getFirst<Notebook>(Notebook)!;
    }

    constructor(options: { name: string, color?: string, image?: string, emotionImages?: EmotionImages }) {
        this.color = options.color ?? '#ffffff';
        this.name = options.name;
        const image = options.image ?? 'img/ball.png';
        this.emotionImages = options.emotionImages ?? { 0: image };
        scene.add(Person, this);
        this.chat = new Chat(this);
        this.chat.hideChat();
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
            //await TimeManager.wait(1000);
            this.chat.addMessage(text, false, convo.response.emotion ?? Emotion.neutral);
        }
        for (const fact of convo.response.facts ?? []) {
            this.notebook.add(fact);
        }
        //await TimeManager.wait(1000);

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
            name: "Death", color: "#F13A3A", emotionImages: {
                [Emotion.neutral]: "img/death/0001.png",
                [Emotion.confused]: "img/death/0002.png",
                [Emotion.happy]: "img/death/0003.png",
            }
        });
        death.type = PersonType.death;
        return death;
    }
}

export type PersonResponse = {
    text: string[];
    facts?: Fact[];
    emotion?: Emotion;
    event?: () => void
}