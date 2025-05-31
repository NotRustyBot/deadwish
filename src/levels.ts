import { game } from "./game";
import { Fact, FactType, Notebook } from "./notebook";
import { Person } from "./person";
import { Scene } from "./scene";

export function testing() {
    game.scene = Scene.define(scene => {
        const bob = new Person("Bob");

        const fbob = new Fact(FactType.person, "John had a friend named Bob.");
        const problemCat = new Fact(FactType.problem, "Johns cat needs a new home.");
        const bobJohnsFriends = new Fact(FactType.misc, "what does bob know about johns friends?");
        const johnsCat = new Fact(FactType.misc, "John has a cat.");
        const bobHatesCat = new Fact(FactType.general, "Bob is allergic to cats.");
        const fclara = new Fact(FactType.person, "John had a friend named Clara.");


        const notebook = new Notebook();
        notebook.facts.add(fbob);
        notebook.facts.add(problemCat);
        notebook.facts.add(johnsCat);

        scene.add(Notebook, notebook);

        bob.responses.set(fbob, {
            askAs: "I have a few questions about John. You were his friend, right?",
            response: {
                text: ["Yes", "Sure", "What do you want to know?"],
                facts: [bobJohnsFriends]
            }
        });

        bob.responses.set(johnsCat, {
            askAs: "Do you know about John's cat?",
            response: {
                text: ["Not much, Im allergic", "But John liked it a lot."],
                facts: [bobHatesCat]
            }
        });

        bob.responses.set(bobJohnsFriends, {
            askAs: "Tell me about John's friends.",
            response: {
                text: ["There was a person named Clara."],
                facts: [fclara]
            }
        });

        scene.add(Person, bob);

        bob.showOptions();

    });

    game.scene.setup();
}