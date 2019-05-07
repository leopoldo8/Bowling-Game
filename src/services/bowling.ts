interface Rolls extends Array<number> { }

export default class Bowling {
    public rolls: Rolls = [];
    public value: number = 0;
    public values: Rolls = [];
    public frames: any[] = [];

    private lastIndex: number = -2;
    private lock: boolean = false;
    private afterFramelock: boolean = false;

    constructor(rolls?: Rolls) {
        if (rolls) {
            this.roll(rolls);
        }
    }

    public score() {
        return this.value;
    }

    public roll(pins: number | Rolls) {
        const err = 'Should not be able to roll after game is over';
        if (this.lock) {
            throw new Error(err);
        } else if (this.afterFramelock) {
            this.lock = true;
        }

        const lastFillBall: boolean = this.frames[9] !== undefined && this.frames[9][2] !== undefined;

        if (lastFillBall) {
            throw new Error(err);
        }

        this.lastIndex = -2;
        if (typeof pins === 'number') {
            this.rolls.push(pins);
            this.mapFrames();
        } else {
            pins.map((a: number) => {
                this.rolls.push(a);
                this.mapFrames();
            });
        }
    }

    public showFrames() {
        return this.frames;
    }

    private countScore() {
        this.values = this.frames.map((frame: Array<{roll: number}>, index: number) => {
            const firstThrow: number = frame[0].roll;
            const secondThrow: number = frame[1] ? frame[1].roll : 0;
            const thirdThrow: number = frame[2] ? frame[2].roll : 0;
            let nextOneThrow: number = 0;
            let nextTwoThrow: number = 0;

            const nextFrame: any[] = this.frames[index + 1];
            const nextSecondFrame: any[] = this.frames[index + 2];

            if (nextFrame) {
                nextOneThrow = nextFrame[0].roll;
                if (nextFrame[1] || nextSecondFrame) {
                    nextTwoThrow = nextFrame[1] ? nextFrame[1].roll : nextSecondFrame[0].roll;
                }
            }

            if (index === 9) {
                // tenth frame
                return firstThrow + secondThrow + thirdThrow;
            } else if (firstThrow && !secondThrow) {
                // strike
                return firstThrow + nextOneThrow + nextTwoThrow;
            } else if (firstThrow + secondThrow === 10) {
                // spare
                return firstThrow + secondThrow + nextOneThrow;
            } else {
                // open frame
                return firstThrow + secondThrow;
            }
        });

        this.value = this.values.reduce((a: any, b: any) => a + b);
    }

    private mapFrames() {
        // map
        this.frames = this.rolls.map((e: number, i: number) => this.recursiveFrame(e, i));

        // filter empty arrays
        this.frames = this.frames.filter((e) => e.length);

        // count score
        if (this.frames.length) { this.countScore(); }
    }

    private recursiveFrame(roll: number, index: number, nextRollValue?: number, lastRollValue?: number): any[] {
        const lastFrameExists: boolean = this.frames[9] && this.frames[9][2] !== undefined;
        const overLastFrame: boolean = lastFrameExists && this.frames[9][2].index >= index;
        const rollAlreadyUsed: boolean = index === this.lastIndex;

        if (this.lock || overLastFrame || rollAlreadyUsed) { return []; }
        if (roll < 0 || roll > 10) { throw new Error('Pins must have a value from 0 to 10'); }

        this.lastIndex = index;
        const nextIndex: number = index + 1;
        const nextRoll = this.rolls[nextIndex];

        if (lastRollValue !== undefined) {
            this.lock = true;
            return [{
                roll,
                index: index - 2,
            }, {
                roll: nextRollValue,
                index: index - 1,
            }, {
                roll: lastRollValue,
                index,
            }];
        }

        const tenFrameExists: boolean = this.frames.length >= 10 && this.frames[9][0] !== undefined;
        const secondThrowTenFrame: boolean = this.frames[9][1] !== undefined;
        const lastFrameWithSecondThrow: boolean = secondThrowTenFrame && this.rolls.length - 3 <= index;
        const lastFrame: boolean = this.rolls.length - 2 <= index;
        const onLastFrame: boolean = secondThrowTenFrame && this.rolls.length - 2 === index;
        const onTenFrame: boolean = tenFrameExists && lastFrame && lastFrameWithSecondThrow;
        const onSecondThrowOfTenFrame: boolean = tenFrameExists && onLastFrame;

        if (nextRollValue === undefined) {
            if (roll === 10 && !onTenFrame || nextRoll === undefined) {
                return [{
                    roll,
                    index,
                }];
            }

            return this.recursiveFrame(roll, nextIndex, nextRoll);
        }

        const err = 'Pin count exceeds pins on the lane';

        if (onSecondThrowOfTenFrame && nextRoll !== undefined) {
            const spareOrStrike: boolean = roll + nextRollValue >= 10;
            if (spareOrStrike) {
                return this.recursiveFrame(roll, nextIndex, nextRollValue, nextRoll);
            } else {
                throw new Error(err);
            }

        } else if ((roll + nextRollValue > 10 || nextRollValue === 10) && !onTenFrame) {
            throw new Error(err);
        }

        return [{
            roll,
            index: index - 1,
        }, {
            roll: nextRollValue,
            index,
        }];
    }

}
