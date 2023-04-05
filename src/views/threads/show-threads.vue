<template>
  <div class="row">
    <div v-for="(it, key) in list" :key="`thread-${key}`"
         v-if="list" :class="`${key > 0 ? 'pt-2 pt-sm-4' : ''} ${$store.state.settings.ui.showListingsImages ? 'col-12' : 'col-12 col-sm-6 col-lg-4 col-xl-3' }`">
      <view-preview-thread :thread="it.thread" :thread-poll="it.poll" />
    </div>
  </div>
</template>

<script>
import ViewPreviewThread from "./view-preview-thread";
export default {

  components: {ViewPreviewThread},

  props:  {
    list: {default: null }
  },

  data(){
    return {

    }
  },
}
</script>

<style scoped>
</style>