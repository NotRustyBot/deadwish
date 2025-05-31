import { BagOStuff, CookingPot, Ingredient } from "./cooking";
import { CrystalBall } from "./crystalBall";
import { game } from "./game";
import { Home } from "./home";
import { Inventory, ItemType } from "./inventory";
import { Fact, FactType, Notebook } from "./notebook";
import { Emotion, Person } from "./person";
import { Scene } from "./scene";
import { TimeManager } from "./timeManager";

export function testing() {
    game.scene = Scene.define(scene => {

        const fbob = new Fact(FactType.person, "John had a friend named Bob");
        const problemCat = new Fact(FactType.problem, "Johns cat needs a new home");
        const johnsCat = new Fact(FactType.misc, "");
        const bobAllergic = new Fact(FactType.general, "Bob is allergic to cats");
        const fclara = new Fact(FactType.person, "John had a friend named Clara");
        const cats = new Fact(FactType.misc, "");
        const clarasCat = new Fact(FactType.general, "Clara reluctantly offered to take care of the cat");
        const claraHatesCats = new Fact(FactType.general, "Clara doesn't like cats that much");
        const bobWantsJohnsCat = new Fact(FactType.general, "Bob would take care of the cat if he could");
        const antiAllergenPossible = new Fact(FactType.general, "You could brew an antiallergen in the alchemy lab.");



        const antialergenPrepared = new Fact(FactType.misc, "Antiallergen is prepared.");

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
                                        text: [`Ask <${fbob.id}>Bob</>. His friend.`],
                                        facts: [fbob],

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

        death.responses.set(antialergenPrepared, {
            askAs: "Give Bob the antialergen. The cat should live with him.",
            response: {
                text: ["I'll do that! Thanks man!"],
                emotion: Emotion.happy,
                event: () => {
                    death.customLogic = () => { };
                    death.followUp.clear();
                    scene2();
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
                    scene2();
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
                text: ["Oh...", "I miss John.", "What do you want to know?"],
                facts: [
                    bob.addCommunication({
                        askAs: "Tell me about John's friends.",
                        response: {
                            text: [`There was this woman, <${fclara.id}>Clara</>. I think they were dating.`],
                            facts: [fclara,
                                bob.addCommunication({
                                    askAs: "Does Clara like cats?",
                                    response: {
                                        text: [`<${claraHatesCats.id}>No</>`, "Not really."],
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
                text: [`Not much, I'm <${bobAllergic.id}>allergic</>.`, "But John liked it a lot.", `<${bobWantsJohnsCat.id}>I wish I could take care of it.</>`],
                facts: [bobAllergic, bobWantsJohnsCat],
                event: onAntialergenMade
            }
        });

        bob.responses.set(cats, {
            askAs: "Do you like cats?",
            response: {
                text: [`I'm <${bobAllergic.id}>allergic</> so I never had one.`, "They're really cute though."],
                facts: [bobAllergic],
                event: onAntialergenMade
            }
        });


        const clara = new Person({ name: "Clara", color: "#39B3B3" });
        clara.knownByFact = fclara;
        clara.responses.set(fclara, {
            askAs: "Tell me about John's friends.",
            response: {
                text: [`Uh, he always used to hang out with this guy, what was his name...`, `Oh, <${fbob.id}>Bob</>.`],
                facts: [fbob]
            }
        });

        clara.responses.set(johnsCat, {
            askAs: "Do you know John's cat?",
            response: {
                text: [`<${claraHatesCats.id}>Ew</>, that ugly thing?`, "I suppose somebody has to take care of it."],
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

function scene2() {
    transition(() => {
        game.scene.clear();
        game.scene = Scene.define(scene => {
            const pot = new CookingPot();
            const bag = new BagOStuff();
            const inventory = new Inventory();
            const ball = new CrystalBall();
            const home = new Home();
            const notebook = new Notebook();


            const figureOutWhatsNext = new Fact(FactType.problem, `Summon Karl and figure out what's next.`);

            const death = Person.newDeath();
            death.knownFromStart = true;
            death.chat.addMessage("So there is this guy...", false, Emotion.confused);

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
                                facts: [figureOutWhatsNext]
                            }
                        })
                    ],
                }
            }));
            notebook.render();

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
