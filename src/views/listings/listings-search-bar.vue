<template>
  <div class="col-lg-3">
    <div class="card">
      <div class="card-body">

        <div class="">

          <h5 class="font-size-14 mb-3">Listings</h5>
          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="sell" value="sell" v-model="type">
            <label class="form-check-label" for="sell">Sell offers</label>
          </div>

          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="buy" value="buy" v-model="type">
            <label class="form-check-label" for="buy">Buy offers</label>
          </div>

        </div>

        <div class="mt-4">

          <h5 class="font-size-14 mb-3">Shipping</h5>
          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="shippingTypeFrom" value="from" v-model="shippingType">
            <label class="form-check-label" for="shippingTypeFrom">Ships From</label>
          </div>

          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="shippingTypeTo" value="to" v-model="shippingType">
            <label class="form-check-label" for="shippingTypeTo">Ships To</label>
          </div>

          <div class="multiselect mt-2">
            <multiselect :selected="shipping" :max="1" :options="countriesMultiselect"
                         @add="it => shipping = (it && it.value !== null) ? it : null" :show-badges="false" :text="shipping ? shipping.text : 'select country'" />
          </div>


        </div>

        <div class="mt-4">
          <h5 class="font-size-14 mb-3">Search by</h5>
          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="category" value="category" v-model="queryType">
            <label class="form-check-label" for="category">Category</label>
          </div>

          <div class="multiselect mt-2" v-if="queryType === 'category'">
            <multiselect :selected="queryCategory" @add="it => queryCategory=it"
                         :options="$store.getters.selectedFederation.categoriesList" :show-badges="false"
                         :text="queryCategory ? queryCategory.name : 'select category'"
                         :max="-1" />
          </div>

          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="title" value="title" v-model="queryType">
            <label class="form-check-label" for="title">Title</label>
          </div>

          <div class="search-box mt-2"  v-if="queryType === 'title'">
            <div class="position-relative">
              <input type="text" class="form-control border-0" placeholder="Search..." v-model="query"  v-on:keyup.enter="find">
              <i class="fas fa-pen search-icon"></i>
            </div>
          </div>

        </div>

        <div class="mt-4 text-center">
          <button type="button" class="btn btn-primary waves-effect waves-light mt-2 me-1" @click="find"
                  :disabled="!( queryType === 'category' && queryCategory || queryType === 'title') ">
            <i class="fas fa-search me-2"></i> Find Offers
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script>
import Multiselect from "../../components/utils/multiselect";
import Dropdown from "../../components/utils/dropdown";
import CountriesHelper from "../../utils/countries-helper";
export default {

  components: {Dropdown, Multiselect},

  data(){
    return {
      countriesMultiselect: [ {text: "select country", value: null }, ...this.$countries.sortedMultiselect ],
      ...this.update(),
    }
  },

  watch: {
    $route: {
      handler(val, oldVal) {
        if (val === oldVal) return
        const x = this.update(val)
        for (const key in x )
          this[key] = x[key]
      }
    },
  },

  methods:{

    update(val = this.$route){
      return {
        type : (val.query.type||'sell').toLowerCase(),
        query : (val.query.queryType === 'category' ? '' : val.params.query||'').toLowerCase(),
        queryType : (val.query.queryType||'title').toLowerCase(),
        queryCategory : val.query.queryType === 'category' ? this.$store.getters.selectedFederation.categoriesDict[val.params.query] : null,
        shippingType : val.query.shippingType || 'to',
        shipping : CountriesHelper.getMultiset(val.query.shipping),
      }
    },

    find(){
      if ( ( this.queryType === 'category' && this.queryCategory) || this.queryType === 'title' ) {

        const query = {
            queryType: this.queryType,
            type: this.type,
        }

        if (this.shipping) {
          query.shipping = this.shipping.value
        }

        if (this.shippingType !== "to")
          query.shippingType = this.shippingType

        return this.$router.push({
          path: `/listings/search/${this.queryType === 'category' ? this.queryCategory.value : this.query.trim()}`,
          query
        })
      }
    }
  },

}
</script>

<style scoped>
.search-box input{
  background-color: #f7f7f9;
}

.multiselect ::v-deep( input ){
  width: 100%;
}
.multiselect ::v-deep( .dropdown-menu.show ){
  top: auto !important;
  margin-top: 40px !important;
}

</style>
