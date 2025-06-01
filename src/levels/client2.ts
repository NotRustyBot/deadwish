import { ClickablePerson } from "../clickablePerson";
import { CrystalBall } from "../crystalBall";
import { game, UpdateOrder } from "../game";
import { Home } from "../home";
import { Inventory, ItemType } from "../inventory";
import { transition } from "../levels";
import { Fact, FactType, Notebook } from "../notebook";
import { Emotion, Person, PersonType } from "../person";
import { Ritual, summoningPattern } from "../ritual";
import { Scene } from "../scene";
import { TimeManager } from "../timeManager";
import { client1 } from "./client1";

export function client2() {
    transition(() => {
        game.scene?.clear();
        game.scene = Scene.define(scene => {
            const inventory = new Inventory();
            const ball = new CrystalBall();
            const home = new Home();




            const figureOutWhatsNext = new Fact(FactType.problem, `Summon Karl and figure out what's next.`);
            const summoningRitual = new Fact(FactType.general, `You summoned Karl via the ritual.`);
            const greta = Person.newBall("Greta", "#39B3B3");
            const gretaAddress = greta.setSymbols("431");
            const karlSister = new Fact(FactType.person, `Karl has a sister named Greta.`);
            const karlSisterBye = new Fact(FactType.problem, `Karl wants to talk to Greta one last time.`);
            const karlSisterWitch = new Fact(FactType.general, `Karl's sister is a witch.`);
            const karlCursed = new Fact(FactType.problem, `Karl is cursed.`);
            const karlSisterSummon = new Fact(FactType.general, `Karl had a final chat with his sister.`);
            const karlSisterDenyCurse = new Fact(FactType.general, `Karl's sister said she can't lift the curse.`);
            const karlSisterLied = new Fact(FactType.problem, `Karl's sister lied about the curse.`);
            const gretaCursedKarl = new Fact(FactType.problem, `Greta lifted the curse from Karl.`);
            const karlFinished = new Fact(FactType.problem, `Karl is finished.`);
            const karlAmuletCursed = new Fact(FactType.problem, `Karl's amulet is cursed.`);


            const karl = Person.newGhost("Karl", "#39B3B3");
            karl.knownByFact = summoningRitual;

            const death = Person.newDeath();
            const notebook = new Notebook();
            death.knownFromStart = true;
            death.chat.addMessage("So there is this guy...", false, Emotion.confused);
            //death.chat.exitable = false;

            notebook.facts.add(death.addCommunication({
                askAs: "Yeah?",
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

            const karlSisterDoubt = karl.addCommunication({
                askAs: "Karl, your sister says she can't lift your curse.",
                response: {
                    text: [`Really?`, `I saw her lift a curse a few times.`, `Are you sure she said that?`],
                    emotion: Emotion.confused,
                    facts: [karl.addCommunication({
                        askAs: "No. I'm sure.",
                        response: {
                            text: [`<${karlSisterLied.id}>I think she's lying.</>`, `When we talked, it was clear she doesn't wanna let me go.`, `Could you talk to her about that?`],
                            emotion: Emotion.sad,
                            facts: [karlSisterLied],
                        }
                    })],
                },
            })

            greta.responses.set(karlSisterLied, {
                askAs: "I know you lied about the curse, Greta. What's going on?",
                response: {
                    text: [`Crap.`, `Look, I'm sorry.`, `I... I just didn't want Karl to be taken away forever.`, `<${gretaCursedKarl.id}>It's me who cursed him.</>`],
                    emotion: Emotion.sad,
                    event: () => {
                        karlSisterLied.resolve();
                    },
                    facts: [gretaCursedKarl, greta.addCommunication({
                        askAs: "Lift the curse now, please. Karl is suffering.",
                        response: {
                            text: [`Please tell him I'm really sorry.`, `I can't lift the curse from here. <${karlAmuletCursed.id}>I placed it on Karl's amulet.</>`, `If you have the amulet, you can lift the curse.`],
                            emotion: Emotion.sad,
                            facts: [karlAmuletCursed],
                            event: () => {
                                inventory.addItem(ItemType.amulet);
                                karlCursed.resolve();
                            },
                        }
                    })],
                },
            });

            const sisterInquire = karl.addCommunication({
                askAs: "Maybe we could do something. How could I reach her?",
                response: {
                    text: [`You'd let me talk to her?`, `<${greta.knownByFact!.id}>She has a magic address.</>`, `It's ${greta.symbolsHtml}`],
                    emotion: Emotion.happy,
                    facts: [gretaAddress],
                    event: () => {
                        karl.followUp.delete(sisterInquire);
                    }
                },
            })

            const curseInquire = karl.addCommunication({
                askAs: "I need to find out who cursed you.",
                response: {
                    text: [`I don't think I know anyone who would want to curse me.`, `Honestly, I don't know a lot about curses.`, `But my sister could tell you more about them!`, `<${karlSisterWitch.id}>She is a witch.</>`],
                    emotion: Emotion.confused,
                    facts: [karlSisterWitch],
                    event: () => {
                        karl.followUp.delete(curseInquire);
                    }
                },
            })
            karl.chat.addNarration("A shaky ghost appears in front of you. He seems to be confused.");

            notebook.facts.add(karl.addCommunication({
                askAs: "Hello Karl. What seems to be the problem?",
                response: {
                    text: [`...`, `My sister...`, `The curse...`, `It's all so confusing.`, `Am I really dead now?`],
                    emotion: Emotion.confused,
                    facts: [
                        karl.addCommunication({
                            askAs: "Tell me about your sister.",
                            response: {
                                text: [`Her name is <${karlSister.id}>Greta</>.`, `We were very close. She's always been there for me.`, `<${karlSisterBye.id}>We didn't get to say a proper goodbye...</>`],
                                emotion: Emotion.sad,
                                facts: [karlSister, karlSisterBye],
                                event: () => {
                                    karl.followUp.add(sisterInquire)
                                    greta.followUp.add(karlSisterBye);
                                }
                            }
                        }),
                        karl.addCommunication({
                            askAs: "Tell me about the curse.",
                            response: {
                                text: [`I feel like I'm stuck between worlds.`, `<${karlCursed.id}>I think someone cursed me.</>`, `Could you help?`],
                                emotion: Emotion.confused,
                                facts: [karlCursed],
                                event: () => {
                                    karl.followUp.add(curseInquire)
                                }
                            }
                        })
                    ]
                }
            }))

            const ritual = new Ritual();
            ritual.customLogic = (t: Ritual) => {
                if (t.itemHeld == ItemType.summoningPotion && t.matchPattern(summoningPattern)) {
                    t.ritualSuccess();
                    notebook.add(summoningRitual);
                    figureOutWhatsNext.resolve();
                    karl.showChat();
                    karl.clickablePerson = new ClickablePerson(karl, t.personContainer);
                }
            };

            greta.responses.set(karlSisterBye, {
                askAs: "You're Karl's sister, right?",
                response: {
                    text: [`That's right.`, `Is he okay?`],
                    facts: [greta.addCommunication({
                        askAs: "Karl is dead.",
                        response: {
                            text: [`Oh my god.`, `I... Thank you for letting me know.`],
                            emotion: Emotion.sad,
                            facts: [greta.addCommunication({
                                askAs: "Karl's ghost wants to say goodbye one last time. Could you summon him and talk to him?",
                                response: {
                                    text: [`That's so sweet!`, `<${karlSisterSummon.id}>I'll do that.</> Thank you.`],
                                    emotion: Emotion.happy,
                                    facts: [karlSisterSummon],
                                    event: () => {
                                        karlSisterBye.resolve();
                                    }
                                }
                            })]
                        }
                    })],
                    event: () => {
                        greta.followUp.delete(karlSisterBye);
                    }
                }
            })

            greta.responses.set(karlSisterWitch, {
                askAs: "Karl told me you were a witch.",
                response: {
                    text: [`That's right.`, `Can I help you with anything?`],
                    facts: [greta.addCommunication({
                        askAs: "Karl's spirit seems to be cursed. Could you help him?",
                        response: {
                            text: [`Oh! That's... unfortunate.`, `I don't think I can do much to lift a curse, sorry.`],
                            emotion: Emotion.confused,
                            facts: [karlSisterDenyCurse]
                        }
                    })]
                }
            })

            death.responses.set(karlFinished, {
                askAs: "Turns out Karl's sister cursed him so she could talk to his ghost anytime. It's resolved.",
                response: {
                    text: [`I've seen a lot of ways people try to avoid me. I don't think I've seen anything like this yet.`, `Thank you for helping me bring peace to Karl.`],
                    emotion: Emotion.confused,
                    facts: [death.addCommunication({
                        askAs: "No problem, man.",
                        response: {
                            text: [`Now if you'll excuse me.`],
                            event: () => {
                                death.chat.addNarration("Death takes Karl to the realm of eternal peace.");
                                setTimeout(() => {
                                    client1();
                                }, 5000)
                            }
                        }
                    })],
                }
            })

            notebook.render();

            karl.showOptions();
            death.showChat();

            const factChecker = {
                update() {
                    if (!notebook.facts.has(karlSisterDoubt) && notebook.facts.has(karlSisterDenyCurse) && notebook.facts.has(karlSisterSummon)) {
                        notebook.facts.add(karlSisterDoubt);
                    }
                    if (!notebook.facts.has(karlFinished) && karlCursed.resolved && karlSisterBye.resolved) {
                        notebook.facts.add(karlFinished);
                    }
                },
                destroy() {
                    game.removeUpdatable(UpdateOrder.system, factChecker);
                    scene.remove(factChecker, factChecker);
                }
            }

            game.addUpdatable(UpdateOrder.system, factChecker);
            scene.add(factChecker, factChecker);

        });
        game.scene.setup();
    });
}
