import { Chat } from "./chat";
import { game } from "./game";
import { Fact, FactType } from "./notebook";
import { Person } from "./person";
import { Scene } from "./scene";
import { TimeManager } from "./timeManager";

export function testing() {
    game.scene = Scene.define(scene => {
        const person1 = new Person("John");
        const fact1 = new Fact(FactType.misc, "Hello");
        person1.responses.set(fact1, "Hi");
        scene.add(Person, person1);


        (async () => {
            const chat = new Chat();
            await TimeManager.wait(3000);
            chat.addMessage("hello", true);
            await TimeManager.wait(1000);
            chat.addMessage("hi", false);
            await TimeManager.wait(1000);
            chat.addMessage("I have a few questions about John.", true);
            await TimeManager.wait(2000);
            chat.addMessage("who? 😂", false);
        })()



    });

    game.scene.setup();
}