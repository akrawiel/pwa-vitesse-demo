<template>
  <nav-header>
    Scan QR
  </nav-header>
  <div class="p-4 flex flex-col h-full">
    <div class="canvasContainer">
      <canvas ref="canvas" width="320" height="320" />
      <div v-if="!isScanning && !scanningStarted" class="canvasOverlay">
        <div><icon-tap class="inline-block mr-2" />Press "Start scanning"</div>
        <div><icon-camera class="inline-block mr-2" />Enable camera access</div>
      </div>
    </div>
    <div class="flex-1" />
    <video ref="video" autoplay muted />
    <div class="mb-4">
      Scanned code:
    </div>
    <component
      :is="isQrCodeLink ? 'a' : 'div'"
      :class="isQrCodeLink ? 'link' : ''"
      class="leading-normal"
      :href="qrCodeData"
    >
      <b>{{ qrCodeData ?? '-' }}</b>
    </component>
    <button class="btn mt-5" @click="toggleScanning">
      {{ isScanning ? 'Stop scanning' : 'Start scanning' }}
    </button>
  </div>
</template>

<script lang="ts">
import IconCamera from '/@vite-icons/mdi/camera.vue'
import IconTap from '/@vite-icons/mdi/gesture-tap-button.vue'

import QrSetup from './qr.setup'

export default {
  components: {
    IconCamera,
    IconTap,
  },

  setup: QrSetup,
}
</script>

<style scoped>
video {
  display: none;
}

canvas {
  @apply rounded border border-black dark:border-white w-full h-full;
}

.canvasContainer {
  @apply flex flex-1 justify-center items-center relative w-full;
  position: fixed;
  left: 0;
  top: calc(50% - 50vw);
  width: 100vw;
  height: 100vw;
}

.canvasOverlay {
  @apply z-10 text-center absolute p-4 w-max border border-black dark:border-white rounded;

  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
