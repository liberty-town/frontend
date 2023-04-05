<template>
  <layout>

    <div class="card">
      <div class="card-body">

        <div class="col-12 mb-2 d-flex">
          <router-link v-if="query !== $store.state.page.settings.account.address" :to="`/chat/conversation/${ query }`" class="me-2">
            <button class="btn btn-outline-primary waves-effect">
              <i class="fa fa-comment me-2"/>
              <span>Contact account</span>
            </button>
          </router-link>
          <router-link v-if="query === $store.state.page.settings.account.address" :to="`/accounts/add`">
            <button class="btn btn-outline-primary waves-effect">
              <i class="fa fa-pen me-2"/>
              <span>Edit Account</span>
            </button>
          </router-link>
        </div>

        <template v-if="account">

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Account</label>
            <div class="col-sm-8 d-flex">
              <account-identicon :address="account.ownership.address" :size="25" />
              <span class="text-truncate">{{ account.ownership.address }}</span>
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Description</label>
            <div class="col-sm-8">{{account.description}}</div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Country</label>
            <div class="col-sm-8">{{$countries.list[account.country].name}}</div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Date</label>
            <div class="col-sm-8">{{ new Date(account.ownership.timestamp * 1000).toDateString() }}</div>
          </div>

        </template>

        <template v-if="accountSummary">

          <hr class="border-top"/>
          <h5>Account Summary</h5>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Sales score</label>
            <div class="col-sm-8">
              <stars :score="accountSummary.salesCount ? accountSummary.salesTotal / accountSummary.salesCount : 0"/>
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Sales</label>
            <div class="col-sm-8">
              Sold {{ accountSummary.salesCount }} worth
              <amount asset="currency-DOLLAR" :value="accountSummary.salesAmount" sign="$" />
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Purchases score</label>
            <div class="col-sm-8">
              <stars :score="accountSummary.purchasesTotal ? accountSummary.purchasesTotal / accountSummary.purchasesCount : 0"/>
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Purchases</label>
            <div class="col-sm-8">
              Bought {{ accountSummary.purchasesCount }} worth
              <amount asset="currency-DOLLAR" :value="accountSummary.purchasesAmount" sign="$" />
            </div>
          </div>

        </template>

        <div v-if="accountLoading || accountSummaryLoading " class="text-center">
          <loading-spinner class="fa-2x"/>
        </div>

        <hr class="border-top"/>

        <h5>Sell Listings from this account</h5>
        <show-listings v-if="sellListings.length" :list="sellListings"/>
        <loading-spinner v-if="sellListingsLoading" class="fa-lg"/>
        <span v-else-if="!sellListings.length">None</span>
        <loading-button v-if="!sellListingsFinished && sellListingsStart.gt(0)" :submit="() => this.loadMoreListings(1)" text="Load more sell offers" icon="fa fa-download" class="btn-secondary mt-3"/>

        <hr class="border-top"/>

        <h5>Buy Listings from this account</h5>
        <show-listings v-if="buyListings.length" :list="buyListings"/>
        <loading-spinner v-if="buyListingsLoading" class="fa-lg"/>
        <span v-else-if="!buyListings.length">None</span>
        <loading-button v-if="!buyListingsFinished && buyListingsStart.gt(0)" :submit="() => this.loadMoreListings(0)" text="Load more buy offers" icon="fa fa-download" class="btn-secondary mt-3"/>

        <hr class="border-top"/>

        <h5>Account Reviews</h5>
        <show-reviews v-if="reviewsAccount.length" :list="reviewsAccount"/>
        <loading-spinner v-if="reviewsAccountLoading" class="fa-lg"/>
        <span v-else-if="!reviewsAccount.length">None</span>
        <loading-button v-if="!reviewsAccountFinished && reviewsAccountStart.gt(0)" :submit="loadMoreReviews" text="Load more account reviews" icon="fa fa-download" class="btn-secondary mt-3"/>

        <template v-if="$store.getters.isFederationModerator">
          <hr class="border-top"/>

          <div class="col-12 d-flex">

            <router-link :to="{path: '/reviews/add', query: { account: query, type: 'purchase' } }" class="btn btn-outline-primary waves-effect mx-1">
              <i class="fa fa-user-check me-2"/>
              <span>Add Review Purchase</span>
            </router-link>

            <router-link :to="{path: '/reviews/add', query: { account: query, type: 'sale' } }" class="btn btn-outline-primary waves-effect mx-1">
              <i class="fa fa-user-check me-2"/>
              <span>Add Review Sale</span>
            </router-link>

          </div>

        </template>

        <alert-box v-if="error">{{error}}</alert-box>

      </div>
    </div>

  </layout>
</template>

<script>
import Layout from "../layout/layout"
import ShowListings from "../listings/show-listings"
import ShowReviews from "../reviews/show-reviews";
import Stars from "../reviews/stars";
import AlertBox from "src/components/utils/alert-box";
import LoadingSpinner from "src/components/utils/loading-spinner";
import AccountIdenticon from "../../components/utils/account-identicon";
import Amount from "../../components/amount";
import LoadingButton from "src/components/utils/loading-button";

export default {
  components: {Amount, AccountIdenticon, LoadingSpinner, Stars, ShowReviews, Layout, ShowListings, AlertBox, LoadingButton},

  data() {
    return {
      account: null,
      accountLoading: true,
      accountSummary: null,
      accountSummaryLoading: true,
      buyListings: [],
      buyListingsLoading: true,
      buyListingsStart: Decimal_0,
      buyListingsFinished: false,
      sellListings: [],
      sellListingsStart: Decimal_0,
      sellListingsFinished: false,
      sellListingsLoading: true,
      reviewsAccount: [],
      reviewsAccountLoading: true,
      reviewsAccountStart: Decimal_0,
      reviewsAccountFinished: false,
      error: "",
    }
  },

  computed: {

    query() {
      return this.$route.params.query || '';
    },

  },

  methods: {
    async load() {
      try {

        this.$store.commit('setPage', {
          title: "View Account",
        })

        Object.assign(this.$data, this.$options.data())

        if (!this.query) return

        let data = JSONParse(MyTextDecode(await LibertyTown.accounts.get(JSONStringify({
          account: this.query,
        }))))

        this.account = data
        this.accountLoading = false

        data = JSONParse(MyTextDecode(await LibertyTown.accountsSummaries.get(MyTextEncode(JSONStringify({
          account: this.query,
        })))))

        this.accountSummary = data
        this.accountSummaryLoading = false

        let count = await LibertyTown.listings.getAll(JSONStringify({
          account: this.query,
          type: 0,
        }), data =>{
          const it = JSONParse( MyTextDecode(data) )
          it.accountSummary = this.accountSummary
          this.buyListings.push(it)
        })

        this.buyListingsLoading = false
        this.buyListingsStart = new Decimal(count)
        this.buyListingsFinished = count < LibertyTown.config.LISTINGS_LIST_COUNT

        count = await LibertyTown.listings.getAll(JSONStringify({
          account: this.query,
          type: 1,
        }), data => {
          const it = JSONParse( MyTextDecode(data) )
          it.accountSummary = this.accountSummary
          this.sellListings.push(it)
        })

        this.sellListingsLoading = false
        this.sellListingsStart = new Decimal(count)
        this.sellListingsFinished = count < LibertyTown.config.LISTINGS_LIST_COUNT

        count = await LibertyTown.reviews.getAll(JSONStringify({
          identity: this.query,
          type: 0,
        }), data => {
          const it = JSONParse( MyTextDecode(data) )
          this.reviewsAccount.push(it)
        })

        this.reviewsAccountStart = new Decimal(count)
        this.reviewsAccountFinished = count < LibertyTown.config.REVIEWS_LIST_COUNT
        this.reviewsAccountLoading = false

      } catch (e) {
        console.error("account loading", e)
        this.error = e.toString()
      }finally{
        this.accountLoading = false
        this.accountSummaryLoading = false
        this.buyListingsLoading = false
        this.sellListingsLoading = false
        this.reviewsAccountLoading = false
      }
    },

    async loadMoreListings(type=0){

      let name = 'buy'
      if (type === 1) name = 'sell'

      const count = await LibertyTown.listings.getAll( JSONStringify({
        account: this.query,
        type: type,
        start: this[name+'ListingsStart'],
      }), (data)=>{
        const it = JSONParse( MyTextDecode(data))
        it.accountSummary = this.accountSummary
        this[name+'Listings'].push(it)
      })

      this[name+'ListingsStart'] = this[name+'ListingsStart'].plus(count)
      this[name+'ListingsFinished'] = count < LibertyTown.config.LISTINGS_LIST_COUNT

    },

    async loadMoreReviews(){

      const count = await LibertyTown.reviews.getAll( JSONStringify({
        identity: this.query,
        type: 0,
        start: this.reviewsAccountStart,
      }), (data)=>{
        const it = JSONParse( MyTextDecode(data))
        this.reviewsAccount.push(it)
      })

      this.reviewsAccountStart = this.reviewsAccountStart.plus(count)
      this.reviewsAccountFinished = count < LibertyTown.config.REVIEWS_LIST_COUNT
    },

  },

  watch: {
    query: {
      immediate: true,
      handler(val, oldVal) {
        if (val === oldVal) return
        this.load()
      }
    }
  },

}
</script>