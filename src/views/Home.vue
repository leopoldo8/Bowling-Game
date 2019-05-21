<template>
  <div class="home">
    <div class="game-info">
      <p class="message" v-if="this.game.lock">The game's over! Click <span @click="restartGame">here</span> to restart.</p>
      <p>Total score: {{game.score()}}</p>
      <div class="frames">
        <div class="frame-box" v-for="(frame, index) in game.frames" :key="frame[0].index">
          <p>Frame {{index+1}}</p>
          <div class="frame">
            <div class="rolls">
              <div class="roll" v-for="roll in frame" :key="roll.index">{{rollValue(frame, roll)}}</div>
            </div>
          <p>{{game.values[index]}}</p>
          </div>
        </div>
      </div>
    </div>
    <div class="game">
      <div class="pins">
        <div v-for="(pin, index) in pins" :key="index" :class="`_${index+1}`">
          <div v-if="pin" :class="['pin', `pin_${index+1}`]" :ref="`pin_${index}`" />
        </div>
      </div>
      <div>
        <div class="arrow" :style="{transform: `rotate(${angle}deg)`}" ref="arrow">
          <div class="line" ref="line" />
        </div>
        <button @click="stop">Throw</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Bowling from '@/services/bowling';
import Pins from '@/models/pins';

@Component({
  components: {
  },
})
export default class Home extends Vue {
  public angle: number = 0;

  private go: boolean = true;
  private interval: number = 0;
  private game: any = new Bowling();
  private pins: Pins | number = 11;
  private timeout: number = 10;
  private throwStreak: number = 0;
  private lock: boolean = false;
  private ballWidth: number = 100;
  private lineLeft: number = 0;

  public start() {
    if (this.game.lock) {
      this.lock = true;
      return;
    }

    const arrowElement = this.$refs.arrow as HTMLElement;
    const lineElement = this.$refs.line as HTMLElement;
    const offsetLeftLine = arrowElement.offsetLeft + lineElement.offsetLeft;

    this.lock = false;
    this.interval = setInterval(() => {
      this.lineLeft = offsetLeftLine + Math.cos((this.angle + 90) * Math.PI / 180) * -lineElement.offsetHeight;
      if (this.angle < 90 && this.go) {
        this.angle++;
      } else if (this.angle > -90) {
        this.angle--;
        this.go = false;
      } else {
        this.go = true;
      }
    }, this.timeout);
  }

  public stop() {
    if (this.lock) { return; } else if (typeof this.pins === 'object') {
      clearInterval(this.interval);
      let pinsOut = 0;
      this.pins.forEach((pin, index) => {
        if ((pin.start <= this.lineLeft + this.ballWidth) && (this.lineLeft - this.ballWidth <= pin.end)) {
          pinsOut++;
          const PinDirections: number[] = this.pinDirections(index + 1);
          const direction: number = Math.floor(Math.random() * (PinDirections.length + 1));
          const secondPinOut: number = PinDirections[direction - 1] - 1;
          if (PinDirections && direction && this.pins[secondPinOut]) {
            pinsOut++;
            delete this.pins[secondPinOut];
          }
          delete this.pins[index];
        }
      });
      this.game.roll(pinsOut);
      this.throwStreak++;

      if (this.game.lock) {
        this.lock = true;
      } else if (this.throwStreak >= 2 || pinsOut === 10) {
        this.resetGame();
      } else {
        return this.start();
      }
    }
  }

  private rollValue(frame: Array<{roll: number, index: number}>, roll: {roll: number, index: number}) {
    const strike: boolean = roll.roll === 10;
    const square: boolean = frame[1] && frame[1].roll + frame[0].roll === 10 && frame[1].index === roll.index;

    const onThirdThrow: boolean = frame[2] && frame[2].index === roll.index;
    const squareOnTenFrame: boolean = onThirdThrow && frame[0].roll === 10 && frame[1].roll + frame[2].roll === 10;

    if (strike) {
      return 'X';
    } else if (squareOnTenFrame || square) {
      return '/';
    }

    return roll.roll;
  }

  private pinDirections(pin: number) {
    switch (pin) {
      default: return [];

      case 1:
        return [2];
      case 2:
        return [1, 3];
      case 3:
        return [2, 4];
      case 4:
        return [3];
      case 5:
        return [1, 2, 6];
      case 6:
        return [2, 3, 5, 7];
      case 7:
        return [3, 4, 6];
      case 8:
        return [5, 6, 9];
      case 9:
        return [6, 7, 8];
      case 10:
        return [8, 9];
    }
  }

  private restartGame() {
    this.game = new Bowling();
    this.lock = false;
    this.resetGame();
  }

  private resetGame() {
    this.lock = true;
    setTimeout(() => {
      this.pins = 0;
      this.throwStreak = 0;
      this.resetPins(this.init);
    }, 600);
  }

  private async resetPins(callback: () => void) {
    if (this.pins <= 10) {
      setTimeout(() => {
        if (typeof this.pins === 'number') { this.pins++; }
        return this.resetPins(callback);
      }, 200);
    } else {
      callback();
    }
  }

  private async mapPinsArray() {
    if (typeof this.pins !== 'number') { return; }
    const pins = [];
    for (let i = 0; i < this.pins; i++) {
      const el = this.$refs[`pin_${i}`] as HTMLElement;
      if (!el[0]) { return; }
      const start: number = el[0].offsetLeft;
      const end: number = el[0].offsetLeft + el[0].offsetWidth;
      const val: number = i;

      pins.push({
        el,
        start,
        end,
        val,
      });

      if (i + 2 === this.pins) {
        this.pins = pins;
      }
    }
  }

  private async init() {
    await this.mapPinsArray();
    return this.start();
  }

  private mounted() {
    this.init();
  }
}
</script>

<style lang="sass" scoped>
  .home
    height: calc(100% - 110px)
    position: relative

    .game-info
      position: absolute
      left: 20px
      top: 0
      .message
        color: red
        margin-bottom: 30px
        span
          text-decoration: underline
          cursor: pointer

      .frames
        display: flex
        margin: 20px auto
        width: 168px
        flex-flow: row wrap

        .frame-box
          display: flex
          flex-flow: nowrap column
          margin: 10px 0

          .frame
            $border: 1px solid black
            margin: 0 10px
            width: 62px
            height: 50px
            border: $border
            display: flex
            flex-flow: nowrap column

            .rolls
              display: flex
              flex-flow: nowrap row
              justify-content: flex-end
              width: 100%
              .roll
                width: 20px
                height: 20px
                display: flex
                justify-content: center
                align-items: center
                border-bottom: $border
                border-left: $border

            p
              margin: 0
              margin-top: 5px

    .game
      display: flex
      justify-content: space-between
      align-items: center
      flex-flow: nowrap column
      margin-top: 20px
      overflow: hidden
      height: 100%

      .pins
        width: 342px
        height: 223px
        border: 1px solid gray
        border-radius: 5px
        display: grid
        grid-template-columns: 50px 50px 50px 50px 50px 50px 50px 50px
        grid-template-rows: 60px 60px 60px 60px
        grid-template-areas: "A A B B C C D D" ". E E F F G G ." ". . H H I I . ." ". . . J J . . ."
        div
          &._1
            grid-area: A

          &._2
            grid-area: B

          &._3
            grid-area: C

          &._4
            grid-area: D

          &._5
            grid-area: E

          &._6
            grid-area: F

          &._7
            grid-area: G

          &._8
            grid-area: H

          &._9
            grid-area: I

          &._10
            grid-area: J

          .pin
            width: 40px
            height: 40px
            background-color: black
            border-radius: 50%
            border: 1px solid gray

      .icon-settings
        width: 16px
        height: 16px
        font-size: 16px

      .arrow
        margin-top: 225px
        margin-bottom: 15px
        width: 50px
        height: 150px
        background: #49648e
        position: relative
        z-index: 1
        &:after
          content: ''
          position: absolute
          top: -89px
          left: -20px
          width: 0
          height: 0
          border-left: 45px solid transparent
          border-right: 45px solid transparent
          border-bottom: 90px solid #49648e

        .line
          width: 1px
          position: absolute
          bottom: 0
          left: 50%
          height: 600px
          z-index: -1

      .lineLeft
        width: 1px
        height: 646px
        position: absolute
        background: black
        left: 0
        bottom: 0

</style>
