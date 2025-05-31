export function pickRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

export function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}

export function clamp(n: number, min = 0, max = 1) {
    return Math.min(max, Math.max(min, n));
}