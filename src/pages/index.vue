<template>
  <div class="p-4 flex flex-col h-full">
    <div class="text-center">
      Scanning QR code
    </div>
    <div class="flex flex-1 items-center">
      <canvas id="canvas" ref="canvas" width="320" height="320" />
    </div>
    <video id="video" ref="video" autoplay muted />
    <div class="mb-4">
      Scanned code:
    </div>
    <component
      :is="isQrCodeLink ? 'a' : 'div'"
      :class="isQrCodeLink ? 'link' : ''"
      :href="qrCodeData"
    >
      <b>{{ qrCodeData ?? 'N/A' }}</b>
    </component>
    <button class="btn mt-5" @click="startScanning">
      {{ isScanning ? 'Stop scanning' : 'Start scanning' }}
    </button>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { get, set, templateRef, useRafFn } from '@vueuse/core'
import jsQR, { QRCode } from 'jsqr'

const userMediaConstraints = {
  video: {
    width: 320,
    height: 320,
    frameRate: 30,
    resizeMode: 'crop-and-scale',
    facingMode: 'environment',
  },
}

export default {
  setup() {
    const camOut = templateRef<HTMLVideoElement>('video')
    const canvasRef = templateRef<HTMLCanvasElement>('canvas')

    const streamRef = ref<MediaStream | null>(null)
    const qrCodeRef = ref<QRCode | null>(null)

    const { pause, resume } = useRafFn(() => {
      const ctx = get(canvasRef)?.getContext('2d')
      const { height, width } = get(canvasRef) ?? {}

      if (ctx) {
        ctx.drawImage(
          camOut.value,
          0,
          0,
          width,
          height,
        )

        const imageData = ctx.getImageData(0, 0, width, height)

        const qrCode = jsQR(imageData.data, width, height, {
          inversionAttempts: 'attemptBoth',
        })

        set(qrCodeRef, qrCode)
      }
    }, {
      immediate: false,
    })

    const isScanning = computed(() => Boolean(get(streamRef)))

    const deactivateStream = () => {
      if (camOut.value) {
        camOut.value.srcObject = null
        set(streamRef, null)
      }
    }

    const qrCodeData = computed(
      () => get(qrCodeRef)?.data ?? null,
    )

    watch(
      qrCodeData,
      (qrCodeDataValue) => {
        if (qrCodeDataValue)
          deactivateStream()
      },
      {
        immediate: true,
      },
    )

    watch(
      isScanning,
      (isScanningValue) => {
        if (isScanningValue) {
          resume()
        }
        else {
          pause()
          canvasRef.value?.getContext('2d')?.clearRect(
            0,
            0,
            canvasRef.value?.width,
            canvasRef.value?.height,
          )
        }
      },
      {
        immediate: true,
      },
    )

    const startScanning = () => {
      if (get(isScanning)) {
        deactivateStream()
      }
      else {
        navigator.mediaDevices.getUserMedia(userMediaConstraints).then(
          (stream) => {
            camOut.value.srcObject = stream
            set(streamRef, stream)
          },
        )
      }
    }

    const isQrCodeLink = computed(
      () => get(qrCodeData)?.startsWith('http'),
    )

    return {
      isScanning,
      isQrCodeLink,
      startScanning,
      qrCodeData,
    }
  },
}
</script>

<style scoped>
#video {
  display: none;
}

#canvas {
  @apply w-full rounded border border-black;
}
</style>
