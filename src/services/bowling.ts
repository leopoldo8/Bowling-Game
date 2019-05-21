interface Rolls extends Array<number> { }
interface Frame extends Array<{ roll: number }> { }

export default class Bowling {
    public rolls: Rolls = [];
    public value: number = 0;
    public values: Rolls = [];
    public frames: any[] = [];
    public lock: boolean = false;

    private lastIndex: number = -2;
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
            pins.map((a) => {
                this.rolls.push(a);
                this.mapFrames();
            });
        }
    }

    public showFrames() {
        return this.frames;
    }

    private countScore() {
        this.values = this.frames.map((frame: Frame, index: number) => {
            const firstThrow: number = frame[0].roll;
            const secondThrow: number = frame[1] ? frame[1].roll : 0;
            const thirdThrow: number = frame[2] ? frame[2].roll : 0;
            let nextOneThrow: number = 0;
            let nextTwoThrow: number = 0;

            const nextFrame: Frame = this.frames[index + 1];
            const nextNdFrame: Frame = this.frames[index + 2];

            if (nextFrame) {
                nextOneThrow = nextFrame[0].roll;
                if (nextFrame[1] || nextNdFrame) {
                    nextTwoThrow = nextFrame[1] ? nextFrame[1].roll : nextNdFrame[0].roll;
                }
            }

            if (index === 9) {
                // tenth frame
                return firstThrow + secondThrow + thirdThrow;
            } else if (firstThrow === 10) {
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
        if (this.lock || index <= this.lastIndex) { return []; }

        if (roll < 0 || roll > 10) { throw new Error('Pins must have a value from 0 to 10'); }

        this.lastIndex = index;
        const nextIndex: number = index + 1;
        const nextRoll = this.rolls[nextIndex];

        if (lastRollValue !== undefined) {
            // tenth frame
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
        const secondThrowTenFrameExists: boolean = this.frames[9] && this.frames[9][1] !== undefined;
        const onlastsRoll: boolean = this.rolls.length - 2 <= index;
        const onlastRoll: boolean = (this.rolls.length - 2 === index) || (this.rolls.length - 1 === index);
        const onlastRollTenFrame: boolean = this.rolls.length - 3 <= index && secondThrowTenFrameExists;
        const onTenFrame: boolean = tenFrameExists && (onlastsRoll || onlastRollTenFrame);
        const onSecondThrowOfTenFrame: boolean = onlastRoll && (secondThrowTenFrameExists || tenFrameExists);

        const lastRoll: boolean = nextRoll === undefined;

        if (nextRollValue === undefined) {
            // first roll of a frame
            const strike: boolean = roll === 10;

            if (strike && !onTenFrame || lastRoll) {
                return [{
                    roll,
                    index,
                }];
            }

            return this.recursiveFrame(roll, nextIndex, nextRoll);
        }

        const err = 'Pin count exceeds pins on the lane';

        if (onSecondThrowOfTenFrame) {
            const spareOrStrike: boolean = roll + nextRollValue >= 10;
            if (spareOrStrike && !lastRoll) {
                return this.recursiveFrame(roll, nextIndex, nextRollValue, nextRoll);
            } else if (!spareOrStrike) {
                this.lock = true;
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
