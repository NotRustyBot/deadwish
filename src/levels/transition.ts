import { Text } from "pixi.js";
import { game } from "../game";
import { transition } from "../levels";
import { Scene } from "../scene";
import { TimeManager } from "../timeManager";

export function interlude(transitionTo: () => void, message: string) {
    transition(() => {
        game.scene?.clear();
        game.scene = Scene.define(scene => {

            const text = new Text({
                text: message,
                style: {
                    fontSize: 96,
                    fill: 0xffffff,
                    fontFamily: "EB Garamond",
                }
            });

            game.uiContainer.addChild(text);
            text.anchor.set(0.5);
            text.x = game.app.screen.width / 2;
            text.y = game.app.screen.height / 2;

            TimeManager.animate(6, (progress, time) => {
                text.alpha = 1 - progress;
            })

            TimeManager.animate(1, (progress, time) => {
                text.alpha = progress;
            })

            TimeManager.wait(3000).then(() => {
                transition(() => {
                    game.scene?.clear();
                    transitionTo();
                });


                TimeManager.wait(4000).then(() => {
                    text.destroy();
                })
            });

        });
        game.scene.setup();
    });


}