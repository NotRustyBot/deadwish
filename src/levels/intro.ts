import { ClickablePerson } from "../clickablePerson";
import { CrystalBall } from "../crystalBall";
import { game, UpdateOrder } from "../game";
import { Home } from "../home";
import { Inventory, ItemType } from "../inventory";
import { Fact, FactType, Notebook } from "../notebook";
import { Emotion, Person, PersonType } from "../person";
import { Ritual, transmutationPattern } from "../ritual";
import { Scene } from "../scene";
import { TimeManager } from "../timeManager";


export function into() {
    game.scene = Scene.define(scene => {
        const inventory = new Inventory();
        const home = new Home();
        const ball = new CrystalBall();
        const ritual = new Ritual();

        const pizzaPlace = Person.newBall("Pizza Place", "#39B3B3");

        const facts = {
            orderPizza: new Fact(FactType.problem, `Order a pizza via crystal ball.`),
            getDrinks: new Fact(FactType.problem, `Get Hellbew.`),
            getNightmarePotion: new Fact(FactType.problem, `Brew a Nightmare Potion.`),
            pizzaContact: pizzaPlace.setSymbols("302"),
            nightmarePotionPrepared: new Fact(FactType.misc, ""),
            hellbrewReady: new Fact(FactType.misc, ""),
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
                        text: [`There's a brew I'd like to try.`, `It's called <${facts.getDrinks.id}>Hellbew</>.`],
                        facts: [facts.getDrinks],
                        event: () => {
                            showRoom();
                        }
                    }
                })
            );

            death.responses.set(facts.getDrinks, {
                askAs: "How do I make it?",
                response: {
                    text: [`First, you'll need to brew a <${facts.getNightmarePotion.id}>Nightmare Potion</>.`],
                    facts: [facts.getNightmarePotion],
                }
            })

            death.responses.set(facts.nightmarePotionPrepared, {
                askAs: "Got the Nightmare. What's next?",
                response: {
                    text: [`Now, using a Transmutation ritual, make it into Hellbrew.`],
                    facts: [facts.pizzaContact],
                }
            })

            death.responses.set(facts.hellbrewReady, {
                askAs: "I think I got it.",
                response: {
                    text: [`Lets's try it out!`],
                }
            })

            pizzaPlace.chat.addMessage("Pizza Place, can I take your order?", false);
            pizzaPlace.responses.set(facts.orderPizza, {
                askAs: "Yea, I'd like to get two medium pizzas.",
                response: {
                    text: [`Ofcorse.`, `Pickup or delivery?`],
                    facts: [
                        pizzaPlace.addCommunication({
                            askAs: "Delivery.",
                            response: {
                                text: [`Okay, it will be 30 minutes.`],
                            }
                        })
                    ]
                }
            })


            const factChecker = {
                update() {
                    if (!notebook.facts.has(facts.nightmarePotionPrepared) && inventory.items.some(i => i == ItemType.nightmarePotion)) {
                        notebook.facts.add(facts.nightmarePotionPrepared);
                        facts.getNightmarePotion.resolve();
                    }
                },
                destroy() {
                    game.removeUpdatable(UpdateOrder.system, factChecker);
                    scene.remove(factChecker, factChecker);
                }
            }

            game.addUpdatable(UpdateOrder.system, factChecker);
            scene.add(factChecker, factChecker);

            death.chat.htmlChat.removeOptions();
            death.showOptions();
        })();

        ritual.customLogic = () => {
            if (ritual.itemHeld == ItemType.nightmarePotion && ritual.matchPattern(transmutationPattern)) {
                notebook.add(facts.hellbrewReady);
                ritual.ritualSuccess();
                facts.getDrinks.resolve();
                ritual.itemSelectedCallback(ItemType.hellbrew);
            }
        };


        death.showChat();
        ball.render();
    });
    game.scene.setup();

}