<template>
  <modal ref="modal" title="Start a new Conversation">
    <template v-slot:body>
      <div class="col-12">
        <label class="form-label pe-1">Receiver address</label>
        <div>
          <div class="receiver">
            <account-identicon :address="receiver" class="d-inline-block" :size="32" route="" @click="closeModal" />
            <input type="text" class="form-control" placeholder="receiver chat address" v-model="receiver">
          </div>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div>
        <div class="col-12 text-center">
          <button class="btn btn-primary me-1 mt-1 waves-effect waves-float waves-light" :disabled="!receiver" @click="submit">Submit</button>
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
import AccountIdenticon from "../../components/utils/account-identicon";
export default {
  components: {AccountIdenticon, Modal},

  data(){
    return {
      receiver: "",
    }
  },

  computed:{

  },

  methods: {
    async showModal() {
      Object.assign(this.$data, this.$options.data())

      await this.$refs.modal.showModal()

      return this.result
    },
    closeModal(){
      this.$refs.modal.closeModal()
    },
    submit(){
      this.result = this.receiver
      this.closeModal()
    },
  },
}
</script>

<style scoped>
.receiver{
  display: grid;
  grid-template-columns: 40px 1fr;
}
</style>