<template>
  <nav-header>
    Notifications
  </nav-header>
  <div class="p-4 flex flex-col h-full">
    <div class="flex-1 flex flex-col">
      <div>
        Click the button below to generate a notification
      </div>
      <div class="text-xs">
        All messages below will be closed 5 seconds after appearing
      </div>
      <b v-if="openMessageShown" class="mt-4">
        You have opened the notification!
      </b>
      <b v-if="closeMessageShown" class="mt-4">
        You have closed the notification!
      </b>
      <b v-if="showMessageShown" class="mt-4">
        A new notification is now shown!
      </b>
    </div>
    <button class="btn mt-5" @click="requestNewNotification">
      Request new notification
    </button>
  </div>
</template>

<script setup lang="ts">
import { get, set, useWebWorkerFn } from '@vueuse/core'
import { onBeforeUnmount, ref } from 'vue'

const openMessageShown = ref(false)
// eslint-disable-next-line no-undef
const openMessageTimeoutId = ref<NodeJS.Timeout | null>(null)

const closeMessageShown = ref(false)
// eslint-disable-next-line no-undef
const closeMessageTimeoutId = ref<NodeJS.Timeout | null>(null)

const showMessageShown = ref(false)
// eslint-disable-next-line no-undef
const showMessageTimeoutId = ref<NodeJS.Timeout | null>(null)

const getNotificationHandler: (
  showRef: typeof openMessageShown, timeoutRef: typeof openMessageTimeoutId
) => (event: Event) => void = (showRef, timeoutRef) => (event) => {
  event.preventDefault()

  set(showRef, true)

  const currentTimeoutId = get(timeoutRef)

  if (currentTimeoutId)
    clearTimeout(currentTimeoutId)

  set(
    timeoutRef,
    setTimeout(() => {
      set(showRef, false)
    }, 5000),
  )
}

onBeforeUnmount(() => {
  [openMessageTimeoutId, closeMessageTimeoutId, showMessageTimeoutId].forEach(
    (timeoutRef) => {
      const timeout = get(timeoutRef)

      if (timeout)
        clearTimeout(timeout)
    },
  )
})

const requestNewNotification = () => {
  Notification.requestPermission().then(
    (status) => {
      if (status === 'granted') {
        // eslint-disable-next-line no-undef
        const notificationArgs: [string, NotificationOptions] = [
          'Test notification', {
            body: 'This is a test notification from PWA demo app!',
            icon: '/pwa-192x192.png',
          },
        ]

        if (process.env.NODE_ENV === 'production') {
          window.navigator.serviceWorker.ready.then((registration) => {
            registration.showNotification(...notificationArgs).then(
              () => {
                set(openMessageShown, true)

                const currentTimeoutId = get(openMessageTimeoutId)

                if (currentTimeoutId)
                  clearTimeout(currentTimeoutId)

                set(
                  openMessageTimeoutId,
                  setTimeout(() => {
                    set(openMessageShown, false)
                  }, 5000),
                )
              },
            )
          })
        }
        else {
          const notification = new Notification(...notificationArgs)

          notification.onclick = getNotificationHandler(openMessageShown, openMessageTimeoutId)
          notification.onclose = getNotificationHandler(closeMessageShown, closeMessageTimeoutId)
          notification.onshow = getNotificationHandler(showMessageShown, showMessageTimeoutId)
        }
      }
    },
  )
}
</script>
