import { Chat } from "./chat";
import { scene } from "./game";
import { Notebook, type Fact } from "./notebook";
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

    knownByFact?: Fact;

    get isKnown() {
        return this.knownFromStart || (this.knownByFact && this.notebook.facts.has(this.knownByFact));
    }

    askedFacts = new Set<Fact>();

    get notebook() {
        return scene.getFirst<Notebook>(Notebook)!;
    }

    constructor(name: string) {
        this.name = name;
        scene.add(Person, this);
        this.chat = new Chat(this);
    }

    filterPossibleOptions(facts: Set<Fact>) {
        const result = new Set<Fact>();
        for (const [key, value] of this.responses) {
            if (this.askedFacts.has(key)) continue;
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

    showOptions() {
        if (this.followUp.size > 0) {
            this.chat.showOptions(this.filterPossibleOptions(this.followUp));
        } else {
            this.chat.showOptions(this.filterPossibleOptions(this.notebook.facts));
        }
    }

    showChat() {
        this.chat.showChat();
        this.showOptions();
    }

    destroy() {
        scene.remove(Person, this);
    }
}

export type PersonResponse = {
    text: string[];
    facts?: Fact[];
    event?: () => void
}