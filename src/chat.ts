import { Person } from "./person";
import { factStylelookup, type Fact } from "./notebook";
import { HTMLChat } from "./htmlChat";
import { scene } from "./game";


export class Chat {
    responseColor = 0x333333;
    person: Person;
    htmlChat: HTMLChat;

    constructor(person: Person) {
        this.htmlChat = new HTMLChat();
        this.person = person;
    }

    addMessage(message: string, request: boolean) {
        message = processText(message);
        this.htmlChat.addMessage(message, request);
    }

    options = new Set<ChatResponseOption>();
    showOptions(knownFacts: Set<Fact>, allowReask = false) {
        this.options.clear();
        const factOptions = this.person.filterPossibleOptions(knownFacts, allowReask);
        for (const factOption of factOptions) {
            const chatOption = new ChatResponseOption(this, factOption, this.person.responses.get(factOption)!.askAs);
            this.options.add(chatOption);
        }
        this.htmlChat.addOptions(this.options);
    }

    clearOptions() {
        this.options.clear();
    }

    hideChat() {
        this.htmlChat.wrapperElement.style.display = "none";
    }

    showChat() {
        const people = scene.get<Person>(Person);
        for (const person of people) {
            person.chat.hideChat();
        }
        this.htmlChat.wrapperElement.style.display = "block";
    }
}

function processText(input: string): string {
    const regex = /<(\d+)>(.*?)<\/>/g;

    return input.replace(regex, (match, id, content) => {
        const style = factStylelookup(parseInt(id));
        return `<span style="${style}" class="highlight">${content}</span>`;
    });
}

export class ChatResponseOption {
    chat: Chat
    fact: Fact;
    message: string
    constructor(chat: Chat, fact: Fact, message: string) {
        this.chat = chat;
        this.fact = fact;
        this.message = message;
    }

    select() {
        this.chat.person.ask(this.fact);
    }
}