import { computed, ref, watch } from 'vue'
import { get, set, templateRef, useRafFn, useWebWorkerFn } from '@vueuse/core'
import { Plugins } from "@capacitor/core"
import { onBeforeRouteLeave } from "vue-router"

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
  
  const scanningStarted = ref(false)

  const scanFromPreview = () => {
    const ctx = get(canvasRef)?.getContext('2d')
    const { height, width } = get(canvasRef) ?? {}

    if (!ctx) return;

    if (scanningStarted.value) {
      Plugins.CameraPreview.capture({ quality: 60 }).then(b64Data => {
        const img = new Image()
        
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height)
          scanFromPreview()
        }
        
        img.src = `data:image/png;base64,${b64Data.value}`
      })
    } else {
      get(canvasRef)?.getContext('2d')?.clearRect(
        0,
        0,
        get(canvasRef)?.width,
        get(canvasRef)?.height,
      )
    }
  }

  const qrCodeData = computed(
    () => get(qrCodeRef)?.data ?? null,
  )

  const isScanning = computed(() => Boolean(get(streamRef)))

  const isQrCodeLink = computed(
    () => get(qrCodeData)?.startsWith('http'),
  )

  const deactivateStream = () => {
    if (videoRef.value) {
      set(scanningStarted, false)
      streamRef.value?.getVideoTracks().forEach(
        track => track.stop(),
      )
      videoRef.value.srcObject = null
      set(streamRef, null)
    }
  }

  const toggleScanningE = () => {
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
  
  const toggleScanning = () => {
    set(scanningStarted, !get(scanningStarted))
  }

  watch(
    scanningStarted,
    (scanningStartedValue) => {
      if (scanningStartedValue) {
        const canvasContainer = document.querySelector(".canvasContainer")
        const canvasRect = canvasContainer?.getBoundingClientRect() ?? {}
        Plugins.CameraPreview.start({
          x: 0,
          y: Math.floor(canvasRect.top) + Math.floor((canvasContainer?.offsetTop ?? 0) / 2),
          height: Math.floor(window.screen.width),
          width: Math.floor(window.screen.width),
          toBack: false, position: 'rear' }).then(
          () => {
            scanFromPreview()
            resumeScanning()
          }
        )
      } else {
        Plugins.CameraPreview.stop()
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
      immediate: true
    }
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

  onBeforeRouteLeave(() => {
    set(scanningStarted, false)
  })

  return {
    scanningStarted,
    isScanning,
    isQrCodeLink,
    toggleScanning,
    qrCodeData,
  }
}

export default QrSetup
