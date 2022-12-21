<template>
  <modal ref="modal" title="Initiate Resolution" >
    <template v-slot:body>

      <div class="row ">
        <div class="col-12  d-flex">
          <span class="fw-bolder">Payment TxId:</span>
          <span class="ms-1 text-break">{{txId}}</span>
        </div>
      </div>

      <div class="form-check form-check-inline mt-2">
        <input class="form-check-input" type="radio" id="refund-buyer" value="refundBuyer" v-model="type" :disabled="disableOption==='refund-buyer'">
        <label class="form-check-label" for="refund-buyer">Refund buyer</label>
      </div>

      <div class="form-check form-check-inline mt-1">
        <input class="form-check-input" type="radio" id="confirm-goods" value="confirmGoods" v-model="type" :disabled="disableOption==='confirm-goods'">
        <label class="form-check-label" for="confirm-goods">Confirm goods as received</label>
      </div>

      <div class="row mt-2" v-if="whoAmI === 'moderator'">
        <div class="col-12">
          <label class="form-label">Multisig Private Key</label>
          <textarea :class="`form-control ${$validator.validateBase64(privateKey) ? 'is-invalid': ''}`" rows="3" placeholder="Multisig Private Key" v-model="privateKey"/>
          <div v-if="$validator.validateBase64(privateKey)" class="invalid-feedback">{{$validator.validateBase64(privateKey)}}</div>
        </div>
      </div>

    </template>

    <template v-slot:footer>
      <loading-button class="btn-danger" :disabled="!!hasErrors" :submit="sendResolution" :text="text" icon="fas fa-save"/>
      <button class="btn btn-outline-primary" type="button" @click="closeModal">
        <i class="fas fa-ban"></i> Close
      </button>
    </template>

  </modal>
</template>
<script>
import Modal from "src/components/utils/modal"
import LoadingButton from "src/components/utils/loading-button";
export default {

  components:{Modal, LoadingButton},

  data(){
    return {
      type: "",
      whoAmI: "",
      txId: "",
      result: null,
      privateKey: "",
      text: "Send Resolution",
      disableOption: "",
    }
  },

  computed: {
    hasErrors(){
      if (!this.type) return "no type"
      if (this.whoAmI === 'moderator' && (!this.privateKey || this.$validator.validateBase64(this.privateKey))) return "invalid private key"
      return ""
    }
  },

  methods:{
    async showModal({ txId, whoAmI, resolution}) {
      Object.assign(this.$data, this.$options.data())

      this.txId = txId
      this.whoAmI = whoAmI

      if (resolution !== undefined)
        if (resolution) {
          this.type = "confirmGoods"
          this.text = "Confirm goods as received"
          this.disableOption = "refund-buyer"
        }
        else {
          this.type = "refundBuyer"
          this.text = "Refund Buyer"
          this.disableOption = "confirm-goods"
        }

      await this.$refs.modal.showModal()

      return this.result
    },

    sendResolution(){
      this.result = {type: "proposed-resolution",
        resolution: this.type === "confirmGoods",
        privateKey: this.whoAmI === 'moderator' ? this.privateKey : null
      }
      return this.closeModal()
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },
  }

}
</script>