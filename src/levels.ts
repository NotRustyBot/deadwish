import { BagOStuff, CookingPot, Ingredient } from "./cooking";
import { CrystalBall } from "./crystalBall";
import { game } from "./game";
import { Home } from "./home";
import { Inventory, ItemType } from "./inventory";
import { Fact, FactType, Notebook } from "./notebook";
import { Person } from "./person";
import { Scene } from "./scene";

export function testing() {
    game.scene = Scene.define(scene => {

        const fbob = new Fact(FactType.person, "John had a friend named Bob");
        const problemCat = new Fact(FactType.problem, "Johns cat needs a new home");
        const johnsCat = new Fact(FactType.misc, "");
        const bobAlergic = new Fact(FactType.general, "Bob is allergic to cats");
        const fclara = new Fact(FactType.person, "John had a friend named Clara");
        const cats = new Fact(FactType.misc, "");
        const clarasCat = new Fact(FactType.general, "Clara reluctantly offered to take care of the cat");
        const claraHatesCats = new Fact(FactType.general, "Clara doesn't like cats that much");
        const bobWantsJohnsCat = new Fact(FactType.general, "Bob would take care of the cat if he could");



        const antialergenPrepared = new Fact(FactType.misc, "Antialergen is prepared.");

        const death = new Person({ name: "Death", color: "#F13A3A", image: "img/death/0001.png" });
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
                            text: [`His <${problemCat.id}>cat needs a new home</>.`],
                            facts: [problemCat, johnsCat,
                                death.addCommunication({
                                    askAs: "Who will take care of it?",
                                    response: {
                                        text: [`Ask <${fbob.id}>Bob</>. His friend.`],
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



        const bob = new Person({ name: "Bob", color: "#39B3B3" });

        bob.knownByFact = fbob;

        const notebook = new Notebook();
        notebook.facts.add(cats);
        notebook.facts.add(initial);
        notebook.render();



        const pot = new CookingPot();
        const bag = new BagOStuff();
        const inventory = new Inventory();
        const ball = new CrystalBall();
        const home = new Home();



        bob.responses.set(fbob, {
            askAs: "I have a few questions about John. You were his friend, right?",
            response: {
                text: ["Yes", "Sure", "What do you want to know?"],
                facts: [
                    bob.addCommunication({
                        askAs: "Tell me about John's friends.",
                        response: {
                            text: [`There was a person named <${fclara.id}>Clara</>.`],
                            facts: [fclara,
                                bob.addCommunication({
                                    askAs: "Does Clara like cats?",
                                    response: {
                                        text: [`<${claraHatesCats.id}>No</>`, "not really"],
                                        facts: [claraHatesCats]
                                    }
                                })]
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
                text: [`Not much, Im <${bobAlergic.id}>allergic</>`, "But John liked it a lot.", `<${bobWantsJohnsCat.id}>I wish I could take care of it.</>`],
                facts: [bobAlergic],
                event: onAntialergenMade
            }
        });

        bob.responses.set(cats, {
            askAs: "Do you like cats?",
            response: {
                text: [`I'm <${bobAlergic.id}>allergic</>`],
                facts: [bobAlergic],
                event: onAntialergenMade
            }
        });


        const clara = new Person({ name: "Clara", color: "#39B3B3" });
        clara.knownByFact = fclara;
        clara.responses.set(fclara, {
            askAs: "Tell me about John's friends.",
            response: {
                text: [`There was a person named <${fbob.id}>Bob</>.`],
                facts: [fbob]
            }
        });

        clara.responses.set(johnsCat, {
            askAs: "Do you know John's cat?",
            response: {
                text: [`<${claraHatesCats.id}>ew</>, that ugly thing?`, "I suppose somebody has to take care of it."],
                facts: [claraHatesCats, clara.addCommunication({
                    askAs: "Will you take care of the cat?",
                    response: {
                        text: [`<${clarasCat.id}>I guess</>...`],
                        facts: [clarasCat],
                    }
                })]
            }
        });

        clara.showOptions();
        bob.showOptions();
        death.showChat();
        ball.render();


    });

    game.scene.setup();
}