import { Chat } from "./chat";
import { scene } from "./game";
import { Fact, FactType, Notebook } from "./notebook";
import { TimeManager } from "./timeManager";

export type Communication = {
    askAs: string;
    response: PersonResponse;
}

export class Person {
    name: string;
    knownFromStart = false;
    responses = new Map<Fact, Communication>();
    chat: Chat;
    color: string;
    image: string;

    knownByFact?: Fact;

    get isKnown() {
        return this.knownFromStart || (this.knownByFact && this.notebook.facts.has(this.knownByFact));
    }

    askedFacts = new Set<Fact>();

    get notebook() {
        return scene.getFirst<Notebook>(Notebook)!;
    }

    constructor(options: { name: string, color?: string, image?: string }) {
        this.color = options.color ?? '#ffffff';
        this.name = options.name;
        this.image = options.image ?? 'img/ball.png';
        scene.add(Person, this);
        this.chat = new Chat(this);
        this.chat.hideChat();
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
        await TimeManager.wait(1000);
        for await (const text of convo.response.text) {
            this.chat.addMessage(text, false);
            await TimeManager.wait(1000);
        }

        convo.response.event?.();

        for (const fact of convo.response.facts ?? []) {
            this.notebook.add(fact);
        }

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
}

export type PersonResponse = {
    text: string[];
    facts?: Fact[];
    event?: () => void
}