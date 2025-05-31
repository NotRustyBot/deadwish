import { Container, Graphics, HTMLText, Text } from "pixi.js";
import { game } from "./game";
import { TimeManager } from "./timeManager";
import { Easing } from "./easing";
import type { Person } from "./person";
import { factStylelookup, type Fact } from "./notebook";
import { HTMLChat } from "./htmlChat";

const messageWidth = 400;
const sidegap = 100;
const padding = 10;
const radius = 10;

export class Chat {
    container: Container;
    chatContainer: Container;
    responseContainer: Container;
    yPosition = 0;
    responseColor = 0x333333;
    person: Person;
    htmlChat: HTMLChat;

    constructor(person: Person) {
        this.htmlChat = new HTMLChat();
        this.person = person;
        this.container = new Container();
        this.chatContainer = new Container();
        this.responseContainer = new Container();

        this.container.addChild(this.chatContainer);
        this.container.addChild(this.responseContainer);
        this.responseContainer.y = 600;

        game.app.stage.addChild(this.container);
    }

    addMessage(message: string, request: boolean) {
        const gap = 10;
        const chatMessage = new ChatMessage(this, message, request);
        chatMessage.container.y = this.yPosition;
        chatMessage.animate();
        this.yPosition += chatMessage.height + gap;
    }


    options = new Set<ChatResponseOption>();
    showOptions(knownFacts: Set<Fact>) {
        const factOptions = this.person.filterPossibleOptions(knownFacts);
        let y = 0;
        for (const factOption of factOptions) {
            const chatOption = new ChatResponseOption(this, factOption, this.person.responses.get(factOption)!.askAs);
            chatOption.container.y = y;
            y += chatOption.container.height + 10;
            this.options.add(chatOption);
        }
        this.htmlChat.addOptions(this.options);
    }

    hideOptions() {
        this.responseContainer.removeChildren();
        for (const o of [...this.options]) {
            o.destroy();
        }
        this.options.clear();
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
    container: Container;
    message: string
    constructor(chat: Chat, fact: Fact, message: string) {
        this.chat = chat;
        this.fact = fact;
        this.message = message;
        this.container = new Container();


        const graphics = new Graphics();

        const text = new Text({
            text: message,
            style: {
                fontSize: 24,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: messageWidth
            }
        });
        text.resolution = 2;

        const color = 0x222222;
        let x = messageWidth + sidegap - text.width;

        text.x = x + padding;
        text.y = padding;

        graphics.rect(x, 0, text.width + padding * 2, text.height + padding * 2);
        graphics.fill(color);

        graphics.rect(messageWidth + sidegap + padding * 2, 0, padding, text.height + padding * 2);
        graphics.fill(0xffaa00);


        this.container.addChild(graphics);
        this.container.addChild(text);
        chat.responseContainer.addChild(this.container);

        this.container.interactive = true;
        this.container.on("pointertap", () => {
            this.select();
        })
    }
    select() {
        this.chat.person.ask(this.fact);
    }

    destroy() {
        this.container.destroy();
    }
}

class ChatMessage {
    container: Container;
    height = 0;
    constructor(chat: Chat, message: string, request: boolean) {
        this.container = new Container();

        message = processText(message);

        chat.htmlChat.addMessage(message, request);

        const graphics = new Graphics();

        const text = new HTMLText({
            text: message,
            style: {
                fontSize: 24,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: messageWidth
            }
        });
        text.resolution = 2;

        const color = !request ? chat.responseColor : 0x333355;
        let x = messageWidth + sidegap - text.width;
        if (!request) x = 0;

        text.x = x + padding;
        text.y = padding;

        graphics.roundRect(x, 0, text.width + padding * 2, text.height + padding * 2, radius);
        graphics.fill(color);

        let sqx = messageWidth + sidegap + padding;
        if (!request) sqx = 0;
        graphics.rect(sqx, 0, radius, radius);
        graphics.fill(color);

        this.height = text.height + padding * 2;

        this.container.addChild(graphics);
        this.container.addChild(text);
        chat.chatContainer.addChild(this.container);
    }

    animate() {
        const slide = 30;
        this.container.alpha = 0;
        const targetY = this.container.y;
        this.container.y += slide;
        TimeManager.animate(0.3, (progress, time) => {
            this.container.alpha = progress;
            this.container.y = targetY + ((1 - Easing.easeInOutQuad(progress)) * slide);
        });
    }
}