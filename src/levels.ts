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

        TimeManager.animate(10, (p,t) => {
            console.log(p, t);
        });
    });

    game.scene.setup();
}