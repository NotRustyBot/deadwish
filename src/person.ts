import { scene } from "./game";
import type { Fact } from "./notebook";

type ConversationElement = {
    request: false;
    text: string;
} | {
    request: true;
    fact: Fact;
}

export class Person {
    name: string;
    known = false;
    responses = new Map<Fact, string>();

    conversation: Array<ConversationElement> = [];

    constructor(name: string) {
        this.name = name;
        scene.add(Person, this);
    }

    ask(fact: Fact) {
        this.conversation.push({ request: true, fact: fact });
    }

    destroy() {
        scene.remove(Person, this);
    }
}

export type PersonResponse = {
    text: string;
    facts?: Fact[];
    event?: () => void
}