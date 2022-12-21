<template>
  <div>
    <span class="ratings-list-item" v-for="(_, i) in new Array(5)" :key="`start-${i}`" @click="()=>$emit('submit', i)">
      <i :class="getIcons[i]"/>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    score: {default: Decimal_1 },
  },
  computed:{
    getIcons(){
      const v = new Array(5)
      for (let i=0; i < 5; i++){
        const j = new Decimal(i)
        if (j.lt(this.score) && j.plus(0.5).lt(this.score) ) v[i] = "fa-solid fa-star text-warning"
        else if (j.lt(this.score) && j.plus(0.5).gte(this.score) ) v[i] = "fa-solid fa-star-half-stroke text-warning"
        else v[i] = "fa-regular fa-star text-warning"
      }
      return v
    },
  }
}
</script>