<template>
  <div class="home">
    <div class="bkg_logo">
      <img alt="logo" src="../assets/logo.png" width="150">
    </div>
    <div class="game">
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
  private game: any;
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
      this.throwStreak = 0;
      this.pins = 10;
    }

    console.log('frames', this.game.showFrames());
    console.log('score', this.game.score());
    this.start();
  }

  private mounted() {
    this.game = new Bowling();
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

  .game
    margin-top: 200px
    display: flex
    justify-content: center
    .arrow
      width: 50px
      height: 200px
      background: blue
      position: relative
      &:after
        content: ''
        position: absolute
        top: -99px
        left: -25px
        width: 0
        height: 0
        border-left: 50px solid transparent
        border-right: 50px solid transparent
        border-bottom: 100px solid blue

</style>
