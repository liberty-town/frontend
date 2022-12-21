<template>

  <component :is="type" :to="uri" v-tooltip.bottom="`${ tooltip}`" :class="`${uri ? 'cursor-pointer' : '' }`">
    <img v-if="identiconSrc" :src="identiconSrc" class="identicon" :style="`width: ${size}px`" >
  </component>

</template>

<script>

import Identicons from "src/utils/identicons"
export default {

  props:{
    size: {default: 40},
    outerSize: {default: 34},

    uri: {default: ""},
    hash: {default: null},

    tooltip: {default: ""}
  },

  computed:{
    type(){
      if ( !this.uri ) return "span"
      return "router-link"
    }
  },

  data(){
    return{
      identiconSrc: "",
    }
  },

  methods:{
    async load(){
      try{
        if (!this.hash) throw "invalid"
        this.identiconSrc = await Identicons.getIdenticon( this.hash, this.size )
      }catch(err){
        this.identiconSrc = ""
      }
    },
  },

  watch:{
    hash:{
      immediate: true,
      handler (val, oldVal) {
        if (val === oldVal) return
        return this.load()
      }
    }
  },

}
</script>

<style scoped>
.identicon{
  display: inline-table;
}
</style>
