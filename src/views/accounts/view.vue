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

        <div v-if="loadingAccount || loadingAccountSummary " class="text-center">
          <loading-spinner class="fa-2x"/>
        </div>

        <hr class="border-top"/>

        <h5>Sell Listings from this account</h5>
        <show-listings v-if="sellListings.length" :list="sellListings"/>
        <loading-spinner v-if="loadingSellListings" class="fa-lg"/>
        <span v-else-if="!sellListings.length">None</span>

        <hr class="border-top"/>

        <h5>Buy Listings from this account</h5>
        <show-listings v-if="buyListings.length" :list="buyListings"/>
        <loading-spinner v-if="loadingBuyListings" class="fa-lg"/>
        <span v-else-if="!buyListings.length">None</span>

        <hr class="border-top"/>

        <h5>Account Reviews</h5>
        <show-reviews v-if="reviews.length" :list="reviews"/>
        <loading-spinner v-if="loadingReviews" class="fa-lg"/>
        <span v-else-if="!reviews.length">None</span>

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

export default {
  components: {Amount, AccountIdenticon, LoadingSpinner, Stars, ShowReviews, Layout, ShowListings, AlertBox},

  data() {
    return {
      account: null,
      loadingAccount: true,
      accountSummary: null,
      loadingAccountSummary: true,
      buyListings: [],
      loadingBuyListings: true,
      sellListings: [],
      loadingSellListings: true,
      reviews: [],
      loadingReviews: false,
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
        this.loadingAccount = false

        data = JSONParse(MyTextDecode(await LibertyTown.accountsSummaries.get(MyTextEncode(JSONStringify({
          account: this.query,
        })))))

        this.accountSummary = data
        this.loadingAccountSummary = false

        let count = await LibertyTown.listings.getAll(JSONStringify({
          account: this.query,
          type: 0,
        }), data =>{
          const it = JSONParse( MyTextDecode(data) )
          this.buyListings.push(it)
        })

        this.loadingBuyListings = false

        count = await LibertyTown.listings.getAll(JSONStringify({
          account: this.query,
          type: 1,
        }), data => {
          const it = JSONParse( MyTextDecode(data) )
          this.sellListings.push(it)
        })

        this.loadingSellListings = false

        count = await LibertyTown.reviews.getAll(JSONStringify({
          identity: this.query,
          type: 0,
        }), data => {
          const it = JSONParse( MyTextDecode(data) )
          this.reviews.push(it)
        })

        this.loadingReviews = false

      } catch (e) {
        console.error("account loading", e)
        this.error = e.toString()
      }finally{
        this.loadingAccount = false
        this.loadingAccountSummary = false
        this.loadingBuyListings = false
        this.loadingSellListings = false
        this.loadingReviews = false
      }
    }
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