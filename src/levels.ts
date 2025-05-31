import { BagOStuff, CookingPot, Ingredient } from "./cooking";
import { CrystalBall } from "./crystalBall";
import { game } from "./game";
import { Inventory, ItemType } from "./inventory";
import { Fact, FactType, Notebook } from "./notebook";
import { Person } from "./person";
import { Scene } from "./scene";

export function testing() {
    game.scene = Scene.define(scene => {

        const fbob = new Fact(FactType.person, "John had a friend named Bob.");
        const problemCat = new Fact(FactType.problem, "Johns cat needs a new home.");
        const johnsCat = new Fact(FactType.misc, "");
        const bobHatesCat = new Fact(FactType.general, "Bob is allergic to cats.");
        const fclara = new Fact(FactType.person, "John had a friend named Clara.");
        const cats = new Fact(FactType.misc, "");
        const clarasCat = new Fact(FactType.general, "Clara reluctantly offered to take care of the cat.");



        const antialergenPrepared = new Fact(FactType.misc, "Antialergen is prepared.");

        const death = new Person("Death");
        death.knownFromStart = true;
        death.chat.addMessage("Hello", false);
        const initial = death.addCommunication({
            askAs: "Whats up?",
            response:
            {
                text: ["Unhappy customer.", "John."],
                facts: [
                    death.addCommunication({
                        askAs: "What does he want?",
                        response: {
                            text: ["His cat needs a new home."],
                            facts: [problemCat, johnsCat,
                                death.addCommunication({
                                    askAs: "Who will take care of it?",
                                    response: {
                                        text: ["Ask Bob. He's his friend."],
                                        facts: [fbob]
                                    }
                                })
                            ]
                        }
                    })
                ]
            }
        });

        death.responses.set(antialergenPrepared, {
            askAs: "Give Bob the antialergen. The cat should live with him.",
            response: {
                text: ["Okay."],
                event: () => {
                    death.customLogic = () => { };
                    death.followUp.clear();
                }
            }
        });

        death.responses.set(clarasCat, {
            askAs: "Clara will take care of the cat.",
            response: {
                text: ["Okay."],
                event: () => {
                    death.customLogic = () => { };
                    death.followUp.clear();
                }
            }
        });



        const bob = new Person("Bob");

        bob.knownByFact = fbob;

        const notebook = new Notebook();
        notebook.facts.add(cats);
        notebook.facts.add(initial);
        notebook.render();



        const pot = new CookingPot();
        const bag = new BagOStuff();
        const inventory = new Inventory();
        const ball = new CrystalBall();



        bob.responses.set(fbob, {
            askAs: "I have a few questions about John. You were his friend, right?",
            response: {
                text: ["Yes", "Sure", "What do you want to know?"],
                facts: [
                    bob.addCommunication({
                        askAs: "Tell me about John's friends.",
                        response: {
                            text: ["There was a person named Clara."],
                            facts: [fclara]
                        }
                    })
                ]
            }
        });


        const onAntialergenMade = () => {
            death.customLogic = () => {
                death.followUp.clear();
                if (inventory.items.includes(ItemType.antialergen)) {
                    death.followUp.add(antialergenPrepared);
                }
                if (notebook.facts.has(clarasCat)) {
                    death.followUp.add(clarasCat);
                }
            }
        }

        bob.responses.set(johnsCat, {
            askAs: "Do you know about John's cat?",
            response: {
                text: [`Not much, Im <${bobHatesCat.id}>allergic</>`, "But John liked it a lot.", "I wish I could take care of it."],
                facts: [bobHatesCat],
                event: onAntialergenMade
            }
        });

        bob.responses.set(cats, {
            askAs: "Do you like cats?",
            response: {
                text: [`I'm <${bobHatesCat.id}>allergic</>`],
                facts: [bobHatesCat],
                event: onAntialergenMade
            }
        });


        const clara = new Person("Clara");
        clara.knownByFact = fclara;
        clara.responses.set(fclara, {
            askAs: "Tell me about John's friends.",
            response: {
                text: ["There was a person named Bob."],
                facts: [fbob]
            }
        });

        clara.responses.set(johnsCat, {
            askAs: "Do you know John's cat?",
            response: {
                text: [`ew, that ugly thing?`, "I suppose somebody has to take care of it."],
                facts: [clara.addCommunication({
                    askAs: "Will you take care of the cat?",
                    response: {
                        text: ["I guess..."],
                        facts: [clarasCat],
                    }
                })]
            }
        });

        clara.showOptions();
        bob.showOptions();
        ball.render();


    });

    game.scene.setup();
}