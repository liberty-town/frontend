<template>
  <div>

    <div class="row my-2" v-if="list" v-for="(it, key) in list" :key="key">

      <div class="d-flex col-12 col-sm-8">
        <span class="me-2">
          <img src="/assets/user-anonymous.png" alt="avatar">
        </span>
        <div class="w-100">
          <div class="d-block d-sm-none">
            <stars :score="it.review.score"/>
          </div>
          <div class="d-flex">
            <span class="mb-0">Anonymous {{it.review.listingIdentity ? 'buyer' : 'seller'}}: <b>{{it.review.text}}</b></span>
          </div>
          <div>
            <amount asset="currency-DOLLAR" :value="it.review.amount" sign="$" class="fw-bold me-2"/>
            <small class="text-muted">{{new Date(it.review.signer.timestamp*1000).toDateString()}}</small>
          </div>
        </div>
      </div>

      <div class="d-none d-sm-flex col-sm-4 justify-content-end">
        <stars :score="it.review.score"/>
      </div>
    </div>

  </div>
</template>

<script>
import Stars from "./stars"
import Amount from "../../components/amount";

export default {
  components: {Amount, Stars},
  props:  {
    list: {default: null }
  }
}
</script>

<style scoped>
img{
  width: 40px;
  height: 40px;
}
</style>