<template>
  <layout>
    <div class="card">
      <div class="card-body">

        <alert-box v-if="error">{{error}}</alert-box>
        <div v-else-if="loading" class="text-center">
          <loading-spinner class="fa-2x"/>
        </div>
        <template v-else>

          <div class="row">
            <label class="col-sm-4 col-form-label">Listing type </label>
            <div class="col-sm-8">
              <div class="form-check form-check-inline">
                <input type="radio" class="form-check-input cursor-pointer" id="listing-buy" value="buy" v-model="type">
                <label class="form-check-label cursor-pointer" for="listing-buy">Buy</label>
              </div>
              <div class="form-check form-check-inline">
                <input type="radio" class="form-check-input cursor-pointer" id="listing-sell" value="sell" v-model="type">
                <label class="form-check-label cursor-pointer" for="listing-sell">Sell</label>
              </div>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-4 col-form-label">Title</label>
            <div class="col-sm-8">
              <input type="text" :class="`form-control ${title.length < LibertyTown.config.LISTING_TITLE_MIN_LENGTH ? 'is-invalid': ''}`" placeholder="these words are being used by the decentralized search" v-model="title">
              <div v-if="title.length < LibertyTown.config.LISTING_TITLE_MIN_LENGTH" class="invalid-feedback">It must contain at least {{LibertyTown.config.LISTING_TITLE_MIN_LENGTH}} chars.</div>
            </div>
          </div>

          <template v-if="type === 'sell' || $store.state.settings.expert">
            <div class="row mt-3">
              <label class="col-sm-4 form-label">Description</label>
              <div class="col-sm-8">
                <textarea class="form-control char-textarea active" rows="3" placeholder="Counter"  v-model="description"></textarea>
              </div>
            </div>
          </template>

          <div class="row mt-3">
            <label class="col-sm-4 form-label">Categories</label>
            <div class="col-sm-8">
              <multiselect :selected="categories" @add="it => categories.push(it)" text="Select category"
                           :options="$store.state.federations.dict[this.federationIdentity||$store.state.federations.selected].categoriesList"
                           @remove="it => categories.splice(categories.indexOf(it), 1)"
                           :max="LibertyTown.config.LISTING_CATEGORIES_MAX_COUNT"/>
            </div>
          </div>


          <template v-if="type === 'sell' || $store.state.settings.expert">
            <div class="row mt-3" v-for="(img, i) in images" :key="`image-${i}`">
              <label class="col-sm-4 form-label">Image {{i}}</label>
              <div class="col-md-12">
                <input type="text" class="form-control" placeholder="image url must start with https://" v-model="images[i]">
              </div>
            </div>

            <div class="row mt-3" v-if="images.length < LibertyTown.config.LISTING_IMAGES_MAX_COUNT || images.length > 1">
              <div class="col-12 d-flex justify-content-end">
                <loading-button :submit="newImage" text="Add Image" icon="fa fa-image" class-custom="btn btn-outline-primary waves-effect"/>
                <button v-if="images.length" @click="images.splice(shipping.length-1, 1)" type="button" class="btn btn-outline-primary waves-effect ms-2"><i class="fas fa-times text-danger me-2"/>Remove Last Image</button>
              </div>
            </div>
          </template>

          <template v-if="type === 'sell' || $store.state.settings.expert">
            <div class="row mt-3">
              <div class="col-sm-4 form-check">
                <input class="form-check-input ms-0 me-1" type="checkbox" id="unlimited" v-model="quantityUnlimited">
                <label class="form-check-label" for="unlimited">
                  Unlimited Quantity
                </label>
              </div>
              <div class="col-sm-8" v-if="!quantityUnlimited">
                <label class="form-label">Available Quantity</label>
                <input type="number" class="form-control" placeholder="quantity" v-model="quantityAvailable">
              </div>
            </div>
          </template>

          <div class="row mt-3" v-if="type === 'sell' || $store.state.settings.expert">
            <label class="col-sm-4 form-label">Ships from</label>
            <div class="col-sm-8">

              <multiselect :selected="shipsFrom" :max="1" :options="$countries.sorted.map( it => ({text: it.name, value: it.index}) )"
                           @add="it => shipsFrom = it" :show-badges="false" :text="shipsFrom ? shipsFrom.text : 'select country'" />

            </div>
          </div>

          <div class="row mt-3">
            <label class="col-sm-4 form-label">Ships to</label>
            <div class="col-sm-8">
              <multiselect :selected="shipsTo" :options="$countries.sorted.map( it => ({text: it.name, value: it.index}) )"
                           @add="it => shipsTo.push(it)" @remove="it => shipsTo.splice(shipsTo.indexOf(it), 1)"
                           :min="1"
                           :max="LibertyTown.config.LISTING_SHIPPING_TO_MAX_COUNT" text="Select Country"/>
            </div>
          </div>

          <div class="row mt-3" v-for="(it, key) in offers" :key="`offer-${key}`">
            <label class="col-sm-4 form-label">Offer {{key+1}} (quantity/price)</label>
            <div class="col-sm-8 d-sm-flex d-block">
              <div class="col-12 col-sm-7">
                <input type="text" :class="`form-control ${offers[key].amount.length < LibertyTown.config.LISTING_SHIPPING_MIN_LENGTH ? 'is-invalid': ''}`"  placeholder="offer option (quantity)" v-model="offers[key].amount">
                <div v-if="offers[key].amount.length < LibertyTown.config.LISTING_OFFER_MIN_LENGTH" class="invalid-feedback">It must contain at least {{LibertyTown.config.LISTING_OFFER_MIN_LENGTH}} chars.</div>
              </div>
              <div class="d-none d-sm-block col-1"></div>
              <div class="col-12 col-sm-4 mt-2 mt-sm-0">
                <input-amount :text="null" :allow-zero="false" :init-amount="it.priceInit"
                              asset="currency-DOLLAR" :spinner="false" :init-amount-disable="false"
                              @changed="a => it.price = {...it.price, ...a}"/>
              </div>
            </div>
          </div>

          <div class="row mt-3" v-if="offers.length < LibertyTown.config.LISTING_OFFERS_MAX_COUNT || offers.length >1">
            <div class="col-12 d-flex justify-content-end">
              <loading-button  v-if="offers.length < LibertyTown.config.LISTING_OFFERS_MAX_COUNT" :submit="newOffer" text="Add Offer" icon="fa fa-plus" class-custom="btn btn-outline-primary waves-effect"/>
              <button v-if="offers.length > 1" @click="offers.splice(offers.length-1, 1)" type="button" class="btn btn-outline-primary waves-effect ms-2"><i class="fas fa-times text-danger me-2"/>Remove Last Offer</button>
            </div>
          </div>

          <template v-if="type === 'sell' || $store.state.settings.expert">
            <div class="row mt-3" v-for="(it, key) in shipping" :key="`shipping-${key}`">
              <label class="col-sm-4 form-label">Shipping {{key+1}}</label>
              <div class="col-sm-8 d-sm-flex d-block">
                <div class="col-12 col-sm-7">
                  <input type="text" :class="`form-control ${shipping[key].option.length < LibertyTown.config.LISTING_SHIPPING_MIN_LENGTH ? 'is-invalid': ''}`" placeholder="shipping option" v-model="shipping[key].option">
                  <div v-if="shipping[key].option.length < LibertyTown.config.LISTING_SHIPPING_MIN_LENGTH" class="invalid-feedback">It must contain at least {{LibertyTown.config.LISTING_SHIPPING_MIN_LENGTH}} chars.</div>
                </div>
                <div class="d-none d-sm-block col-1"></div>
                <div class="col-12 col-sm-4 mt-2 mt-sm-0">
                  <input-amount :text="null" :allow-zero="true" :init-amount="it.priceInit"
                                asset="currency-DOLLAR" :spinner="false" :init-amount-disable="false"
                                @changed="a => it.price = {...it.price, ...a}"/>
                </div>
              </div>
            </div>

            <div class="row mt-3" v-if="shipping.length < LibertyTown.config.LISTING_SHIPPING_MAX_COUNT">
              <div class="col-12 d-flex justify-content-end">
                <loading-button :submit="newShipping" text="Add Shipping" icon="fa fa-plus" class-custom="btn btn-outline-primary waves-effect"/>
                <button v-if="(type === 'buy' && shipping.length) || shipping.length > 1" @click="shipping.splice(shipping.length-1, 1)" type="button" class="btn btn-outline-primary waves-effect ms-2"><i class="fas fa-times text-danger me-2"/>Remove Last Shipping</button>
              </div>
            </div>

          </template>

<!--          不再需要-->
<!--          <div class="row" v-if="!$store.state.page.accountRegistered">-->
<!--            <div class="d-flex flex-grow-1 justify-content-center align-items-center mb-2">-->
<!--              <div class="alert alert-primary" role="alert">-->
<!--                INFO: If you want to allow users to review your listings, <router-link to="/accounts/add">create an account</router-link>.-->
<!--              </div>-->
<!--            </div>-->
<!--          </div>-->

          <div class="col-12 d-flex justify-content-center mt-4">
            <loading-button :submit="submit" :text="`${this.query ? 'Save changes' : 'Publish listing'}`" icon="fa fa-share"/>
          </div>

        </template>

      </div>
    </div>
  </layout>
</template>

<script>
import Layout from "src/views/layout/layout"
import LoadingButton from "../../components/utils/loading-button";
import Multiselect from "../../components/utils/multiselect";
import LoadingSpinner from "src/components/utils/loading-spinner";
import InputAmount from "../../components/input-amount";
import CountriesHelper from "../../utils/countries-helper";
import AlertBox from "src/components/utils/alert-box";

export default {

  components: {LoadingButton, Layout, Multiselect, LoadingSpinner, InputAmount, AlertBox},

  computed: {
    query(){
      return this.$route.params.query||'';
    },
  },

  data(){
    return {
      error: "",
      title: "Title Listing",
      description: "Description",
      type: "sell",
      images: [],
      categories: [],
      federationIdentity: "",
      offers: [{amount: "", price: { amount: Decimal_1,  amountValidationError: "", }, priceInit: Decimal_1 }],
      quantityAvailable: Decimal_1,
      quantityUnlimited: true,
      listing: null,
      shipsFrom: CountriesHelper.getMultiset(244),
      shipsTo: [ CountriesHelper.getMultiset(244) ],
      shipping: [{option: "", price: { amount: Decimal_1,  amountValidationError: "", }, priceInit: Decimal_0 }],
      loading: true,
    }
  },

  methods: {

    async load(){

      try{

        Object.assign(this.$data, this.$options.data())

        this.$store.commit('setPage', {
          title: this.query ? "Update listing" : "Add new listing",
        })

        if (this.query){

          let data = JSONParse( MyTextDecode( await LibertyTown.listings.get( JSONStringify({
            listing: this.query,
          })) ))

          if (!data) throw "Not found"

          this.listing = data
          if (data.type.eq(0)) this.type = "buy"
          else if (data.type.eq(1)) this.type = "sell"
          else throw "invalid type"

          this.federationIdentity = data.federationIdentity
          this.title = data.title
          this.description = data.description
          this.quantityUnlimited = data.quantityUnlimited
          this.quantityAvailable = data.quantityAvailable
          this.shipsFrom = this.$countries.getMultiset(data.shipsFrom)
          this.shipsTo = data.shipsTo.map(it => this.$countries.getMultiset(it) )
          this.images = [...data.images]
          this.categories = data.categories.map( it => this.$store.state.federations.dict[data.federationIdentity||this.$store.state.federations.selected].categoriesDict[it] )
          this.offers = data.offers.map(it => ({amount: it.amount, price: {amount: it.price }, priceInit: it.price }))
          this.shipping = data.shipping.map(it => ({option: it.option, price: {amount: it.price }, priceInit: it.price }))
        }

      }catch(e){
        console.error(e)
        this.error = e
      }finally{
        this.loading = false
      }

    },

    async submit(){

      this.data = null

      let type
      if (this.type === "buy") type = Decimal_0
      else if (this.type === "sell") type = Decimal_1

      const quantityUnlimited = (this.type === 'sell' || this.$store.state.settings.expert) ? this.quantityUnlimited : true

      const data = JSONParse( MyTextDecode( await LibertyTown.listings.store( JSONStringify({
        type,
        title: this.title,
        description: (this.type === 'sell' || this.$store.state.settings.expert)  ? this.description : '',
        categories: this.categories.map( it => it.value ),
        quantityUnlimited : quantityUnlimited,
        quantityAvailable: quantityUnlimited ? 0 : this.quantityAvailable,
        images: this.images,
        nonce: this.query ? this.listing.nonce : null,
        shipsFrom: this.shipsFrom.value,
        shipsTo: this.shipsTo.map(it => it.value),
        offers: this.offers.map(it => ({amount: it.amount, price: it.price.amount })),
        shipping: (this.type === 'sell' || this.$store.state.settings.expert)  ? this.shipping.map(it => ({option: it.option, price: it.price.amount })) : [],
      }), (data) => this.$store.state.page.validatorModal.showModal(data) ) ))

      if (!data || !data.listing || !data.results) throw "Not found"
      if (data.results.eq(0)) throw "Return result is false"

      this.$store.dispatch('addToast', {type:"success", title:`Listing was ${this.query?'update':'created'}`, text: "Success!" })

      this.$router.push('/listings/view/'+data.listing.identity)

    },

    newImage(){
      this.images.push("")
    },

    newOffer(){
      this.offers.push({amount: "", price: { amount: Decimal_1,  amountValidationError: "" }, priceInit: Decimal_1, })
    },
    newShipping(){
      this.shipping.push({option: "", price: { amount: Decimal_1,  amountValidationError: "" }, priceInit: Decimal_0, })
    },

  },


  mounted(){
    this.load()
  },

}
</script>

