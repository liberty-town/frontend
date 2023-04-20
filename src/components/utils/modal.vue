<template>
  <div :class="`modal fade ${show ? 'show': ''}`" :style="`display: ${show ? 'block' :  'none'};`" >
    <div :class="`modal-dialog modal-dialog-centered ${modalClass}`">
      <div :class="`modal-content ${modalContentClass}`" >
        <div class="modal-header">
          <h4 class="m-0">{{ title }}</h4>
          <button v-if="closeButton" type="button" class="btn-close" @click="closeModal"></button>
        </div>
        <div v-if="hasBodySlot" class="modal-body">
          <slot name="body"/>
        </div>
        <div v-if="hasFooterSlot" class="modal-footer">
          <slot name="footer"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {

  data(){
    return {
      show: false,
      promise: null,
      resolve: null,
    }
  },

  props: {
    modalClass: {default: ''},
    modalContentClass: {default: ''},
    title: {default: "title"},
    closeButton: {default: true},
  },

  computed: {
    hasBodySlot() {
      return !!this.$slots['body']
    },
    hasFooterSlot() {
      return !!this.$slots['footer']
    }
  },

  methods:{

    showModal(cbReady){
      this.promise = new Promise((resolve, reject)=>{
        this.resolve = resolve
      })

      this.show = true
      this.$store.commit('setModalVisibility', true )

      if (cbReady) {
        this.$nextTick(async ()=> {
          await cbReady()
        })
      }

      return this.promise
    },

    closeModal(){
      this.show = false
      document.body.classList.remove('modal-open')
      document.getElementById('foreground').classList.remove('show')
      document.getElementById('foreground').classList.remove('modal-backdrop')
      document.getElementById('foreground').classList.remove('fade')

      if (this.resolve) this.resolve()
    }

  }
}
</script>

<style scoped>
.modal-dialog {
  width: auto;
}
</style>
