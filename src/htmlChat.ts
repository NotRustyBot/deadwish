import type { ChatResponseOption } from "./chat";
import { CustomColor } from "./color";
import { game, UpdateOrder, type IUpdatable } from "./game";
import { Emotion, type Person } from "./person";
import type { IDestroyable } from "./scene";

export class HTMLChat implements IUpdatable, IDestroyable {
    parentElement: HTMLElement;
    vignetteBg: HTMLElement;
    vignetteFg: HTMLElement;
    wrapperElement: HTMLElement;
    messagesWrapper: HTMLElement;
    leftPortrait: HTMLElement;
    leftName: HTMLElement;
    optionsElement?: HTMLElement;
    person: Person;
    color: CustomColor;
    private _scrollBottom = 0;
    private _scrollTarget = 0;
    public get scrollTarget() {
        return this._scrollTarget;
    }
    public set scrollTarget(value) {
        //value = Math.min(Math.max(value, -this.messagesHeight + this.wrapperHeight), 0);
        this._scrollTarget = value;
    }
    private messagesHeight = 0;
    private wrapperHeight = 0;
    public get scroll() {
        return this._scrollBottom;
    }
    public set scroll(value) {
        this._scrollBottom = value;
        this.messagesWrapper.style.bottom = `${this._scrollBottom}px`;
    }
    constructor(person: Person) {
        this.person = person;
        this.color = CustomColor.fromHTML(this.person.color);
        this.parentElement = customDiv(document.body, '', 'absolute');
        this.parentElement.style.setProperty("--color", this.person.color);
        const hsl = this.color.toHSL();
        this.parentElement.style.setProperty("--bg-color", CustomColor.fromHsl(hsl[0], hsl[1] * .4, hsl[2] * .2 + .1).toCSS());
        this.parentElement.style.setProperty("--outline-color", CustomColor.fromHsl(hsl[0], hsl[1] * .7, hsl[2] * .6).toCSS());
        this.leftName = customDiv(this.parentElement, this.person.name, 'chat-name', 'left');
        this.leftName.style.color = this.person.color;
        this.leftPortrait = customDiv(this.parentElement, '', 'chat-portrait', 'left');
        this.leftPortrait.style.backgroundImage = `url(${this.person.emotionImages[Emotion.neutral]})`;
        this.vignetteBg = customDiv(this.parentElement, '', 'chat-vignette', "bg");
        this.vignetteFg = customDiv(this.parentElement, '', 'chat-vignette', 'fg');
        this.wrapperElement = customDiv(this.parentElement, '', 'chat-wrapper');
        this.messagesWrapper = customDiv(this.wrapperElement, '', 'chat-content');
        this.wrapperElement.addEventListener("wheel", (e) => {
            this.scrollTarget += e.deltaY;
        })
        this.wrapperHeight = this.wrapperElement.offsetHeight;
        game.addUpdatable(UpdateOrder.ui, this);
        game.scene.add(HTMLChat, this);
    }
    addMessage(text: string, request: boolean, emotion?: Emotion) {
        if (emotion !== undefined) this.leftPortrait.style.backgroundImage = `url(${this.person.emotionImages[emotion] ?? this.person.emotionImages[Emotion.neutral]})`;
        const msg = this.appearDiv(this.messagesWrapper, text, 'chat-message');
        if (request) msg.classList.add('request');
    }
    addOptions(options: Set<ChatResponseOption>) {
        const container = this.optionsElement ?? this.appearDiv(this.messagesWrapper, "", "chat-options");
        container.innerHTML = "";
        for (const o of options) {
            const msg = customDiv(container, o.message);
            msg.onclick = () => {
                this.messagesWrapper.removeChild(container);
                this.optionsElement = undefined;
                o.select();
                //this.addOptions(options)
            };
        }
        container.style.setProperty("--calc-height", `${container.clientHeight}px`);
        this.optionsElement = container;
    }
    appearDiv(parent: HTMLElement | null, text: string, ...classes: string[]) {
        const appearDiv = customDiv(parent, text, ...classes);
        requestAnimationFrame(() => {
            appearDiv.classList.add('appear');
        });
        setTimeout(() => {
            this.messagesHeight = this.messagesWrapper.offsetHeight;
        }, 600);
        appearDiv.style.setProperty("--calc-height", `${appearDiv.clientHeight + 5}px`);
        this.scrollTarget = 0;
        return appearDiv;
    }
    update() {
        const realTarget = Math.min(Math.max(this.scrollTarget, -this.messagesHeight + this.wrapperHeight - 100), 0);
        this.scrollTarget += (realTarget - this.scrollTarget) * 50 * game.dt;

        if (Math.abs(this.scrollTarget - this.scroll) < 0.1) return;
        this.scroll += (this.scrollTarget - this.scroll) * 10 * game.dt;
    }
    destroy() {
        this.parentElement.remove();
        game.removeUpdatable(UpdateOrder.ui, this);
    }
}

export function customDiv(parent: HTMLElement | null, text: string, ...classes: string[]) {
    const div = document.createElement('div');
    div.innerHTML = text;
    if (classes.length > 0)
        div.classList.add(...classes);
    if (parent)
        parent.appendChild(div);
    return div;
}

