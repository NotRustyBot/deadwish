import type { ChatResponseOption } from "./chat";
import { game, UpdateOrder, type IUpdatable } from "./game";

export class HTMLChat implements IUpdatable {
    vignetteBg: HTMLElement;
    vignetteFg: HTMLElement;
    wrapperElement: HTMLElement;
    messagesWrapper: HTMLElement;
    leftPortrait: HTMLElement;
    optionsElement?: HTMLElement;
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
    constructor() {
        this.leftPortrait = customDiv(document.body, '', 'chat-portrait', 'left');
        this.vignetteBg = customDiv(document.body, '', 'chat-vignette');
        this.vignetteFg = customDiv(document.body, '', 'chat-vignette', 'fg');
        this.wrapperElement = customDiv(document.body, '', 'chat-wrapper');
        this.messagesWrapper = customDiv(this.wrapperElement, '', 'chat-content');
        this.wrapperElement.addEventListener("wheel", (e) => {
            this.scrollTarget += e.deltaY;
        })
        this.wrapperHeight = this.wrapperElement.offsetHeight;
        game.addUpdatable(UpdateOrder.ui, this);
    }
    addMessage(text: string, request: boolean) {
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

