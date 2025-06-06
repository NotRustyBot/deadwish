import { CrystalBall } from "../crystalBall";
import { game } from "../game";
import { Home } from "../home";
import { Inventory, ItemType } from "../inventory";
import { Fact, FactType, Notebook } from "../notebook";
import { Emotion, Person, PersonType } from "../person";
import { Scene } from "../scene";
import { client2 } from "./client2";
import { interlude } from "./transition";


export function client1() {
    game.scene = Scene.define(scene => {

        const fbob = new Fact(FactType.person, "John had a friend named Bob");
        const problemCat = new Fact(FactType.problem, "John left behind his cat, who needs to be taken care of");
        const johnsCat = new Fact(FactType.misc, "");
        const bobAllergic = new Fact(FactType.general, "Bob is allergic to cats");
        const fclara = new Fact(FactType.person, "John had a friend named Clara");
        const cats = new Fact(FactType.misc, "");
        const clarasCat = new Fact(FactType.general, "Clara reluctantly offered to take care of the cat");
        const claraHatesCats = new Fact(FactType.general, "Clara doesn't like cats that much");
        const bobWantsJohnsCat = new Fact(FactType.general, "Bob would take care of the cat if he could");
        const antiAllergenPossible = new Fact(FactType.general, "You could brew an antiallergen in the alchemy lab.");

        const antiallergenPrepared = new Fact(FactType.misc, "Antiallergen is prepared.");

        const bob = Person.newBall("Bob", "#39B3B3");
        const bobContact = bob.setSymbols("121");

        const clara = Person.newBall("Clara", "#39B3B3");
        const claraContact = clara.setSymbols("410");

        const inventory = new Inventory();
        const home = new Home();
        const ball = new CrystalBall();

        const death = Person.newDeath();
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
                            emotion: Emotion.confused,
                            facts: [problemCat, johnsCat,
                                death.addCommunication({
                                    askAs: "Who will take care of it?",
                                    response: {
                                        text: [`You could try asking <${fbob.id}>Bob</>. His friend.`, `His <${bobContact.id}>magic address</> is ${bob.symbolsHtml}.`],
                                        facts: [fbob, bobContact],
                                    }
                                })
                            ]
                        }
                    })
                ]
            }
        });

        death.responses.set(bobWantsJohnsCat, {
            askAs: "Hey, Bob would take care of the cat, but he seems to be allergic to cats.",
            response: {
                text: ["The poor guy! Maybe you could help him somehow."],
                emotion: Emotion.confused,
                facts: [antiAllergenPossible]
            }
        });

        death.responses.set(antiallergenPrepared, {
            askAs: "Give Bob the antiallergen. The cat should live with him.",
            response: {
                text: ["I'll do that! Thanks man!"],
                emotion: Emotion.happy,
                event: () => {
                    death.customLogic = () => { };
                    death.followUp.clear();
                    interlude(client2, "The next day");
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
                    interlude(client2, "The next day");
                }
            }
        });





        const notebook = new Notebook();
        notebook.facts.add(cats);
        notebook.facts.add(initial);
        notebook.render();



        //const pot = new CookingPot();
        //const bag = new BagOStuff();




        bob.responses.set(fbob, {
            askAs: "I have a few questions about John. You were his friend, right?",
            response: {
                text: ["Oh...", "I miss John.", "What do you want to know?"],
                emotion: Emotion.sad,
                facts: [
                    bob.addCommunication({
                        askAs: "Tell me about John's friends.",
                        response: {
                            emotion: Emotion.confused,
                            text: [`There was this woman, <${fclara.id}>Clara</>. I think they were dating.`],
                            facts: [fclara,
                                bob.addCommunication({
                                    askAs: "Does Clara like cats?",
                                    response: {
                                        text: [`<${claraHatesCats.id}>No</>`, "Not really."],
                                        facts: [claraHatesCats]
                                    }
                                }),
                                bob.addCommunication({
                                    askAs: "How do I reach her?",
                                    response: {
                                        text: [`Her <${claraContact.id}>symbols are</> ${clara.symbolsHtml}`],
                                        facts: [claraContact]
                                    }
                                })]
                        }
                    })
                ]
            }
        });


        const onAntiallergenMade = () => {
            death.customLogic = () => {
                death.followUp.clear();
                if (inventory.items.includes(ItemType.antiallergen)) {
                    death.followUp.add(antiallergenPrepared);
                }
                if (notebook.facts.has(clarasCat)) {
                    death.followUp.add(clarasCat);
                }
            }
        }

        bob.responses.set(johnsCat, {
            askAs: "Do you know about John's cat?",
            response: {
                text: [`Not much, I'm <${bobAllergic.id}>allergic</>.`, "But John liked it a lot.", `<${bobWantsJohnsCat.id}>I wish I could take care of it.</>`],
                facts: [bobAllergic, bobWantsJohnsCat],
                event: onAntiallergenMade
            }
        });

        bob.responses.set(cats, {
            askAs: "Do you like cats?",
            response: {
                emotion: Emotion.happy,
                text: [`I'm <${bobAllergic.id}>allergic</> so I never had one.`, "They're really cute though."],
                facts: [bobAllergic],
                event: onAntiallergenMade
            }
        });




        clara.responses.set(fclara, {
            askAs: "Tell me about John's friends.",
            response: {
                emotion: Emotion.confused,
                text: [`Uh, he always used to hang out with this guy, what was his name...`, `Oh, <${fbob.id}>Bob</>.`],
                facts: [fbob]
            }
        });

        clara.responses.set(johnsCat, {
            askAs: "Do you know John's cat?",
            response: {
                emotion: Emotion.confused,
                text: [`<${claraHatesCats.id}>Ew</>, that ugly thing?`, "I suppose somebody has to take care of it."],
                facts: [claraHatesCats, clara.addCommunication({
                    askAs: "Will you take care of the cat?",
                    response: {
                        emotion: Emotion.sad,
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