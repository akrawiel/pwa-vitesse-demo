<template>
  <nav-header>
    Geolocation
  </nav-header>
  <div class="p-4 flex flex-col h-full">
    <div class="flex-1 text-xl">
      <div v-if="locationError" class="px-4 py-3 bg-red-500 rounded text-white dark:text-black">
        {{ locationError }}
      </div>
      <div v-else class="flex flex-col">
        <div class="flex items-center">
          <icon-latitude />
          <span class="ml-2 leading-tight">Latitude</span>
        </div>
        <b>{{ currentLocation.latitude ?? '-' }}</b>
        <div class="flex items-center mt-4">
          <icon-longitude />
          <span class="ml-2 leading-tight">Longitude</span>
        </div>
        <b>{{ currentLocation.longitude ?? '-' }}</b>
      </div>
    </div>
    <button class="btn mt-5" @click="requestCurrentPosition">
      Request current position
    </button>
  </div>
</template>

<script setup lang="ts">
import { set } from '@vueuse/core'
import { computed, reactive, ref } from 'vue'
import { Plugins } from '@capacitor/core';

const { Geolocation } = Plugins;

import IconLatitude from '/@vite-icons/mdi/latitude.vue'
import IconLongitude from '/@vite-icons/mdi/longitude.vue'

interface Coords {
  latitude: number | null
  longitude: number | null
}

const currentLocation = reactive<Coords>({
  latitude: null,
  longitude: null,
})

const locationError = ref<string | null>(null)

const requestCurrentPosition = () => {
  Geolocation.getCurrentPosition(
    {
      enableHighAccuracy: true,
    },
  ).then(
    ({ coords }) => {
      currentLocation.latitude = coords.latitude
      currentLocation.longitude = coords.longitude
      set(locationError, null)
    },
  ).catch(
    (error) => {
      set(locationError, error.message)
      currentLocation.latitude = null
      currentLocation.longitude = null
    },
  )
}
</script>
