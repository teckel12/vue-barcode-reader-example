<template>
  <h1>Vue Barcode Reader</h1>
  <h3>Use mobile device for all features</h3>
  <div class="input-box">
    Barcode:
    <div @click="barcodeModalState = true">
      <b>{{ barcode }}</b>
      <SvgIcon
        type="mdi"
        :path="icons.mdiBarcodeScan"
      />
    </div>
  </div>
  <div>
    <p class="information">
      <strong>Github: </strong>
      <a href="https://github.com/teckel12/vue-barcode-reader" target="_blank">teckel12/vue-barcode-reader</a>
    </p>
    <p>
      <strong>NPM: </strong>
      <a href="https://www.npmjs.com/package/@teckel/vue-barcode-reader" target="_blank">@teckel/vue-barcode-reader</a>
    </p>
  </div>
  <CameraScanner
    v-model="barcode"
    v-model:open-modal="barcodeModalState"
  />
</template>

<script>
import CameraScanner from './components/CameraScanner.vue'
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiBarcodeScan } from '@mdi/js'

const barcodeScannedAudio = new Audio('./assets/barcode-scanned.mp3')

export default {
  components: { CameraScanner, SvgIcon },
  data() {
    return {
      barcode: 'Click to scan barcode',
      barcodeModalState: false,
      icons: {
        mdiBarcodeScan,
      },
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  padding: 0;
  background-color: #f6f6f6;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.input-box {
  margin-top: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}
.input-box div {
  position: relative;
  border: 1px solid #ccc;
  background-color: #fff;
  border-radius: 4px;
  line-height: 35px;
  margin-left: 5px;
  padding: 0 35px 0 5px;
  cursor: pointer;
}
.input-box div b {
  display: inline-block;
  width: 200px;
  max-width: 60vw;
  text-align: left;
}
.input-box div svg {
  position: absolute;
  top: 4px;
  bottom: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  margin: auto 0;
  color: #666;
}
.information {
  margin-top: 50px;
}
a {
  color: #42b983;
}
</style>
