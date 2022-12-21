<!--警报-->
<template>
  <div id="toast-container" class="toast-container toast-bottom-left">
    <div :class="`toast toast-${it.type} d-block`" v-for="(it, key) in $store.state.toasts.list" :key="`toast${key}`">
      <div class="toast-title" v-if="it.title">{{ it.title }}</div>
      <div class="toast-message" v-if="it.text">{{it.text}}</div>
    </div>
  </div>
</template>

<script>
export default {

  methods:{
  }

}
</script>

<style scoped>
.toast{
  opacity: 0.225;
  width: 350px;
}
</style>