import { game } from "./game";
import { TimeManager } from "./timeManager";

export async function transition(mid: () => void) {
    TimeManager.animate(0.5, (progress, time) => {
        game.roomContainer.alpha = 1 - progress;
    })
    await TimeManager.wait(500);
    mid();
    TimeManager.animate(0.5, (progress, time) => {
        game.roomContainer.alpha = progress;
    })
}

