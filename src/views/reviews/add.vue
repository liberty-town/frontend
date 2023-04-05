<template>
  <layout>
    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Create a new review</h4>
      </div>
      <div class="card-body">

        <div class="row">
          <label class="col-sm-4 col-form-label">Listing</label>
          <div class="col-sm-8">{{listing}}</div>
        </div>

        <div class="row mt-3 mt-sm-0">
          <label class="col-sm-4 col-form-label">Account</label>
          <div class="col-sm-8 d-flex">
            <account-identicon :address="account" :size="25" />
            {{account}}
          </div>
        </div>

      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h4 class="card-title">ACCOUNT Summary</h4>
      </div>
      <div class="card-body">

        <div v-if="loading" class="text-center">
          <loading-spinner class="fa-2x"/>
        </div>
        <template v-else>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Overall sales feedback</label>
            <div class="col-sm-8 d-flex">
              <stars :score="accountSummary.salesCount.eq(0) ? 0 : accountSummary.salesTotal.div( accountSummary.salesCount )" class="me-2"/>
              ( {{accountSummary.salesCount}} )
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Sales Amount</label>
            <div class="col-sm-8 d-flex">
              <amount asset="currency-DOLLAR" :value="accountSummary.salesAmount" sign="$" />
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Overall purchases feedback</label>
            <div class="col-sm-8 d-flex">
              <stars :score="accountSummary.purchasesCount.eq(0) ? 0 : accountSummary.purchasesTotal.div( accountSummary.purchasesCount )" class="me-2"/>
              ( {{accountSummary.purchasesCount}} )
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Purchases Amount</label>
            <div class="col-sm-8 d-flex">
              <amount asset="currency-DOLLAR" :value="accountSummary.purchasesAmount" sign="$" />
            </div>
          </div>

        </template>

      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h4 class="card-title">LISTING Summary</h4>
      </div>
      <div class="card-body">

        <div v-if="loading" class="text-center">
          <loading-spinner class="fa-2x"/>
        </div>
        <template v-else>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Overall Listing feedback</label>
            <div class="col-sm-8 d-flex">
              <stars :score="listingSummary.count.eq(0) ? 0 : listingSummary.total.div( listingSummary.count )" class="me-2"/>
              ( {{listingSummary.count}} )
            </div>
          </div>

          <div class="row mt-3 mt-sm-0">
            <label class="col-sm-4 col-form-label">Amount</label>
            <div class="col-sm-8 d-flex">
              <amount asset="currency-DOLLAR" :value="listingSummary.amount" sign="$" />
            </div>
          </div>

        </template>

      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Update Account Summary</h4>
      </div>
      <div class="card-body">

        <div class="col-12">
          <div class="form-check form-check-inline  form-check-success">
            <input type="radio" class="form-check-input" id="purchase" value="purchase" :checked="updateType === 'purchase'" :disabled="true">
            <label class="form-check-label" for="purchase3">Purchase</label>
          </div>
          <div class="form-check form-check-inline  form-check-danger">
            <input type="radio" class="form-check-input" id="sale" value="sale" :checked="updateType === 'sale'" :disabled="true">
            <label class="form-check-label" for="sale">Sale</label>
          </div>
        </div>

        <div class="row mt-3 mt-sm-0">
          <label class="col-sm-4 col-form-label">Transacted Amount</label>
          <div class="col-sm-8 d-flex">
            <input-amount :text="null" :allow-zero="false" :init-amount="Decimal_0" :init-amount-disable="false"
                          asset="currency-DOLLAR" :spinner="false"
                          @changed="it => updateAmount = {...updateAmount, ...it}"/>
          </div>
        </div>

      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Create a new review</h4>
      </div>
      <div class="card-body">

        <div class="row">
          <label class="col-sm-4 col-form-label">Text</label>
          <div class="col-sm-8">
            <textarea class="form-control char-textarea active" rows="3" placeholder="description of the review" v-model="text"></textarea>
          </div>
        </div>

        <div class="row mt-3">
          <label class="col-sm-4 col-form-label">Score</label>
          <div class="col-sm-8">
            <input type="number" class="form-control" placeholder="given score" v-model.number="score" max="5">
          </div>
        </div>

        <alert-box class="mt-4" v-if="issues">{{issues}}</alert-box>

        <div class="col-12 d-flex justify-content-end mt-4" v-if="!this.loading">
          <loading-button :submit="submitUpdateAccountSummary" text="Update Account Summary" icon="fa fa-pencil" class="me-2" :disabled="!!issues"/>
          <loading-button :submit="submitUpdateListingSummary" text="Update Listing Summary" icon="fa fa-pencil" class="me-2" :disabled="!!issues || !listing "/>
          <loading-button :submit="submitAddReview" text="Add Review" icon="fa fa-pencil" :disabled="!!issues" />
        </div>

      </div>
    </div>

  </layout>
</template>

<script>
import Layout from "../layout/layout";
import LoadingButton from "../../components/utils/loading-button";
import LoadingSpinner from "../../components/utils/loading-spinner";
import AccountIdenticon from "src/components/utils/account-identicon";
import Stars from "src/views/reviews/stars";
import AlertBox from "../../components/utils/alert-box";
import Amount from "../../components/amount";
import InputAmount from "../../components/input-amount";

export default {
  components: {AlertBox, Layout, LoadingButton, AccountIdenticon, LoadingSpinner, Stars, Amount, InputAmount},
  data(){
    return {

      loading: true,

      accountSummary: {
        salesTotal: Decimal_0,
        salesCount: Decimal_0,
        salesAmount: Decimal_0,
        purchasesTotal: Decimal_0,
        purchasesCount: Decimal_0,
        purchasesAmount: Decimal_0,
      },
      listingSummary:{
        total: Decimal_0,
        count: Decimal_0,
        amount: Decimal_0,
      },
      updateAmount: {
        amount: Decimal_0,
        amountValidationError: "",
      },

      text: "",
      score: new Decimal(-1),
    }
  },

  computed:{
    account(){
      return this.$route.query.account||''
    },

    listing(){
      return this.$route.query.listing||''
    },

    updateType(){
      return this.$route.query.type||'purchase'
    },

    issues(){
      const score = new Decimal(this.score)
      if (this.updateAmount.amountValidationError) return this.updateAmount.amountValidationError
      if (score.lt(0)  || score.gt(5) ) return "Invalid score"
      if (this.text.length < 5) return "Invalid Text"
    },
  },

  methods:{

    async load() {

      Object.assign(this.$data, this.$options.data())

      this.$store.commit('setPage', {
        title: "Create a review"
      })

      try{

        if (!this.account) return

        const data = JSONParse(MyTextDecode(await LibertyTown.accountsSummaries.get( MyTextEncode( JSONStringify({
          account: this.account,
        })))))

        if (data) this.accountSummary = {...data}

      }catch(e){
        this.$store.dispatch('addToast', {type:"error", title:`Error loading account summary`, text: e.toString() })
      }

      try{

        if (this.listing){
          const data = JSONParse(MyTextDecode(await LibertyTown.listingsSummaries.get( MyTextEncode( JSONStringify({
            account: this.account,
            listing: this.listing,
          })))))

          if (data) this.listingSummary = {...data}
        }

      }catch(e){
        this.$store.dispatch('addToast', {type:"error", title:`Error loading listing summary`, text: e.toString() })
      }

      this.loading = false

    },

    async submitUpdateAccountSummary(){

      const score = new Decimal(this.score)

      const data = JSONParse(MyTextDecode(await LibertyTown.accountsSummaries.store(MyTextEncode( JSONStringify({
        identity: this.account,
        salesTotal: this.accountSummary.salesTotal.plus( this.updateType === 'purchase' ? 0 : score ),
        salesCount: this.accountSummary.salesCount.plus( this.updateType === 'purchase' ? 0 : 1),
        salesAmount: this.accountSummary.salesAmount.plus( this.updateType === 'purchase' ? 0 : this.updateAmount.amount ),
        purchasesTotal: this.accountSummary.purchasesTotal.plus( this.updateType === 'purchase' ? score : 0),
        purchasesCount: this.accountSummary.purchasesCount.plus( this.updateType === 'purchase' ? 1 : 0),
        purchasesAmount: this.accountSummary.purchasesAmount.plus( this.updateType === 'purchase' ? this.updateAmount.amount : 0),
      })), (data) => this.$store.state.page.validatorModal.showModal(data)) ))

      if (!data || !data.accountSummary || !data.results) throw "Account Summary Not found"
      if (data.results.eq(0)) throw "Account Summary return result is false"

      this.$store.dispatch('addToast', {type:"success", title:`Account Summary was updated`, text: "Success!" })

    },

    async submitUpdateListingSummary(){

      const score = new Decimal(this.score)

      const data = JSONParse(MyTextDecode(await LibertyTown.listingsSummaries.store(MyTextEncode( JSONStringify({
        listing: this.listing,
        total: this.listingSummary.total.plus( score ),
        count: this.listingSummary.count.plus( 1 ),
        amount: this.listingSummary.amount.plus( this.updateAmount.amount),
      })), (data) => this.$store.state.page.validatorModal.showModal(data))) )

      if (!data || !data.listingSummary || !data.results) throw "Listing Summary not found"
      if (data.results.eq(0)) throw "Listing Summary return result is false"

      this.$store.dispatch('addToast', {type:"success", title:`Listing Summary was updated`, text: "Success!" })

    },

    async submitAddReview(){

      const score = new Decimal(this.score)

      const data = JSONParse( MyTextDecode( await LibertyTown.reviews.store( JSONStringify({
        score: score,
        text: this.text,
        listing: this.listing || null,
        account: this.account || null,
        amount: this.updateAmount.amount,
      }), (data) => this.$store.state.page.validatorModal.showModal(data) ) ))

      if (!data || !data.review || !data.results) throw "Review not found"
      if (data.results.eq(0)) throw "Review return result is false"

      this.$store.dispatch('addToast', {type:"success", title:`Review was created`, text: "Success!" })

      if (this.listing) this.$router.push('/listings/view/'+this.listing)
      else this.$router.push('/accounts/view/'+this.account)

    }

  },

  watch:{
    "$route":{
      immediate: true,
      handler(to, old) {
        if (to === old) return
        this.load()
      }
    },
  }

}
</script>