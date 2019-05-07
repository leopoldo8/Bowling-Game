<template>
  <div class="home">
    <div class="bkg_logo">
      <img alt="logo" src="../assets/logo.png" width="150">
    </div>
    <div class="frames">
      <div class="frame" v-for="frame in game.frames" :key="frame[0].index">
        <div class="roll" v-for="roll in frame" :key="roll.index">{{roll.roll}}</div>
      </div>
      <div style="margin-left: 20px">Score: {{game.score()}}</div>
    </div>
    <div class="game">
      <div class="pins">
        <div :class="['pin', `pin_${pin}`]" v-for="pin in pins" :key="pin"/>
      </div>
      <div class="arrow" :style="{transform: `rotate(${angle}deg)`}" />
    </div>
    <button @click="stop">Throw</button>
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
  private timeout: number = 10;
  private throwStreak: number = 0;

  public start() {
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
    clearInterval(this.interval);
    const pinsOut = Math.round(Math.sin((this.angle + 90) * Math.PI / 180) * this.pins);
    this.game.roll(pinsOut);
    this.pins = this.pins - pinsOut;
    this.throwStreak++;
    if (this.throwStreak >= 2 || pinsOut === 10) {
      this.resetGame(() => {
        return this.start();
      })
    } else {
      return this.start();
    }
  }

  private resetGame(callback: () => void) {
    if (this.pins < 10) {
      setTimeout(() => {
        this.throwStreak = 0;
        this.pins++;
        return this.resetGame(callback);
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
  .bkg_logo
    width: 150px
    height: 150px
    border-radius: 100%
    background-color: #49648e
    margin: 0 auto
    display: flex
    justify-content: center
    align-items: center

  .frames
    display: flex
    margin: 20px auto
    width: fit-content
    .frame
      margin: 0 10px
      .roll
        width: 20px
        height: 20px
        border: 1px solid black

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
      margin-top: 200px
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
