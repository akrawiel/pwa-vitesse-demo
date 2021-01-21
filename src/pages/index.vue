<template>
  <div class="mainOverlay">
    <router-link to="/qr" class="dot dot1">
      <div class="background" />
      <icon-qr />
      <small class="text-sm">Scan QR</small>
    </router-link>
    <router-link to="/geolocation" class="dot dot2">
      <div class="background" />
      <icon-marker />
      <small class="text-sm">Geolocation</small>
    </router-link>
    <router-link to="/notifications" class="dot dot3">
      <div class="background" />
      <icon-bell />
      <small class="text-sm">Notifications</small>
    </router-link>
  </div>
</template>

<script setup>
import IconQr from '/@vite-icons/mdi/qrcode.vue'
import IconMarker from '/@vite-icons/mdi/map-marker.vue'
import IconBell from '/@vite-icons/mdi/bell-alert.vue'
</script>

<style lang="scss" scoped>
@use "sass:math";

.mainOverlay {
  @apply w-full h-full flex items-center justify-center relative bg-green-400;
}

.dot {
  @apply rounded-full flex-col flex items-center justify-center text-white dark:text-black
    text-2xl absolute cursor-pointer z-20;

  transition: background-color 0.2s ease-out;

  .background {
    @apply w-24 h-24 bg-green-400 rounded-full absolute hover:bg-green-300 border-gray-200
      shadow-md;

    filter: brightness(1.0275);
    z-index: 1;
  }

  svg, small {
    z-index: 2;
  }
}

@function rotTransform($angle, $radius: 4) {
  @return translate(#{$radius * math.cos($angle)}rem, #{$radius * math.sin($angle)}rem);
}

$maxDots: 3;

@for $i from 1 through $maxDots {
  $toAngle: (math.$pi / 180) * (($i - 1) * (360 / $maxDots) - 90);

  @keyframes dot#{$i}-animation {
    0% {
      transform: translate(0, 0);
    }

    100% {
      transform: rotTransform($toAngle);
    }
  }

  .dot#{$i} {
    animation: dot#{$i}-animation 0.5s ease-out 0s 1 normal both;
    transform-origin: center;
  }
}
</style>
