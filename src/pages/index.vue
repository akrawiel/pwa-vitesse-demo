<template>
  <div class="p-4">
    <canvas id="canvas" ref="canvas" width="320" height="240" />
    <button class="bg-green-400 text-white px-3 py-2 rounded" @click="startScanning">
      Scan
    </button>
    <video id="video" ref="camOut" autoplay muted />
    <div>Code: {{ qrCodeData ?? 'null' }}</div>
  </div>
</template>

<script lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { get, set, templateRef, useRafFn } from '@vueuse/core'
import jsQR, { QRCode } from 'jsqr'

const userMediaConstraints = {
  video: { width: 320, height: 240, frameRate: 30 },
}

export default {
  setup() {
    const camOut = templateRef<HTMLVideoElement>('camOut')
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
        if (qrCodeDataValue) {
          console.info(qrCodeDataValue)
          deactivateStream()
        }
      },
      {
        immediate: true,
      },
    )

    watch(
      streamRef,
      (stream) => {
        if (stream) { resume() }

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
      if (get(streamRef)) {
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

    return {
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
  border: 1px solid black;
}
</style>
