import { ClickablePerson } from "../clickablePerson";
import { CrystalBall } from "../crystalBall";
import { game } from "../game";
import { Home } from "../home";
import { Inventory, ItemType } from "../inventory";
import { Fact, FactType, Notebook } from "../notebook";
import { Emotion, Person, PersonType } from "../person";
import { Ritual } from "../ritual";
import { Scene } from "../scene";
import { TimeManager } from "../timeManager";


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
            const replyFacts = [
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
                }),
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
            ]
            const deathResponse = {
                text: [`The time has come...`],
                facts: [death.addCommunication({
                    askAs: "There must have been a-",
                    response: {
                        text: [`...for our weekly beer and pizza!`],
                        emotion: Emotion.happy,
                        event: () => {
                            showRoom();
                        },
                        facts: [death.addCommunication({
                            askAs: "Phew! You had me there for a second, man.",
                            response: {
                                text: [`I would never!`],
                                emotion: Emotion.happy,
                                facts: replyFacts
                            }
                        })]
                    }
                })]
            }

            await TimeManager.wait(500);
            death.chat.addMessage("Good evening, Mage.", false);
            await TimeManager.wait(2000);
            notebook.add(
                death.addCommunication({
                    askAs: "[Click to reply]<br>I, uh...",
                    response: deathResponse
                })
            )

            //death.chat.addMessage("Let's go", false);
            //await TimeManager.wait(2000);
            //death.chat.addMessage("get some drinks, and order some food", false);
            //await TimeManager.wait(500);

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


            death.chat.htmlChat.removeOptions();
            death.showOptions();

        })();

        death.showChat();
        ball.render();
    });
    game.scene.setup();

}