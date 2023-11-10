<template>
  <div
    v-if="modalState"
    class="modal-container"
  >
    <div class="controls">
      <div class="title">
        Scan Barcode...
      </div>
      <div v-if="loaded">
        <div
          :class="{
            'disabled': videoDevices?.devices?.length < 2,
          }"
          @click="switchInputDevice"
        >
          <SvgIcon
            type="mdi"
            :path="videoDevices?.devices?.length < 2 ? icons.mdiCamera : icons.mdiCameraSwitch"
          />
        </div>
      </div>
      <div v-if="loaded">
        <div
          :class="{
            'disabled': !hasAutofocus,
            'activated': !autofocus && hasFocusDistance,
          }"
          @click="autofocus = !autofocus"
        >
          <SvgIcon
            type="mdi"
            :path="hasAutofocus && autofocus ? icons.mdiFocusAuto : icons.mdiImageFilterCenterFocusWeak"
          />
        </div>
      </div>
      <div v-if="loaded">
        <div
          :class="{
            'disabled': !isAndroidChrome,
            'activated': landscape,
          }"
          @click="landscape = !landscape"
        >
          <SvgIcon
            type="mdi"
            :path="landscape ? icons.mdiPhoneRotatePortrait : icons.mdiPhoneRotateLandscape"
          />
        </div>
      </div>
      <div v-if="loaded">
        <div
          :class="{
            'disabled': !hasTorch,
            'activated': hasTorch && torch,
          }"
          @click="torch = !torch"
        >
          <SvgIcon
            type="mdi"
            :path="torch ? icons.mdiLightbulbOn : icons.mdiLightbulbOutline"
          />
        </div>
      </div>
      <div>
        <div
          class="close"
          @click="modalClose"
        >
          <SvgIcon
            type="mdi"
            :path="icons.mdiCloseThick"
          />
        </div>
      </div>
    </div>
    <div class="barcode-container">
      <StreamBarcodeReader
        v-model:videoDevices="videoDevices"
        v-model:hasFocusDistance="hasFocusDistance"
        v-model:hasAutofocus="hasAutofocus"
        v-model:hasTorch="hasTorch"
        v-model:hasZoom="hasZoom"
        v-model:cameraDetails="cameraDetails"
        :landscape="landscape"
        :torch="torch"
        :zoom="Number(zoom)"
        :autofocus="autofocus"
        :focus-distance="Number(focusDistance)"
        :device-index="deviceIndex"
        :ms-between-decoding="500"
        @decode="onDecode"
        @loaded="onLoaded"
        @result="onResult"
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
          :max="Math.min(hasFocusDistance.max, 1) || 1"
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
  </div>
</template>

<script>
// This is here for testing purposes
// import StreamBarcodeReader from './StreamBarcodeReader.vue'
import { StreamBarcodeReader } from '@teckel/vue-barcode-reader'
import SvgIcon from '@jamescoyle/vue-icon'
import {
  mdiLightbulbOn,
  mdiLightbulbOutline,
  mdiPhoneRotatePortrait,
  mdiPhoneRotateLandscape,
  mdiFocusAuto,
  mdiImageFilterCenterFocusWeak,
  mdiCloseThick,
  mdiCameraSwitch,
  mdiCamera,
} from '@mdi/js'

const barcodeScannedAudio = new Audio('./assets/barcode-scanned.mp3')

const initialState = {
  loaded: false,
  modalState: false,
  torch: false,
  zoom: 1,
  autofocus: true,
  focusDistance: 0,
  landscape: false,
  hasTorch: false,
  hasZoom: false,
  hasAutofocus: false,
  hasFocusDistance: false,
  videoDevices: {},
  deviceIndex: null,
  debounce: false,
  debounceTimeout: null,
  cameraDetails: {},
  isMobile: navigator?.userAgentData?.mobile || navigator?.platform === 'iPad' || navigator?.platform === 'iPhone',
  isAndroid: navigator?.userAgentData?.platform === 'Android',
  isChrome: navigator?.userAgentData?.brands.findIndex(brand => brand.brand === 'Google Chrome' || brand.brand === 'Chromium') !== -1,
  icons: {
    mdiLightbulbOn,
    mdiLightbulbOutline,
    mdiPhoneRotatePortrait,
    mdiPhoneRotateLandscape,
    mdiFocusAuto,
    mdiImageFilterCenterFocusWeak,
    mdiCloseThick,
    mdiCameraSwitch,
    mdiCamera,
  },
}

export default {
  components: { StreamBarcodeReader, SvgIcon },
  emits: ['update:modelValue', 'update:openModal', 'update:cameraDetails', 'update:rawResult'],
  props: {
    modelValue: {
      type: [String, Number],
      default: null,
    },
    openModal: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      ...initialState,
    }
  },
  computed: {
    isAndroidChrome() {
      return this.isMobile && this.isAndroid && this.isChrome
    }
  },
  watch: {
    openModal() {
      this.modalState = this.openModal
    },
    hasAutofocus() {
      this.autofocus = this.hasAutofocus
    },
    focusDistance() {
      this.sliderMovement()
    },
    zoom() {
      this.sliderMovement()
    },
    'videoDevices.selectedIndex': {
      handler() {
        if (this.loaded) {
          this.deviceIndex = this.videoDevices?.selectedIndex
        }
      }
    },
  },
  beforeUnmount() {
    this.modalClose()
  },
  mounted() {
  },
  methods: {
    onLoaded() {
      this.loaded = true
      if (!this.hasAutofocus) {
        this.autofocus = false
      }
      console.log('loaded')
    },
    onDecode(decodedText) {
      barcodeScannedAudio.play()
      console.log('Barcode scanned:', decodedText)
      this.$emit('update:modelValue', decodedText)
      this.modalClose()
    },
    onResult(result) {
      console.log('Raw Result:', result)
      this.$emit('update:rawResult', JSON.parse(JSON.stringify(result)))
    },
    switchInputDevice() {
      const length = this.videoDevices?.devices?.length
      if (this.deviceIndex >= 0 && length > 1) {
        this.loaded = false
        this.deviceIndex = this.deviceIndex + 1 >= length ? 0 : this.deviceIndex + 1
      }
    },
    sliderMovement() {
      if (!this.debounce) {
        this.debounce = true
        window.navigator?.vibrate?.(10)
        clearTimeout(this.debounceTimeout)
        this.debounceTimeout = setTimeout(() => {
          this.debounce = false
        }, 10)
      }
    },
    modalClose() {
      this.$emit('update:cameraDetails', this.cameraDetails)
      Object.assign(this.$data, initialState)
      this.$emit('update:openModal', false)
    },
  },
}
</script>

<style>
.modal-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: black;
}

.controls {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 50px;
  padding: 0 5px 0 10px;
}
.controls .title {
  font-size: 17px;
  flex-basis: 90%;
  color: white;
  text-align: left;
  white-space: nowrap;
  overflow-x: hidden;
  text-overflow: ellipsis;
}
.controls > div:not(.title) {
  flex-basis: 50px;
  min-width: 50px;
}
.controls > div:not(.title) > div {
  position: relative;
  width: 40px;
  height: 40px;
  padding-top: 8px;
  margin: auto;
  border-radius: 50%;
  color: #CCC;
  background-color: grey;
  cursor: pointer;
}
.controls > div > div.activated {
  color: white;
  background-color: royalblue;
}
.controls > div > div.disabled {
  pointer-events: none;
  filter: blur(1px) brightness(0.66);
}
.controls > div > div.close {
  color: red;
  background-color: transparent;
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
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

video {
  max-width: 1000px !important;
}

.zoom-container {
  position: absolute;
  z-index: 3;
  top: 50px;
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
  top: 50px;
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
</style>
