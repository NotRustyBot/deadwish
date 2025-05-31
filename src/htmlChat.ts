import { game, UpdateOrder, type IUpdatable } from "./game";

export class HTMLChat implements IUpdatable {
    wrapperElement: HTMLElement;
    messagesWrapper: HTMLElement;
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
        this.wrapperElement = customDiv(document.body, '', 'chat-wrapper');
        this.messagesWrapper = customDiv(this.wrapperElement, '', 'chat-content');
        this.wrapperElement.addEventListener("wheel", (e) => {
            this.scrollTarget += e.deltaY;
        })
        this.wrapperHeight = this.wrapperElement.offsetHeight;
        game.addUpdatable(UpdateOrder.ui, this);
    }
    addMessage(text: string, request: boolean) {
        const msg = customDiv(null, text, 'chat-message');
        //msg.style.setProperty("--calc-height", `${msg.clientHeight+45}px`);
        requestAnimationFrame(() => {
            msg.classList.add('appear');
        });
        this.messagesWrapper.appendChild(msg);
        msg.style.setProperty("--calc-height", `${msg.clientHeight}px`);
        if (request) msg.classList.add('request');
        this.scrollTarget = 0;
        this.messagesHeight = this.messagesWrapper.offsetHeight;
    }
    update() {
        const realTarget = Math.min(Math.max(this.scrollTarget, -this.messagesHeight + this.wrapperHeight), 0);
        this.scrollTarget += (realTarget - this.scrollTarget) * 50 * game.dt;

        if (Math.abs(this.scrollTarget - this.scroll) < 0.1) return;
        this.scroll += (this.scrollTarget - this.scroll) * 10 * game.dt;
    }
}

function customDiv(parent: HTMLElement | null, text: string, ...classes: string[]) {
    const div = document.createElement('div');
    div.innerHTML = text;
    if (classes.length > 0)
        div.classList.add(...classes);
    if (parent)
        parent.appendChild(div);
    return div;
}