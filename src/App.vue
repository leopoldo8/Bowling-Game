<template>
  <div id="app">
    <div id="nav">
      <router-link to="/">Game</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="sass">
#app
  font-family: 'Avenir', Helvetica, Arial, sans-serif
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale
  text-align: center
  color: #2c3e50
  width: 100%
  height: 100%

#nav
  padding: 30px
  a
    font-weight: bold
    color: #2c3e50
    &.router-link-exact-active
      color: #163184

//icomoon
@font-face
  font-family: 'icomoon'
  src:  url('assets/fonts/icomoon.eot?687l6a')
  src:  url('assets/fonts/icomoon.eot?687l6a#iefix') format('embedded-opentype'), url('assets/fonts/icomoon.ttf?687l6a') format('truetype'), url('assets/fonts/icomoon.woff?687l6a') format('woff'), url('assets/fonts/icomoon.svg?687l6a#icomoon') format('svg')
  font-weight: normal
  font-style: normal


[class^="icon-"], [class*=" icon-"]
  /* use !important to prevent issues with browser extensions that change fonts */
  font-family: 'icomoon' !important
  speak: none
  font-style: normal
  font-weight: normal
  font-variant: normal
  text-transform: none
  line-height: 1

  /* Better Font Rendering =========== */
  -webkit-font-smoothing: antialiased
  -moz-osx-font-smoothing: grayscale


.icon-settings:before
  content: "\e900"



//reset
html, body, div, span, applet, object, iframe, h1, h2, h3, h4, h5, h6, p, blockquote, pre, a, abbr, acronym, address, big, cite, code, del, dfn, em, img, ins, kbd, q, s, samp, small, strike, strong, sub, sup, tt, var, b, u, i, center, dl, dt, dd, ol, ul, li, fieldset, form, label, legend, table, caption, tbody, tfoot, thead, tr, th, td, article, aside, canvas, details, embed, figure, figcaption, footer, header, hgroup, menu, nav, output, ruby, section, summary, time, mark, audio, video
  margin: 0
  padding: 0
  border: 0
  font-size: 100%
  font: inherit
  vertical-align: baseline

/* HTML5 display-role reset for older browsers */
article, aside, details, figcaption, figure, footer, header, hgroup, menu, nav, section
  display: block

body
  line-height: 1
  width: 100vw
  height: 100vh

ol, ul
  list-style: none

blockquote, q
  quotes: none

blockquote:before, blockquote:after, q:before, q:after
  content: ''
  content: none

table
  border-collapse: collapse
  border-spacing: 0

</style>
