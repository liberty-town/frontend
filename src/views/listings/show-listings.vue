<template>
  <div>
    <div v-for="(it, key) in list" :key="`listing-${key}`"
        v-if="list" :class="`${key > 0 ? 'pt-2 pt-sm-4' :''} ${$store.state.settings.ui.showListingsImages ? 'col-12' : 'col-12 col-sm-6 col-lg-4 col-xl-3' }`">
      <view-preview-listing :listing="it.listing" :account-summary="it.accountSummary" :listing-summary="it.listingSummary" />
    </div>
  </div>
</template>

<script>
import ViewPreviewListing from "./view-preview-listing"

export default {

  components: {ViewPreviewListing},

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