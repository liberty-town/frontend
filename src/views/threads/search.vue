<!--搜索产品-->
<template>
  <layout>

    <div class="row" >
      <threads-search-bar/>

      <div class="col-lg-9">
        <show-threads v-if="list.length" :list="list" />
        <div v-if="loading" class="text-center my-3">
          <loading-spinner class="fa-2x"/>
        </div>
      </div>
    </div>

  </layout>
</template>

<script>
import Layout from "src/views/layout/layout"
import LoadingSpinner from "../../components/utils/loading-spinner";
import LoadingButton from "src/components/utils/loading-button";
import ShowThreads from "./show-threads";
import ThreadsSearchBar from "./threads-search-bar";

export default {
  components: {ThreadsSearchBar, ShowThreads, Layout, LoadingSpinner, LoadingButton},

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

    queryType(){
      return (this.$route.query.queryType||'title').toLowerCase();
    },

  },

  methods: {
    async load(){

      this.$store.commit('setPage',{
        title: "Forum",
      })

      let query = this.query.trim()

      let queryType

      if (this.queryType === 'title') {
        queryType = Decimal_0
        query = query.split(" ")
      }
      else if (this.queryType === 'keyword') {
        queryType = Decimal_1
        query = [ query.toLowerCase() ]
      }

      const queryObject = {
        query,
        queryType,
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

        const count = await LibertyTown.threads.search( JSONStringify({
          ...queryObject,
          start: this.start,
        }), data =>{

          const it = JSONParse(MyTextDecode(data))

          if (this.queryStr === queryStr)
            this.list.push(it)

        } )

        if (this.queryStr === queryStr) {
          this.start = this.start.plus(count)
          if (count < LibertyTown.config.THREADS_LIST_COUNT) this.finished = true
        }

      }catch(e){
        this.$store.dispatch('addToast', {type:"error", title:"Error fetching results", text: e.toString() })
        console.error(e)
      }finally{
        if (this.queryStr === queryStr) this.loading = false
      }
    },

    queryTypeChanged(e){
      this.$router.push({path: '/forum/search/'+this.query, query: {
          ...this.$route.query,
          queryType: e.target.value,
        } })
    },

    infiniteScroll(){
      const y = window.pageYOffset || window.scrollTop
      const height = document.body.offsetHeight - window.innerHeight
      if ( y > height - 600) return this.load()
    },

  },

  watch: {
    query:{
      handler(val, oldVal) {
        if (val === oldVal) return
        this.load()
      }
    },
    type: {
      handler(val, oldVal) {
        if (val === oldVal) return
        this.load()
      }
    }
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