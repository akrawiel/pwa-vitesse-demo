<template>
  <nav-header>
    Speech recognition
  </nav-header>
  <div class="p-4 flex flex-col h-full">
    <div class="flex-1">
      <div>Recognized color: <b>{{ recognizedColor ?? 'none' }}</b></div>
      <div class="colorSquare" :style="{ 'background-color': recognizedColor }" />
    </div>
    <button class="btn mt-5" @click="startSpeechRecognition">
      Start speech recognition
    </button>
  </div>
</template>

<script setup lang="ts">
import { set } from '@vueuse/core'
import { ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const recognizedColor = ref(null)

const SpeechRecognition = globalThis.SpeechRecognition || globalThis.webkitSpeechRecognition
const SpeechGrammarList = globalThis.SpeechGrammarList || globalThis.webkitSpeechGrammarList

const dummyProxy = {
  addFromString() {},
  onresult() {},
  onnomatch() {},
  onspeechend() {},
  stop() {},
  abort() {},
  start() {},
  grammars: {},
  continuous: false,
  lang: '',
  interimResults: false,
  maxAlternatives: 0,
}

const grammar = '#JSGF V1.0; grammar colors; public <color> = aqua | azure | beige | bisque | black | blue | brown | chocolate | coral | crimson | cyan | fuchsia | ghostwhite | gold | goldenrod | gray | green | indigo | ivory | khaki | lavender | lime | linen | magenta | maroon | moccasin | navy | olive | orange | orchid | peru | pink | plum | purple | red | salmon | sienna | silver | snow | tan | teal | thistle | tomato | turquoise | violet | white | yellow ;'
const recognition = SpeechRecognition ? new SpeechRecognition() : dummyProxy
const speechRecognitionList = SpeechGrammarList ? new SpeechGrammarList() : dummyProxy

speechRecognitionList.addFromString(grammar, 1)
recognition.grammars = speechRecognitionList
recognition.continuous = false
recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1

const startSpeechRecognition = () => {
  recognition.start()
}

// eslint-disable-next-line no-undef
recognition.onresult = (event: SpeechRecognitionEvent) => {
  const colorResult = event.results[0][0].transcript

  set(recognizedColor, colorResult)
}

recognition.onnomatch = () => {
  window.alert('No match found')
}

recognition.onspeechend = () => {
  recognition.stop()
}

onBeforeRouteLeave(() => {
  recognition.abort()
})
</script>

<style scoped>
.colorSquare {
  @apply rounded border border-black dark:border-white;

  height: 50vw;
  width: 50vw;
}
</style>
