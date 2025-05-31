import { Container, Graphics, Text } from "pixi.js";
import { game } from "./game";

export class Chat {
    container: Container;
    yPosition = 0;

    constructor() {
        this.container = new Container();
        game.app.stage.addChild(this.container);
    }

    addMessage(message: string, request: boolean) {
        const gap = 10;
        const chatMessage = new ChatMessage(this, message, request);
        chatMessage.container.y = this.yPosition;
        this.yPosition += chatMessage.height + gap;
    }


}

class ChatMessage {
    container: Container;

    height = 0;


    constructor(chat: Chat, message: string, request: boolean) {
        const width = 400;
        const sidegap = 100;
        const padding = 10;
        const radius = 10;

        this.container = new Container();

        const graphics = new Graphics();

        const text = new Text({
            text: message,
            style: {
                fontSize: 24,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: width
            }
        });

        console.log(text.width);
        

        const color = !request ? 0x335555 : 0x333355;
        let x = width + sidegap - text.width;
        if (!request) x = 0;

        text.x = x + padding;
        text.y = padding;

        graphics.roundRect(x, 0, text.width + padding * 2, text.height + padding * 2, radius);
        graphics.fill(color);

        let sqx = width + sidegap + padding;
        if (!request) sqx = 0;
        graphics.rect(sqx, 0, radius, radius);
        graphics.fill(color);

        this.height = text.height + padding * 2;


        this.container.addChild(graphics);
        this.container.addChild(text);
        chat.container.addChild(this.container);
    }
}