import { ClickablePerson } from "../clickablePerson";
import { CrystalBall } from "../crystalBall";
import { game } from "../game";
import { Home } from "../home";
import { Inventory, ItemType } from "../inventory";
import { transition } from "../levels";
import { Fact, FactType, Notebook } from "../notebook";
import { Emotion, Person, PersonType } from "../person";
import { Ritual, summoningPattern } from "../ritual";
import { Scene } from "../scene";
import { TimeManager } from "../timeManager";

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

            notebook.facts.add(karl.addCommunication({
                askAs: "Hello Karl. What seems to be the problem?",
                response: {
                    text: [`...`, `My sister...`, `The curse...`, `It's all so confusing.`, `Am I really dead now?`],
                    emotion: Emotion.confused,
                    facts: [
                        karl.addCommunication({
                            askAs: "Tell me about your sister.",
                            response: {
                                text: [`Her name is <${karlSister.id}>Greta</>.`, `She's always been there for me.`, `<${karlSisterBye.id}>I never said goodbye to her...</>`],
                                emotion: Emotion.sad,
                                facts: [karlSister, karlSisterBye],
                                event: () => {
                                    karl.followUp.add(sisterInquire)
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

            notebook.render();

            karl.showOptions();
            death.showChat();

        });
        game.scene.setup();
    });
}
