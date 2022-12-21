<template>
  <div class="btn-group dropdown-sort">
    <button type="button" :class="`btn btn-outline-primary dropdown-toggle me-1 waves-effect ${show ? 'show' :''}`" @click="show = !show" >
      <span class="active-sorting">{{ selected }}</span>
    </button>
    <div :class="`dropdown-menu ${show ? 'show': ''}`" style="position: absolute; inset: 0px auto auto 0px; margin: 0px; transform: translate(0px, 40px);" data-popper-placement="bottom-start">
      <span v-for="(it, i) in items " :key="`item${i}`" @click="()=>changed(it, i)" class="dropdown-item" >
        {{it.name}}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    items: {default: null},
    selected: {default: null},
  },

  data(){
    return {
      show: false,
    }
  },

  methods:{
    changed(it, index){
      this.$emit('changed', { it, index })
      this.show = false
    }
  }
}
</script>