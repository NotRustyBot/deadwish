import { Assets, Container, FederatedPointerEvent, Graphics, Rectangle } from "pixi.js";
import { game, scene, UpdateOrder } from "./game";
import { sound } from "@pixi/sound";
import { Chat } from "./chat";
import { CookingPot } from "./cooking";
import { TimeManager } from "./timeManager";
import { Ritual } from "./ritual";
import { Room } from "./room";
import { CrystalBall } from "./crystalBall";
import { Inventory } from "./inventory";
import { ClickablePerson } from "./clickablePerson";
import { Person, PersonType } from "./person";
import { Notebook } from "./notebook";

export class Home extends Room {
    graphics: Graphics;
    currentNumber = 1;
    static instance?: Home;
    container: Container;
    get notebook() { return scene.getFirst<Notebook>(Notebook)!; }
    constructor() {
        super("home-0001", true);
        Home.instance = this;
        this.container = new Container();
        game.roomContainer.addChild(this.container);
        this.bgSprite.addEventListener("pointermove", (e) => { this.mouseMove(e) }, true);
        this.bgSprite.addEventListener("click", () => { this.click() }, true);
        this.bgSprite.interactive = true;
        this.graphics = new Graphics();

        

        this.setBg();
        scene.add(Home, this);
        game.addUpdatable(UpdateOrder.ui, this);
        this.bgSprite.addChild(this.graphics);
        this.show();
    }

    mouseMove(e: FederatedPointerEvent) {
        if (Chat.isInChat || this.notebook.open) return;
        const doorDist = 500;
        const doorWidth = 250;
        const doorHeight = 700;
        const ritualRect = new Rectangle(-doorWidth / 2, -doorHeight / 2, doorWidth, doorHeight);
        const crystalBallRect = new Rectangle(-doorWidth / 2 - doorDist, -doorHeight / 2, doorWidth, doorHeight);
        const alchemyRect = new Rectangle(-doorWidth / 2 + doorDist, -doorHeight / 2, doorWidth, doorHeight);
        const localPos = e.getLocalPosition(this.bgSprite);

        //this.graphics.clear();
        //this.graphics.rect(crystalBallRect.x, crystalBallRect.y, crystalBallRect.width, crystalBallRect.height);
        //this.graphics.fill(0xffaa00);
        if (crystalBallRect.contains(localPos.x, localPos.y)) {
            this.setBg(2);
        }
        else if (ritualRect.contains(localPos.x, localPos.y)) {
            this.setBg(3);
        }
        else if (alchemyRect.contains(localPos.x, localPos.y)) {
            this.setBg(4);
        }
        else {
            this.setBg(1);
        }
    }

    async transition() {
        TimeManager.animate(0.5, (progress, time) => {
            game.roomContainer.alpha = 1 - progress;
        })
        await TimeManager.wait(500);
        TimeManager.animate(0.5, (progress, time) => {
            game.roomContainer.alpha = progress;
        })
    }

    setBg(number: 1 | 2 | 3 | 4 = 1) {
        this.bgSprite.texture = Assets.get("home-000" + number);
        if (this.currentNumber !== number) {
            if (number > 1) {
                sound.play("sfx-door_open", { volume: 0.4 });
            }
            else {
                sound.play("sfx-door_close", { volume: 0.2 });
            }
            this.currentNumber = number;
        }
    }

    click() {
        if (this.currentNumber === 2) {
            if (CrystalBall.instance) CrystalBall.instance.show();
            else new CrystalBall().show();
        }
        if (this.currentNumber === 3) {
            if (Ritual.instance) Ritual.instance.show();
            else new Ritual().show();
        }
        if (this.currentNumber === 4) {
            if (CookingPot.instance) CookingPot.instance.show();
            else new CookingPot().show();
        }
        if (this.currentNumber != 1) {
            this.hide();
        }
    }

    update() {
        super.update();
    }
    show(): void {
        this.container.visible = true;
        super.show();
    }
    hide(): void {
        this.container.visible = false;
        super.hide();
    }
    destroy() {
        this.container.destroy();
        game.removeUpdatable(UpdateOrder.ui, this);
        super.destroy();
        Home.instance = undefined;
    }
}

export function createHomeSign(room: Room, className?: string) {
    const homeSign = new Image();
    homeSign.src = "img/home_sign.png";
    document.getElementById("app")!.after(homeSign);
    homeSign.classList.add("home-sign");
    if (className) homeSign.classList.add(className);

    homeSign.addEventListener("mouseenter", () => sound.play("sfx-door_open", { volume: 0.4, singleInstance: true }));
    homeSign.addEventListener("mouseleave", () => sound.play("sfx-door_close", { volume: 0.4, singleInstance: true }));
    homeSign.addEventListener("click", () => {
        room.hide();
        scene.getFirst<Inventory>(Inventory)?.hideItemSelection();
        if (Home.instance) Home.instance.show();
        else new Home();
    });

    return homeSign;
}