<template>
  <div class="home">
    <p class="message" v-if="this.game.lock">The game's over! Click <span @click="resetGame">here</span> to restart.</p>
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
    <div class="game">
      <div class="pins">
        <div :class="['pin', `pin_${pin}`]" v-for="pin in pins" :key="pin"/>
      </div>
      <div class="arrow" :style="{transform: `rotate(${angle}deg)`}" />
      <button @click="stop">Throw</button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Bowling from '@/services/bowling';

@Component({
  components: {
  },
})
export default class Home extends Vue {
  public angle: number = 0;

  private go: boolean = true;
  private interval: number = 0;
  private game: any = new Bowling();
  private pins: number = 10;
  private timeout: number = .1;
  private throwStreak: number = 0;
  private lock: boolean = false;

  public start() {
    if (this.game.lock) {
      this.lock = true;
      return;
    }

    this.lock = false;
    this.interval = setInterval(() => {
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
    if (this.lock) { return; }
    clearInterval(this.interval);
    const pinsOut = Math.round((Math.sin((this.angle + 90) * Math.PI / 180) * this.pins) - .45);
    this.game.roll(pinsOut);
    this.pins = this.pins - pinsOut;
    this.throwStreak++;
    if (this.throwStreak >= 2 || pinsOut === 10) {
      this.lock = true;
      this.resetPins(() => {
        if (this.game.lock) {
          this.lock = true;
          return;
        }
        return this.start();
      });
    } else {
      return this.start();
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

  private resetGame() {
    this.resetPins(() => {
      this.game = new Bowling();
      this.lock = false;
      this.start();
    });
  }

  private resetPins(callback: () => void) {
    if (this.pins < 10) {
      setTimeout(() => {
        this.throwStreak = 0;
        this.pins++;
        return this.resetPins(callback);
      }, 200);
    } else {
      callback();
    }
  }

  private mounted() {
    this.start();
  }
}
</script>

<style lang="sass" scoped>
  .message
    color: red
    span
      text-decoration: underline
      cursor: pointer

  .frames
    display: flex
    margin: 20px auto
    width: fit-content

    .frame-box
      display: flex
      flex-flow: nowrap column
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

    .pins
      width: 332px
      height: 213px
      border: 1px solid gray
      border-radius: 5px
      display: grid
      grid-template-columns: 50px 50px 50px 50px 50px 50px 50px 50px
      grid-template-rows: 60px 60px 60px 60px
      grid-template-areas: "A A B B C C D D" ". E E F F G G ." ". . H H I I . ." ". . . J J . . ."
      .pin
        width: 30px
        height: 30px
        background-color: black
        border-radius: 50%
        border: 1px solid gray
        &_1
          grid-area: A

        &_2
          grid-area: B

        &_3
          grid-area: C

        &_4
          grid-area: D

        &_5
          grid-area: E

        &_6
          grid-area: F

        &_7
          grid-area: G

        &_8
          grid-area: H

        &_9
          grid-area: I

        &_10
          grid-area: J


    .arrow
      margin-top: 225px
      margin-bottom: 15px
      width: 50px
      height: 150px
      background: #49648e
      position: relative
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

</style>
