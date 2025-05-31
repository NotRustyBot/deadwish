import { Container, Graphics, Text } from "pixi.js";
import { game } from "./game";
import { TimeManager } from "./timeManager";
import { Easing } from "./easing";
import type { Communication, Person } from "./person";
import type { Fact } from "./notebook";

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

    constructor(person: Person) {
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
        const options = this.person.filterPossibleOptions(knownFacts);
        let y = 0;
        for (const option of options) {
            const options = new ChatResponseOption(this, option, this.person.responses.get(option)!.askAs);
            options.container.y = y;
            y += options.container.height + 10;
            this.options.add(options);
        }
    }

    hideOptions() {
        this.responseContainer.removeChildren();
        for (const o of [...this.options]) {
            o.destroy();
        }
        this.options.clear();
    }
}

class ChatResponseOption {
    container: Container;
    constructor(chat: Chat, fact: Fact, message: string) {
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
            chat.person.ask(fact);
        })
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