<template>
  <div class="col-lg-3">
    <div class="card">
      <div class="card-body">

        <div class="">
          <h5 class="font-size-14 mb-3">Search by</h5>
          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="keyword" value="keyword" v-model="queryType">
            <label class="form-check-label" for="keyword">Keyword</label>
          </div>

          <div class="form-check mt-2">
            <input class="form-check-input" type="radio" id="title" value="title" v-model="queryType">
            <label class="form-check-label" for="title">Title</label>
          </div>

          <div class="search-box mt-2">
            <div class="position-relative">
              <input type="text" class="form-control border-0" placeholder="Search..." v-model="query" v-on:keyup.enter="find">
              <i class="fas fa-pen search-icon text-muted"></i>
            </div>
          </div>

        </div>

        <div class="mt-4 text-center">
          <button type="button" class="btn btn-primary waves-effect waves-light mt-2 me-1" @click="find">
            <i class="fas fa-search me-2"></i> Find Threads
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
    update(val = this.$route) {
      return {
        query: ( val.params.query||'').toLowerCase(),
        queryType: (val.query.queryType||'title').toLowerCase(),
      }
    },
    find(){
      return this.$router.push({path: `/forum/search/${ this.query.trim()}`, query: { queryType: this.queryType }})
    }
  },

}
</script>

<style scoped>
.search-box input{
  background-color: #f7f7f9;
}

</style>
