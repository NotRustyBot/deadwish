import { game, UpdateOrder } from "./game";



type Animate = {
    length: number,
    time: number,
    callback: (progress: number, time: number) => (void | boolean)
}

export class TimeManager {
    static animations = new Set<Animate>();
    static wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static init() {
        game.addUpdatable(UpdateOrder.system, TimeManager);
    }

    static animate(length: number, callback: Animate["callback"]) {
        this.animations.add({ length, time: 0, callback });
    }

    static update() {
        for (const animation of [...this.animations]) {
            animation.time += game.dt;
            if (animation.callback(Math.min(animation.time / animation.length, 1), Math.min(animation.time, animation.length)) || animation.time >= animation.length) {
                this.animations.delete(animation);
            }
        }
    }
}