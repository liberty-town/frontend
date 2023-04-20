<template>
  <div class="mt-2 user-details px-2 py-2">
    <div class="d-flex align-items-center">
      <account-identicon :address="listing.publisher.address" class="me-3" :size="$store.state.page.width > 480 ? 30 : 25" />
      <view-listing-summary v-if="$store.state.page.width > 480" :listing="listing" :account-summary="accountSummary" :listing-summary="listingSummary" :listing-summary-loading="listingSummaryLoading" :account-summary-loading="accountSummaryLoading"/>

      <router-link :to="{path: `/chat/conversation/${ listing.publisher.address }`, query: { listing: listing.identity } }" class="ms-3" >
        <button type="button" class="btn btn-light waves-effect waves-light ">
          <i class="fas fa-envelope"></i>
        </button>
      </router-link>

      <router-link v-if="listing.publisher.address === $store.state.page.settings.account.address"
                   :to="`/listings/update/${listing.identity}`" class="btn btn-secondary light waves-effect waves-light ms-2">
        <i class="fa fa-pencil"/>
      </router-link>

    </div>

    <div v-if="$store.state.page.width < 480" class="d-flex">
      <view-listing-summary :listing="listing" :account-summary="accountSummary" :listing-summary="listingSummary" :listing-summary-loading="listingSummaryLoading" :account-summary-loading="accountSummaryLoading" />
    </div>
  </div>
</template>

<script>
import ViewListingSummary from "./view-listing-summary";
import AccountIdenticon from "../../components/utils/account-identicon";
export default {

  components: {ViewListingSummary, AccountIdenticon},

  props: {
    listingSummary: {default: null},
    listingSummaryLoading: {default: false},

    listing: {default: null},
    accountSummary: {default: null},
    accountSummaryLoading: {default: false}
  },

  methods: {

  }

}
</script>