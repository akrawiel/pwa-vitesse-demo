import { computed, ref, watch } from 'vue'
import { get, set, templateRef, useRafFn, useWebWorkerFn } from '@vueuse/core'

const userMediaConstraints = {
  video: {
    width: 320,
    height: 320,
    frameRate: 30,
    resizeMode: 'crop-and-scale',
    facingMode: 'environment',
  },
}

const QrSetup = () => {
  const videoRef = templateRef<HTMLVideoElement>('video')
  const canvasRef = templateRef<HTMLCanvasElement>('canvas')

  const streamRef = ref<MediaStream | null>(null)
  const qrCodeRef = ref<{ data: string } | null>(null)

  const { workerFn: detectQR, workerStatus: detectQRStatus } = useWebWorkerFn(
    (imageData, width, height) => {
      // eslint-disable-next-line no-undef
      return jsQR(imageData, width, height, {
        inversionAttempts: 'attemptBoth',
      })
    },
    {
      dependencies: [
        'https://unpkg.com/jsqr@1.3.1/dist/jsQR.js',
      ],
    },
  )

  const { pause: pauseScanning, resume: resumeScanning } = useRafFn(() => {
    const ctx = get(canvasRef)?.getContext('2d')
    const { height, width } = get(canvasRef) ?? {}

    if (ctx) {
      ctx.drawImage(
        videoRef.value,
        0,
        0,
        width,
        height,
      )

      if (detectQRStatus.value !== 'RUNNING') {
        const imageData = ctx.getImageData(0, 0, width, height)

        detectQR(imageData.data, width, height).then(
          (qrReturn) => {
            set(qrCodeRef, qrReturn)
          },
        )
      }
    }
  }, {
    immediate: false,
  })

  const qrCodeData = computed(
    () => get(qrCodeRef)?.data ?? null,
  )

  const isScanning = computed(() => Boolean(get(streamRef)))

  const isQrCodeLink = computed(
    () => get(qrCodeData)?.startsWith('http'),
  )

  const deactivateStream = () => {
    if (videoRef.value) {
      streamRef.value?.getVideoTracks().forEach(
        track => track.stop(),
      )
      videoRef.value.srcObject = null
      set(streamRef, null)
    }
  }

  const toggleScanning = () => {
    if (get(isScanning)) {
      deactivateStream()
    }
    else {
      window.navigator.mediaDevices.getUserMedia(userMediaConstraints).then(
        (stream) => {
          videoRef.value.srcObject = stream
          set(streamRef, stream)
        },
      )
    }
  }

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
        resumeScanning()
      }
      else {
        pauseScanning()
        get(canvasRef)?.getContext('2d')?.clearRect(
          0,
          0,
          get(canvasRef)?.width,
          get(canvasRef)?.height,
        )
      }
    },
    {
      immediate: true,
    },
  )

  return {
    isScanning,
    isQrCodeLink,
    toggleScanning,
    qrCodeData,
  }
}

export default QrSetup
