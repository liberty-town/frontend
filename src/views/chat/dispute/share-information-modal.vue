<template>
  <modal ref="modal" title="What kind of information to share" >
    <template v-slot:body>

      <div class="row">
        <div class="col-12">
          <div class="form-check">
            <input type="checkbox" class="form-check-input cursor-pointer" id="include-items" v-model="includeItems">
            <label class="form-check-label cursor-pointer" for="include-items">Include Invoice Items, Notes, Shipping (cost)</label>
          </div>
        </div>
        <div class="col-12 mt-1">
          <div class="form-check">
            <input type="checkbox" class="form-check-input cursor-pointer" id="include-delivery" v-model="includeDelivery">
            <label class="form-check-label cursor-pointer" for="include-delivery">Include Delivery</label>
          </div>
        </div>
        <div class="col-12 mt-1">
          <div class="form-check">
            <input type="checkbox" class="form-check-input cursor-pointer" id="include-recipient" v-model="includeRecipient">
            <label class="form-check-label cursor-pointer" for="include-recipient">Include Recipient Address</label>
          </div>
        </div>
      </div>

    </template>

    <template v-slot:footer>
      <div class="col-12 d-flex justify-content-end">
        <button class="btn btn-outline-primary waves-effect me-1" @click="accept">
          <i class="fas fa-share"></i> Confirm
        </button>
        <button class="btn btn-outline-secondary waves-effect" @click="closeModal">
          <i class="fas fa-ban"></i> Close
        </button>
      </div>
    </template>

  </modal>
</template>

<script>
import Modal from "src/components/utils/modal"
export default {

  components: {Modal},

  data(){
    return {
      includeItems: false,
      includeDelivery: false,
      includeRecipient: false,
      result: null,
    }
  },

  methods:{
    async showModal() {
      Object.assign(this.$data, this.$options.data())

      await this.$refs.modal.showModal()

      return this.result
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },

    accept(){
      this.result = {
        includeItems: this.includeItems,
        includeDelivery: this.includeDelivery,
        includeRecipient: this.includeRecipient,
      }
      this.closeModal()
    }
  }

}
</script>