<template>
  <div>
    <loading-spinner v-if="listingSummaryLoading"/>
    <div v-else class="d-flex">
      <span class="text-muted me-2">{{listing.type.eq(1) ? 'sold' : 'bought'}} {{listingSummary ? listingSummary.count : 0}} units</span>
      <stars :score="listingSummary ?  listingSummary.total.div( listingSummary.count ) : 0"/>
    </div>
    <loading-spinner v-if="accountSummaryLoading"/>
    <template v-else>
      <span class="text-muted d-block">
        transactions:
        <amount asset="currency-DOLLAR" :value="accountSummary ? accountSummary[accountSummaryType+'Amount'] : 0" sign="$"/>
        ({{accountSummary ? accountSummary[accountSummaryType+'Count'] : 0}})
      </span>
      <span class="text-muted d-block">{{accountSummary && !accountSummary[accountSummaryType+'Count'].eq(0) ? accountSummary[accountSummaryType+'Total'].div(accountSummary[accountSummaryType+'Count']).mul(100).div(5).toFixed(2) : 0}}% positive feedback</span>
    </template>
  </div>
</template>

<script>
import Stars from "../reviews/stars";
import Amount from "../../components/amount";
import LoadingSpinner from "src/components/utils/loading-spinner";

export default {

  components: {Amount, Stars, LoadingSpinner},


  props: {
    listingSummary: {default: null},
    listingSummaryLoading: {default: false},
    listing: {default: null},

    accountSummary: {default: null},
    accountSummaryLoading: {default: false}
  },

  computed:{
    accountSummaryType(){
      if (this.listing && this.listing.type.eq(0)) return "purchases"
      if (this.listing && this.listing.type.eq(1)) return "sales"
      return "purchases"
    },
  },

}
</script>