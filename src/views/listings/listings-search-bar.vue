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
          <h5 class="font-size-14 mb-3">Search by</h5>
          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="category" value="category" v-model="queryType">
            <label class="form-check-label" for="category">Category</label>
          </div>

          <div class="category mt-2" v-if="queryType === 'category'">
            <multiselect :selected="queryCategory" @add="it => this.queryCategory=it"
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
export default {

  components: {Dropdown, Multiselect},

  data(){
    return {
      type: (this.$route.query.type||'sell').toLowerCase(),
      query: (this.$route.query.queryType === 'category' ? '' : this.$route.params.query||'').toLowerCase(),
      queryType: (this.$route.query.queryType||'title').toLowerCase(),
      queryCategory: this.$route.query.queryType === 'category' ? this.$store.getters.selectedFederation.categoriesDict[this.$route.params.query] : null,
    }
  },

  watch: {
    $route: {
      handler(val, oldVal) {
        if (val === oldVal) return

        this.type = (this.$route.query.type||'sell').toLowerCase()
        this.query = (this.$route.query.queryType === 'category' ? '' : this.$route.params.query||'').toLowerCase()
        this.queryType = (this.$route.query.queryType||'title').toLowerCase()
        this.queryCategory = this.$route.query.queryType === 'category' ? this.$store.getters.selectedFederation.categoriesDict[this.$route.params.query] : null
      }
    },
  },

  methods:{
    find(){
      if ( ( this.queryType === 'category' && this.queryCategory) || this.queryType === 'title' )
        return this.$router.push({path: `/listings/search/${this.queryType === 'category' ? this.queryCategory.value :  this.query.trim()}`, query: { queryType: this.queryType, type: this.type }})
    }
  },

}
</script>

<style scoped>
.search-box input{
  background-color: #f7f7f9;
}

.category ::v-deep( input ) {
  width: 100%;
}
.category ::v-deep( .dropdown-menu.show ){
  top: auto !important;
  margin-top: 40px !important;
}

</style>
