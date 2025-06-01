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
