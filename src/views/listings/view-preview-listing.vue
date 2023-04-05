<template>
  <div class="card">
    <div class="card-body">

      <div class="row">

        <div class="col-12 col-sm-4 image-card" v-if="$store.state.settings.ui.showListingsImages">
          <router-link :to="`/listings/view/${listing.identity}`" class="w-100 h-100">
            <div class="img-fluid"
                 :style="`background-image: url('${listing.images.length ? listing.images[0] : '/assets/image-not-available.png'}');`"/>
          </router-link>
          <div class="category-container d-flex px-2">
            <div class="badge-element">
              <span v-if="listing.type.eq(0)" class="badge bg-success me-2 p-2 text-white">BUY</span>
              <span v-else-if="listing.type.eq(1)" class="badge bg-primary me-2 p-2 text-white">SALE</span>
            </div>
            <div class="" v-if="listing.categories && $store.state.federations.dict[listing.federation]">
              <router-link v-for="(c, key) in listing.categories" :key="key" class="badge bg-black text-white p-2 me-1" :to="{ path: '/listings/search/'+ c, query: { queryType: 'category'} }"  >
                {{  $store.state.federations.dict[listing.federation].categoriesDict[c] ? $store.state.federations.dict[listing.federation].categoriesDict[c].name : "invalid category" }}
              </router-link>
            </div>
          </div>
        </div>

        <div :class="`${$store.state.settings.ui.showListingsImages ? 'col-12 col-sm-8 mt-4 mt-sm-0' : '' }`">

          <router-link :to="`/listings/view/${listing.identity}`" class="text-dark">
            <h5>{{ listing.title }}</h5>
          </router-link>

          <view-listing-report :listing="listing" :account-summary="accountSummary" :listing-summary="listingSummary" />

          <div class="mt-2">
            <span>Ships from: <b>{{$countries.getText(listing.shipsFrom)}}</b></span>
          </div>

          <div class="mt-2">
            <span>Ships to: <b>{{listing.shipsTo.map( it => $countries.getText(it) ).join(', ') }}</b></span>
          </div>

          <div class="mt-2 row item-actions">
            <div class="col-12 col-sm-9 row me-1" style="max-width: 500px">
              <div class="d-flex">

                <input-amount :text="null" :allow-zero="false" :init-amount="Decimal_1" :spinner="false" :init-amount-disable="false"
                              :decimal-separator="Decimal_0" @changed="it => this.quantity = {...this.quantity, ...it}"
                              style="max-width: 50px" class="me-2"/>

                <select class="form-select form-select-solid " v-model="selectedOffer">
                  <option v-for="(it, key) in listing.offers" :key="`listing-${listing.identity}-offer-${key}`"
                          :value="key">
                    <amount asset="currency-DOLLAR" :value="it.price" sign="$" /> - {{it.amount}}
                  </option>
                </select>

              </div>
              <div class="d-flex mt-2" v-if="listing.shipping.length">
                <select class="form-select form-select-solid w-100" v-model="selectedShipping" >
                  <option v-for="(it, key) in listing.shipping" :key="`listing-${listing.identity}-shipping-${key}`"
                          :value="key">
                    <amount asset="currency-DOLLAR" :value="it.price" sign="$" /> - {{it.option}}
                  </option>
                </select>
              </div>

            </div>
            <div class="col-12 col-sm-3 mt-3 mt-sm-0 d-flex align-items-center">
              <router-link :to="{path: `/chat/conversation/${ listing.publisher.address }`, query: {
                newOffer: JSONStringify({
                listing: listing.identity,
                type: listing.type.eq(0),
                title: listing.title,
                quantity: quantity.amount,
                offer: listing.offers[selectedOffer],
                shipping: listing.shipping.length ? listing.shipping[selectedShipping] : null,
                })}}">
                <button type="button" class="btn btn-primary waves-effect waves-light d-flex">
                  <i class="fas fa-shopping-cart me-2 mt-1"></i> {{listing.type.eq(0) ? 'Sell' : 'Buy'}}
                </button>
              </router-link>
            </div>

          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import AccountIdenticon from "../../components/utils/account-identicon";
import InputAmount from "../../components/input-amount";
import Amount from "../../components/amount";
import ViewListingSummary from "./view-listing-summary";
import ViewListingReport from "./view-listing-report";

export default {

  components: {ViewListingReport, ViewListingSummary,  AccountIdenticon, InputAmount, Amount},

  props: {
    listing: {default: null},
    accountSummary: {default: null},
    listingSummary: {default: null},
  },



  data(){
    return {
      selectedOffer: 0,
      selectedShipping: 0,
      quantity: {
        amount: Decimal_1,
        amountValidationError: "",
      },
    }
  },

}
</script>

<style scoped>
.image-card img{
  max-height: 240px!important;
  left: 0!important;
  margin-left: 0 !important;
}

@media screen and (max-width: 576px){
  .image-card img{
    max-height: 100%!important;
  }
}
.card {
  margin-bottom: 0;
}
</style>