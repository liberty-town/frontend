<!--搜索产品-->
<template>
  <layout>

    <div class="row" v-if="type === 'sell'">
      <div class="d-flex flex-grow-1 justify-content-center align-items-center mb-2">
        <div class="alert alert-primary" role="alert">
          INFO: If you don't find what you are looking, you can <router-link to="/listings/add">ADD YOUR BUY REQUEST</router-link>.
        </div>
      </div>
    </div>

    <div class="row" style="min-height: 500px;">
      <listings-search-bar/>

      <div class="col-lg-9">
        <show-listings v-if="list.length" :list="list" />
        <div v-if="loading" class="text-center my-3">
          <loading-spinner class="fa-2x"/>
        </div>
      </div>
    </div>

  </layout>
</template>

<script>
import Layout from "src/views/layout/layout"
import ShowListings from "./show-listings";
import LoadingSpinner from "../../components/utils/loading-spinner";
import LoadingButton from "src/components/utils/loading-button";
import ListingsSearchBar from "./listings-search-bar";

export default {
  components: {ListingsSearchBar, ShowListings, Layout, LoadingSpinner, LoadingButton},

  data(){
    return {
      list: [],
      loading: false,
      finished: false,
      start: Decimal_0,
      queryStr: null,
    }
  },

  computed: {

    query(){
      return (this.$route.params.query||'').toLowerCase();
    },

    type(){
      return (this.$route.query.type||'sell').toLowerCase();
    },

    queryType(){
      return (this.$route.query.queryType||'title').toLowerCase();
    },

  },

  methods: {
    async load(){

      this.$store.commit('setPage',{
        title: "Search",
      })

      let query = this.query.trim()

      let type, queryType

      if (this.queryType === 'title') {
        queryType = Decimal_0
        query = query.split(" ")
      }
      else if (this.queryType === 'category') {
        queryType = Decimal_1
        query = query.toLowerCase()
        if (this.$store.getters.selectedFederation.categoriesDict[query])
          query = [ this.$store.getters.selectedFederation.categoriesDict[query].value.toString() ]
      }

      if (this.type === 'buy') type = 0
      else if (this.type === 'sell') type = 1

      let shippingType = 0, shipping = 0
      if (typeof this.$route.query.shipping !== "undefined" ){
        shipping = Number.parseInt(this.$route.query.shipping || 244 )
        let shippingTypeQuery = this.$route.query.shippingType || 'to'
        if (shippingTypeQuery === 'from') shippingType = 1
        if (!shippingTypeQuery || shippingTypeQuery === 'to') shippingType = 2
      }

      const queryObject = {
        query,
        type,
        queryType,
        shippingType,
        shipping,
      }

      const queryStr = JSONStringify(queryObject)
      if ( queryStr !== this.queryStr ){
        this.finished = false
        this.loading = false
        this.start = Decimal_0
        this.queryStr = queryStr
        this.list = []
      }

      if (this.loading) return
      if (this.finished) return

      try{
        this.loading = true

        const count = await LibertyTown.listings.search( JSONStringify({
          ...queryObject,
          start: this.start,
        }), data =>{

          const it = JSONParse(MyTextDecode(data))

          if (this.queryStr === queryStr )
            this.list.push(it)

        } )

        if (this.queryStr === queryStr) {
          this.start = this.start.plus(count)
          if (count < LibertyTown.config.LISTINGS_LIST_COUNT) this.finished = true
        }

      }catch(e){
        this.$store.dispatch('addToast', {type:"error", title:"Error fetching results", text: e.toString() })
        console.error(e)
      }finally{
        if (this.queryStr === queryStr) this.loading = false
      }
    },

    infiniteScroll(){
      const y = window.pageYOffset || window.scrollTop
      const height = document.body.offsetHeight - window.innerHeight
      if ( y > height - 600) return this.load()
    },

  },

  watch: {
    $route: {
      handler(val, oldVal) {
        if (val === oldVal) return
        return this.load()
      }
    },
  },

  async mounted(){
    await this.load()
    window.addEventListener("scroll", this.infiniteScroll )
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.infiniteScroll)
  }

}
</script>