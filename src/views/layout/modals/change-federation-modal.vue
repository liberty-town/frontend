<template>
  <modal ref="modal" title="Change Federation">
    <template v-slot:body>
      <div class="d-flex flex-wrap align-items-center">
        <label class="form-label me-2">Selected Federation</label>
        <multiselect :selected="fed" :max="1" :options="options" @add="it => fed = it" :show-badges="false" :text="fed ? fed.text : 'select federation'" />
      </div>
    </template>
    <template v-slot:footer>
      <div>
        <div class="col-12 text-center">
          <button class="btn btn-primary me-1 mt-1 waves-effect waves-float waves-light" :disabled="!fed" @click="submit">
            <i class="fas fa-share"></i>
            Change Federation
          </button>
          <button class="btn btn-outline-secondary mt-1 waves-effect" @click="closeModal">
            <i class="fas fa-ban"></i>
            Cancel
          </button>
        </div>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from "src/components/utils/modal"
import Multiselect from "src/components/utils/multiselect";
export default {
  components: {Multiselect, Modal },
  data(){
    return {
      fed: null,
    }
  },
  computed:{
    options(){
      return Object.values( this.$store.state.federations.dict ).map( it => ({text: it.name, value: it.ownership.address }))
    }
  },
  methods:{
    async showModal(){
      Object.assign(this.$data, this.$options.data())

      if (this.$store.state.federations.selected){
        this.fed = {text: this.$store.getters.selectedFederation.name, value: this.$store.state.federations.selected }
      }

      await this.$refs.modal.showModal()
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },
    submit(){
      if (this.fed) this.$store.dispatch('SetSelectedFederation', this.fed.value )
      this.closeModal()
    },
  },
}
</script>