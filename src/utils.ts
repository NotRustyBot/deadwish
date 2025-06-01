import type { Sprite } from "pixi.js";

export function pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

export function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function clamp(n: number, min = 0, max = 1) {
    return Math.min(max, Math.max(min, n));
}

export function fitSprite(sprite: Sprite, width: number, height: number) {
    const ratio = sprite.texture.width / sprite.texture.height;
    if (width / ratio > height) {
        sprite.width = height * ratio;
        sprite.height = height;
    } else {
        sprite.height = width / ratio;
        sprite.width = width;
    }
}
