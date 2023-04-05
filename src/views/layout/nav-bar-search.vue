<!--搜索栏-->
<template>
  <div class="app-search me-2">
      <!--产品类别-->
      <multiselect v-if="$store.getters.selectedFederation" :selected="null" :max="1"
                   :options="$store.getters.selectedFederation.categoriesList"
                   @add="it => search(it)" icon="fas fa-search" :text="selected" :show-chevron="false" />
  </div>
</template>

<script>
import Multiselect from "../../components/utils/multiselect";
export default {

  components: {Multiselect},

  data(){
    return {
      selected: "",
    }
  },

  computed: {

  },

  methods: {
    search(value){
      let queryType
      if (typeof value === "object") queryType = "category"
      this.$router.push({path: `/listings/search/${ (typeof value === "object") ? value.value : value }`, query: { queryType }})
    },
  },


}
</script>

<style>
@media screen and (max-width: 480px){
  .app-search input{
    width: 100%
  }
}
</style>