export class Easing {
    /**
     * Linear easing (no easing)
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static linear(x: number): number {
        return x;
    }

    /**
     * Quadratic ease-in
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInQuad(x: number): number {
        return x * x;
    }

    /**
     * Quadratic ease-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeOutQuad(x: number): number {
        return x * (2 - x);
    }

    /**
     * Quadratic ease-in-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInOutQuad(x: number): number {
        return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    }

    /**
     * Cubic ease-in
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInCubic(x: number): number {
        return x * x * x;
    }

    /**
     * Cubic ease-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeOutCubic(x: number): number {
        return 1 - Math.pow(1 - x, 3);
    }

    /**
     * Cubic ease-in-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInOutCubic(x: number): number {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    }

    /**
     * Quartic ease-in
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInQuart(x: number): number {
        return x * x * x * x;
    }

    /**
     * Quartic ease-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeOutQuart(x: number): number {
        return 1 - Math.pow(1 - x, 4);
    }

    /**
     * Quartic ease-in-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInOutQuart(x: number): number {
        return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
    }

    /**
     * Sine ease-in
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInSine(x: number): number {
        return 1 - Math.cos((x * Math.PI) / 2);
    }

    /**
     * Sine ease-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeOutSine(x: number): number {
        return Math.sin((x * Math.PI) / 2);
    }

    /**
     * Sine ease-in-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInOutSine(x: number): number {
        return -(Math.cos(Math.PI * x) - 1) / 2;
    }

    /**
     * Exponential ease-in
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInExpo(x: number): number {
        return x === 0 ? 0 : Math.pow(2, 10 * x - 10);
    }

    /**
     * Exponential ease-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeOutExpo(x: number): number {
        return x === 1 ? 1 : 1 - Math.pow(2, -10 * x);
    }

    /**
     * Exponential ease-in-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInOutExpo(x: number): number {
        if (x === 0) return 0;
        if (x === 1) return 1;
        return x < 0.5 
            ? Math.pow(2, 20 * x - 10) / 2 
            : (2 - Math.pow(2, -20 * x + 10)) / 2;
    }

    /**
     * Circular ease-in
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInCirc(x: number): number {
        return 1 - Math.sqrt(1 - Math.pow(x, 2));
    }

    /**
     * Circular ease-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeOutCirc(x: number): number {
        return Math.sqrt(1 - Math.pow(x - 1, 2));
    }

    /**
     * Circular ease-in-out
     * @param x Progress value between 0 and 1
     * @return Eased value
     */
    static easeInOutCirc(x: number): number {
        return x < 0.5
            ? (1 - Math.sqrt(1 - Math.pow(2 * x, 2))) / 2
            : (Math.sqrt(1 - Math.pow(-2 * x + 2, 2)) + 1) / 2;
    }
}