<!--查看产品详情-->
<template>
  <layout>
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">

            <div v-if="listingLoading" style="text-align: center">
              <loading-spinner class="fa-lg"/>
            </div>
            <template v-else-if="listing">

              <div class="row">
                <div class="col-md-6">
                  <div class="product-detai-imgs">
                    <div class="row">
                      <div class="img-fluid"
                           :style="`background-image: url('${listing.images.length ? listing.images[0] : '/assets/image-not-available.png'}');`" />
                    </div>
                    <div class="category-container d-flex">
                      <div class="badge-element">
                        <span v-if="listing.type.eq(0)" class="badge bg-success me-2 text-white p-2">BUY</span>
                        <span v-else-if="listing.type.eq(1)" class="badge bg-primary me-2 text-white p-2">SALE</span>
                      </div>
                      <div class="" v-if="listing.categories">
                        <router-link v-for="(c, key) in listing.categories" :key="key" class="badge bg-black me-1 text-black p-2 text-white"
                                     :to="{path: '/listings/search/'+c, query: { queryType: 'category'} }"  >
                          {{  $store.state.federations.dict[listing.federation].categoriesDict[c] ? $store.state.federations.dict[listing.federation].categoriesDict[c].name : "invalid category" }}
                        </router-link>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6 pt-4 pt-md-0">

                  <div>
                    <h4>{{listing.title}}</h4>
                  </div>

                  <view-listing-report :listing="listing" :account-summary="accountSummary" :listing-summary="listingSummary" :account-summary-loading="accountSummaryLoading" :listing-summary-loading="listingSummaryLoading"/>

                  <div class="mt-2" v-if="listing.quantityUnlimited || listing.quantityAvailable.gt(0)">

                    <div class="mt-4 d-flex item-actions">
                      <div class="row me-1" style="max-width: 300px">
                        <div class="col-12 d-flex">
                          <input-amount :text="null" :allow-zero="false" :init-amount="Decimal_1" :spinner="false" :init-amount-disable="false"
                                      :decimal-separator="Decimal_0" @changed="it => this.quantity = {...this.quantity, ...it}"
                                        style="max-width: 50px" class="me-2"/>

                          <select class="form-select form-select-solid w-100" v-model="selectedOffer" >
                            <option v-for="(it, key) in listing.offers" :key="`listing-${listing.identity}-offer-${key}`"
                                    :value="key">
                              <amount asset="currency-DOLLAR" :value="it.price" sign="$" /> - {{it.amount}}
                            </option>
                          </select>

                        </div>
                        <div class="col-12 mt-2">
                          <select class="form-select form-select-solid w-100" v-model="selectedShipping" >
                            <option v-for="(it, key) in listing.shipping" :key="`listing-${listing.identity}-shipping-${key}`"
                                    :value="key">
                              <amount asset="currency-DOLLAR" :value="it.price" sign="$" /> - {{it.option}}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="d-flex align-items-center">
                        <router-link :to="{path: `/chat/conversation/${ listing.publisher.address }`, query: {
                          newOffer: JSONStringify({
                            listing: listing.identity,
                            type: listing.type.eq(0),
                            title: listing.title,
                            quantity: quantity.amount,
                            offer: listing.offers[selectedOffer],
                            shipping: listing.shipping[selectedShipping],
                           })}}">
                          <button type="button" class="btn btn-primary waves-effect waves-light d-flex">
                            <i class="fas fa-shopping-cart me-2 mt-1"></i> {{listing.type.eq(0) ? 'Sell' : 'Buy'}}
                          </button>
                        </router-link>
                      </div>
                    </div>
                  </div>

                  <h6 v-else class="text-danger">out of stock</h6>

                  <hr class="invoice-spacing mt-3 ">

                  <div class="d-flex mt-2">
                    <div class="col-lg-6 col-md-6 col-sm-6">
                      <span>
                        <span class="text-success">{{ listing.quantityUnlimited ? 'unlimited' : listing.quantityAvailable }}</span>
                        available
                      </span>
                    </div>
                    <div class="col-lg-6 col-md-6 col-sm-6">
                      <span class="text-muted">
                        Last update
                        <span>{{new Date(listing.ownership.timestamp*1000).toDateString() }}</span>
                      </span>
                    </div>
                  </div>

                  <hr class="invoice-spacing mt-3 ">

                  <div class="d-flex mt-2">
                    <div class="col-lg-6 col-md-6 col-sm-6">
                        <span>Ships from: <b>{{$countries.getText(listing.shipsFrom)}}</b></span>
                    </div>
                  </div>

                </div>

              </div>

              <hr class="invoice-spacing mt-3 ">

              <div class="mt-2">
                <span>Ships to: <b>{{listing.shipsTo.map( it => $countries.getText(it) ).join(', ') }}</b></span>
              </div>

              <p class="text-muted mt-2" style="white-space: pre-line">{{listing.description}}</p>

              <hr class="border-top">

              <div class="d-flex flex-column flex-sm-row pb-3" v-if="(listing.publisher.address === $store.state.page.settings.account.address) || $store.getters.isFederationModerator" >
                <router-link v-if="listing.publisher.address === $store.state.page.settings.account.address"
                             :to="`/listings/update/${listing.identity}`" class="btn btn-primary btn-cart mx-1 me-sm-1 mb-1 mb-sm-0 waves-effect waves-float waves-light">
                  <i class="fa fa-pencil me-2"/>
                  <span class="add-to-cart">Edit listing</span>
                </router-link>
                <router-link v-if="$store.getters.isFederationModerator" class="btn btn-primary btn-cart mx-1 me-sm-1 mb-1 mb-sm-0 waves-effect waves-float waves-light"
                             :to="{ path: `/reviews/add`, query: { account: listing.publisher.address, listing: listing.identity,
                              type: listing.type.eq(0) ? 'purchase': 'sale' }}" >
                  <i class="fa fa-comments-dollar me-2"/>
                  <span class="add-to-cart">Leave review</span>
                </router-link>
              </div>

              <div>
                <h5>Listing Reviews</h5>
                <show-reviews v-if="reviewsListing.length" :list="reviewsListing"/>
                <loading-spinner v-if="reviewsListingLoading"/>
                <span v-else-if="!reviewsListing.length">None</span>

                <loading-button v-if="!reviewsListingFinished && reviewsListingStart.gt(0)" :submit="() => this.loadMoreReviews(1)" text="Load more listing reviews" icon="fa fa-download" class="btn-secondary mt-3"/>
              </div>

              <hr class="border-top">

              <div>
                <h5>Account Reviews</h5>
                <show-reviews v-if="reviewsAccountAvoidDuplicates.length" :list="reviewsAccountAvoidDuplicates"/>
                <loading-spinner v-if="reviewsAccountLoading"/>
                <span v-else-if="!reviewsAccount.length">None</span>

                <loading-button v-if="!reviewsAccountFinished && reviewsAccountStart.gt(0)" :submit="() => this.loadMoreReviews(0)" text="Load more account reviews" icon="fa fa-download" class="btn-secondary mt-3"/>
              </div>

            </template>

            <alert-box v-if="error">{{error}}</alert-box>

          </div>

        </div>
      </div>
    </div>
  </layout>
</template>

<script>
import Layout from "src/views/layout/layout"
import ShowReviews from "src/views/reviews/show-reviews"
import Stars from "../reviews/stars";
import AlertBox from "src/components/utils/alert-box";
import LoadingSpinner from "src/components/utils/loading-spinner";
import AccountIdenticon from "../../components/utils/account-identicon";
import InputAmount from "../../components/input-amount";
import Amount from "../../components/amount";
import LoadingButton from "src/components/utils/loading-button";
import ViewListingReport from "./view-listing-report";
import ThreadsSearchBar from "../threads/threads-search-bar";

export default {

  components: {
    ViewListingReport, Amount, AccountIdenticon, Stars, Layout, ShowReviews, AlertBox, LoadingSpinner, InputAmount,
    LoadingButton, ThreadsSearchBar},

  data(){
    return {
      listingLoading: true,
      listing: null,
      accountSummaryLoading: true,
      accountSummary: null,
      listingSummaryLoading: true,
      listingSummary: null,
      reviewsListing: [],
      reviewsListingLoading: true,
      reviewsListingStart: Decimal_0,
      reviewsListingFinished: false,
      reviewsAccount: [],
      reviewsAccountLoading: true,
      reviewsAccountStart: Decimal_0,
      reviewsAccountFinished: false,
      selectedOffer: 0,
      selectedShipping: 0,
      quantity: {
        amount: Decimal_1,
        amountValidationError: "",
      },
      error: "",
    }
  },

  computed: {

    query(){
      return this.$route.params.query||'';
    },

    reviewsAccountAvoidDuplicates(){
      if (!this.reviewsAccount.length) return []

      const dict = {}
      if (this.reviewsListing)
        this.reviewsListing.forEach( it => dict[JSONStringify(it)] = true )

      return this.reviewsAccount.filter(it => !dict[JSONStringify(it)] )
    },

    accountSummaryType(){
      if (this.listing && this.listing.type.eq(0)) return "purchases"
      if (this.listing && this.listing.type.eq(1)) return "sales"
      return "purchases"
    },

  },

  methods: {
    async load(){
      try{


        this.$store.commit('setPage',{
          title: "View Listing",
        })

        Object.assign(this.$data, this.$options.data())

        let data = JSONParse( MyTextDecode( await LibertyTown.listings.get( JSONStringify({
          listing: this.query,
        })) ))

        if (!data) throw "Listing was not found"

        if (!this.$store.state.federations.dict[data.federation])
          throw "listing federation is invalid"

        this.listing = data
        this.listingLoading = false

        data = JSONParse( MyTextDecode( await LibertyTown.accountsSummaries.get( MyTextEncode( JSONStringify({
          account: this.listing.publisher.address,
        })) )))

        if (data) this.accountSummary = data
        this.accountSummaryLoading = false

        data = JSONParse( MyTextDecode( await LibertyTown.listingsSummaries.get( MyTextEncode( JSONStringify({
          listing: this.listing.identity,
        })) )))

        if (data) this.listingSummary = data
        this.listingSummaryLoading = false

        let count = await LibertyTown.reviews.getAll( JSONStringify({
          identity: this.query,
          type: 1,
          start: 0,
        }), (data)=>{
          const review = JSONParse(MyTextDecode(data))
          this.reviewsListing.push(review)
        })

        this.reviewsListingStart = new Decimal(count)
        this.reviewsListingFinished = count < LibertyTown.config.REVIEWS_LIST_COUNT
        this.reviewsListingLoading = false

        count = await LibertyTown.reviews.getAll( JSONStringify({
          identity: this.listing.publisher.address,
          type: 0,
          start: 0,
        }), (data)=>{
          const review = JSONParse(MyTextDecode(data))
          this.reviewsAccount.push(review)
        })

        this.reviewsAccountStart = new Decimal(count)
        this.reviewsAccountFinished = count < LibertyTown.config.REVIEWS_LIST_COUNT
        this.reviewsAccountLoading = false

      }catch(e){
        this.error = e.toString()
      }finally{
        this.listingLoading = false
        this.accountSummaryLoading = false
        this.reviewsListingLoading = false
        this.reviewsAccountLoading = false
      }
    },

    async loadMoreReviews(type = 0){

      let name = 'Account'
      let identity = this.listing.publisher.address
      if (type === 1) {
        name = 'Listing'
        identity = this.query
      }

      const count = await LibertyTown.reviews.getAll( JSONStringify({
        identity,
        type,
        start: this[`reviews${name}Start`],
      }), (data)=>{
        const it = JSONParse( MyTextDecode(data))
        this[`reviews${name}`].push(it)
      })

      this[`reviews${name}Start`] = this[`reviews${name}Start`].plus(count)
      this[`reviews${name}Finished`] = count < LibertyTown.config.REVIEWS_LIST_COUNT
    },



  },

  mounted(){
    this.load()
  },

}
</script>

<style scoped>
.img-fluid{
  height: 360px;
}
</style>