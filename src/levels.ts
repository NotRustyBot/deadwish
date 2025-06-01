import { DEG_TO_RAD } from "pixi.js";
import { ClickablePerson } from "./clickablePerson";
import { CrystalBall } from "./crystalBall";
import { game } from "./game";
import { Home } from "./home";
import { Inventory, ItemType } from "./inventory";
import { Fact, FactType, Notebook } from "./notebook";
import { Emotion, Person, PersonType } from "./person";
import { Ritual } from "./ritual";
import { Scene } from "./scene";
import { TimeManager } from "./timeManager";


const transmutationPattern = "101010";
const summoningPattern = "101101";
const cursePattern = "010101";


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
                    client2();
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
                    client2();
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

export function client2() {
    transition(() => {
        game.scene?.clear();
        game.scene = Scene.define(scene => {
            const inventory = new Inventory();
            const ball = new CrystalBall();
            const home = new Home();




            const figureOutWhatsNext = new Fact(FactType.problem, `Summon Karl and figure out what's next.`);
            const summoningRitual = new Fact(FactType.general, `You summoned Karl via the ritual.`);



            const death = Person.newDeath();
            const notebook = new Notebook();
            death.knownFromStart = true;
            death.chat.addMessage("So there is this guy...", false, Emotion.confused);
            //death.chat.exitable = false;

            notebook.facts.add(death.addCommunication({
                askAs: "uh huh",
                response: {
                    text: [`Yeah I don't really know what he wants.`, `Keeps complaining about his sister, a curse, and whatnot.`, `I figured it would be easier if you summoned him and talked to him.`],
                    emotion: Emotion.confused,
                    facts: [
                        death.addCommunication({
                            askAs: "Got a name at least?",
                            response: {
                                text: [`<${figureOutWhatsNext.id}>Karl</>.`],
                                facts: [figureOutWhatsNext],
                                event: () => {
                                    death.chat.exitable = true;
                                }
                            },
                        })
                    ],
                }
            }));


            const karl = Person.newGhost("Karl", "#39B3B3");
            karl.knownByFact = summoningRitual;
            notebook.facts.add(karl.addCommunication({
                askAs: "Hello Karl. What seems to be the problem?",
                response: {
                    text: [`...`, `meú bych`],
                }
            }))

            const ritual = new Ritual();
            ritual.customLogic = (t: Ritual) => {
                if (t.itemHeld == ItemType.summoningPotion && t.matchPattern(summoningPattern)) {
                    notebook.add(summoningRitual);
                    figureOutWhatsNext.resolve();
                    karl.showChat();
                    karl.clickablePerson = new ClickablePerson(karl, t.personContainer);
                }
            };

            notebook.render();

            karl.showOptions();
            death.showChat();

        });
        game.scene.setup();
    });
}

async function transition(mid: () => void) {
    TimeManager.animate(0.5, (progress, time) => {
        game.app.stage.alpha = 1 - progress;
    })
    await TimeManager.wait(500);
    mid();
    TimeManager.animate(0.5, (progress, time) => {
        game.app.stage.alpha = progress;
    })
}


export function into() {
    game.scene = Scene.define(scene => {
        const inventory = new Inventory();
        const home = new Home();
        const ball = new CrystalBall();


        const pizzaPlace = Person.newBall("Pizza Place", "#39B3B3");

        const facts = {
            orderPizza: new Fact(FactType.problem, `Order a pizza via crystal ball.`),
            getDrinks: new Fact(FactType.problem, `Get Hellbew.`),
            pizzaContact: pizzaPlace.setSymbols("302")
        };

        const death = Person.newDeath();
        const notebook = new Notebook();
        notebook.hide();
        death.knownFromStart = true;
        death.chat.exitable = false;
        game.roomContainer.alpha = 0;

        (async () => {
            await TimeManager.wait(500);
            death.chat.addMessage("It's time", false);
            await TimeManager.wait(2000);
            death.chat.addMessage("Let's go", false);
            await TimeManager.wait(2000);
            death.chat.addMessage("get some drinks, and order some food", false);
            await TimeManager.wait(500);

            let isRoomShown = false;
            const showRoom = () => {
                if (isRoomShown) return;
                isRoomShown = true;
                TimeManager.animate(0.5, (progress, time) => {
                    game.roomContainer.alpha = progress;
                })
                notebook.show();
                death.chat.exitable = true;
            }

            notebook.add(
                death.addCommunication({
                    askAs: "What do you want to get?",
                    response: {
                        text: [`Let's try the new Pizza Place.`, `They take <${facts.orderPizza.id}>orders via crystal ball</>.`],
                        facts: [facts.orderPizza,
                        death.addCommunication({
                            askAs: "What's the magic address?",
                            response: {
                                text: [`<${facts.pizzaContact.id}>it's</> ${pizzaPlace.symbolsHtml}.`],
                                facts: [facts.pizzaContact],
                            },
                        }),
                        ],
                        event: () => {
                            showRoom();
                        }
                    }
                })
            );
            notebook.add(
                death.addCommunication({
                    askAs: "What drinks do you want?",
                    response: {
                        text: [`There's a brew I'd like to try.`, `It's called <${facts.getDrinks.id}>Hellbew</>.`, `It's a transmutation of Nightmare Potion.`],
                        facts: [facts.getDrinks],
                        event: () => {
                            showRoom();
                        }
                    }
                })
            );
            death.showOptions();

        })();

        death.showChat();
        ball.render();
    });
    game.scene.setup();

}