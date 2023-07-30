<template>
  <div v-if="!landscape">
    <h1>Vue Barcode Reader</h1>
    <h3>Use mobile device for all features</h3>
  </div>
  <div class="container">
    <div class="controls">
      <div class="title">
        Scan Barcode...
      </div>
      <div v-if="loaded">
        <div :class="{
          'disabled': !hasAutofocus,
          'activated': hasAutofocus && autofocus,
        }">
          <SvgIcon
            type="mdi"
            :path="!hasAutofocus || autofocus ? icons.mdiFocusAuto : icons.mdiBlur"
            @click="autofocus = hasAutofocus ? !autofocus : autofocus"
          />
        </div>
      </div>
      <div v-if="loaded">
        <div :class="{
          'activated': landscape,
        }">
          <SvgIcon
            type="mdi"
            :path="landscape ? icons.mdiPhoneRotatePortrait : icons.mdiPhoneRotateLandscape"
            @click="landscape = !landscape"
          />
        </div>
      </div>
      <div v-if="loaded">
        <div :class="{
          'disabled': !hasTorch,
          'activated': torch,
        }">
          <SvgIcon
            type="mdi"
            :path="torch ? icons.mdiLightbulbOn : icons.mdiLightbulbOutline"
            @click="torch = hasTorch ? !torch : torch"
          />
        </div>
      </div>
    </div>
    <div class="barcode-container" :class="{ 'scanning': scanning }">
      <StreamBarcodeReader
        v-model:hasFocusDistance="hasFocusDistance"
        v-model:hasAutofocus="hasAutofocus"
        v-model:hasTorch="hasTorch"
        v-model:hasZoom="hasZoom"
        :landscape="landscape"
        :torch="torch"
        :zoom="Number(zoom)"
        :autofocus="autofocus"
        :focus-distance="Number(focusDistance)"
        @decode="onDecode"
        @loaded="onLoaded"
      />
      <div
        v-if="!autofocus && hasFocusDistance && loaded"
        class="focus-container"
      >
        <div>Focus</div>
        <input
          v-model="focusDistance"
          type="range"
          :min="hasFocusDistance.min || 0"
          :max="Math.min(hasFocusDistance.max, 1)"
          :step="hasFocusDistance.step || 0.1"
        />
      </div>

      <div
        v-if="hasZoom && loaded"
        class="zoom-container"
      >
        <div>Zoom</div>
        <input
          v-model="zoom"
          type="range"
          :min="hasZoom.min || 1"
          :max="hasZoom.max || 2"
          :step="hasZoom.step || 0.1"
        />
      </div>
    </div>
    <div class="decoded">
      Decoded barcode: <b>{{ decodedText }}</b>
    </div>
  </div>

  <div v-if="!landscape">
    <p class="information">
      <strong>Github: </strong>
      <a href="https://github.com/teckel12/vue-barcode-reader" target="_blank">teckel12/vue-barcode-reader</a>
    </p>
    <p>
      <strong>NPM: </strong>
      <a href="https://www.npmjs.com/package/@teckel/vue-barcode-reader" target="_blank">@teckel/vue-barcode-reader</a>
    </p>
  </div>
</template>

<script>
import { StreamBarcodeReader } from "@teckel/vue-barcode-reader"
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiLightbulbOn,
  mdiLightbulbOutline,
  mdiPhoneRotatePortrait,
  mdiPhoneRotateLandscape,
  mdiFocusAuto,
  mdiBlur,
} from '@mdi/js'

const barcodeScannedAudio = new Audio('./assets/barcode-scanned.mp3')

export default {
  components: { StreamBarcodeReader, SvgIcon },
  data() {
    return {
      loaded: false,
      decodedText: '[Scan Barcode...]',
      torch: false,
      zoom: 1,
      autofocus: true,
      focusDistance: 0,
      landscape: false,
      hasTorch: false,
      hasZoom: false,
      hasAutofocus: false,
      hasFocusDistance: false,
      scanning: false,
      scanPause: false,
      scanningTimeout: null,
      scanPauseTimeout: null,
      icons: {
        mdiLightbulbOn,
        mdiLightbulbOutline,
        mdiPhoneRotatePortrait,
        mdiPhoneRotateLandscape,
        mdiFocusAuto,
        mdiBlur,
      },
    }
  },
  methods: {
    onLoaded() {
      this.loaded = true
      console.log('loaded')
    },
    onDecode(decodedText) {
      if (this.decodedText === decodedText && this.scanPause) return
      this.decodedText = decodedText
      barcodeScannedAudio.play()
      this.scanning = true
      this.scanPause = true
      console.log('Barcode scanned:', decodedText)
      clearTimeout(this.scanningTimeout)
      this.scanningTimeout = setTimeout(() => {
        this.scanning = false
      }, 100)
      clearTimeout(this.scanPauseTimeout)
      this.scanPauseTimeout = setTimeout(() => {
        this.scanPause = false
      }, 1000)
    },
  },
}
</script>

<style scoped>
.container {
  max-height: 100vh;
  background-color: black;
}

.controls {
  background-color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 10px 0 20px;
}
.controls .title {
  font-size: 17px;
  flex-basis: 80%;
  color: white;
  text-align: left;
  white-space: nowrap;
}
.controls > div {
  flex-basis: 60px;
}
.controls > div > div {
  position: relative;
  width: 40px;
  height: 40px;
  padding-top: 8px;
  margin: auto;
  border-radius: 50%;
  color: #CCC;
  background-color: grey;
}
.controls > div > div.activated {
  color: white;
  background-color: royalblue;
}
.controls > div > div.disabled {
  filter: blur(1px) opacity(0.75);
}
.controls > div > div.disabled:after {
  content: '';
  position: absolute;
  top: 15px;
  left: 15px;
  width: 32px;
  height: 32px;
  border-top: 1px solid white;
  transform: rotate(-45deg);
}

.barcode-container {
  position: relative;
  max-height: calc(100vh - 80px);
  overflow: hidden;
}
.barcode-container.scanning {
  filter: brightness(0.25);
}

.zoom-container {
  position: absolute;
  z-index: 3;
  top: 0;
  bottom: 0;
  right: 0;
  width: 55px;
  color: white;
}
.zoom-container > div {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  text-align: center;
}
.zoom-container input[type="range"] {
  transform: rotate(270deg);
  touch-action: none;
  width: 200px;
  height: 24px;
  position: absolute;
  right: -75px;
  top: 120px;
}

.focus-container {
  position: absolute;
  z-index: 3;
  top: 0;
  bottom: 0;
  left: 0;
  width: 55px;
  color: white;
}
.focus-container > div {
  position: absolute;
  top: 10px;
  left: 0;
  right: 0;
  text-align: center;
}
.focus-container input[type="range"] {
  transform: rotate(270deg);
  touch-action: none;
  width: 200px;
  height: 24px;
  position: absolute;
  left: -75px;
  top: 120px;
}

.decoded {
  font-size: 17px;
  white-space: nowrap;
  color: white;
  background-color: black;
  align-items: center;
  height: 30px;
  line-height: 30px;
  padding: 0 20px;
}
a {
  color: #42b983;
}
.information {
  margin-top: 50px;
}
</style>
