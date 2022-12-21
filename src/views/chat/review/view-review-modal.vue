<template>
  <modal ref="modal" modal-class="modal-xl" modal-content-class="view-invoice-modal-content" :title="title" >
    <template v-slot:body>

      <div class="row invoice-preview">
        <div class="invoice-preview-card" v-if="data">
          <div class="card-body p-0">
            <div class="row invoice-spacing mt-0">

              <div class="col-12 col-sm-6 d-flex">
                <span class="text-secondary">BUYER</span>
                <account-identicon class="ms-1" :address="data.partialInvoice.buyer.address" :size="25" @click="closeModal"/>
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.partialInvoice.buyer.address, 'Buyer address')" v-tooltip.bottom="'Copy Buyer address to clipboard'"/>
              </div>
              <div class="col-12 col-sm-6 d-flex mt-1 mt-sm-0 justify-content-sm-end">
                <span class="text-secondary">SELLER</span>
                <account-identicon class="ms-1" :address="data.partialInvoice.seller.address" :size="25" @click="closeModal"/>
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.partialInvoice.seller.address, 'Seller address')" v-tooltip.bottom="'Copy Seller address to clipboard'"/>
              </div>

              <div class="col-12 d-flex mt-1">
                <span class="text-secondary me-1">Invoice:</span>
                <p class="card-text text-truncate">{{data.partialInvoice.id}}</p>
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.partialInvoice.id, 'Invoice Id')" v-tooltip.bottom="'Copy Invoice Id to clipboard'"/>
              </div>

              <view-invoice :items="data.proofs.purchase ? data.proofs.purchase.data.items : null"
                            :notes="data.proofs.purchase ? data.proofs.purchase.data.notes : null"
                            :shipping="data.proofs.purchase ? data.proofs.purchase.data.shipping : null" />

              <div class="col-12 d-flex mt-1">
                <span class="text-secondary me-1">Payment (TxId):</span>
                <p class="card-text text-truncate">{{data.tx}}</p>
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.tx, 'Payment TxId')" v-tooltip.bottom="'Copy Payment Transaction Id to clipboard'"/>
              </div>

              <div class="col-12 d-flex mt-1">
                <span class="text-secondary me-1">Score</span>
                <stars :score="data.review.score" class="fa-1x"/>
              </div>

              <div class="col-12 mt-1">
                <label class="form-label">Text</label>
                <textarea class="form-control" rows="3" placeholder="Review Text" :disabled="true">{{data.review.text}}</textarea>
              </div>

            </div>
          </div>
        </div>

      </div>

    </template>
    <template v-slot:footer>

      <span v-if="reviewInfo" :class="`badge ${reviewInfo.badge||'bg-primary'} text-break fs-6 p-2`">
        <i v-if="reviewInfo.icon" :class="reviewInfo.icon"/>
        {{reviewInfo.text}}
      </span>

      <div class="col-12 d-flex justify-content-end" v-if="data">

        <template v-if="whoAmI === 'moderator'">
          <loading-button text="Process" :submit="processReview" class="me-1 btn-primary" icon="fas fa-check" />
          <loading-button text="Reject" :submit="rejectReview" class="me-1 btn-secondary" icon="fas fa-times text-danger" />
        </template>

        <button class="btn btn-outline-secondary waves-effect" @click="closeModal">
          <i class="fas fa-ban"></i> Close
        </button>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from "src/components/utils/modal"
import LoadingButton from "src/components/utils/loading-button"
import Stars from "../../reviews/stars";
import ViewInvoice from "../invoice/view-invoice";
import AccountIdenticon from "../../../components/utils/account-identicon";
import ChatInfo from "src/utils/chat-info";

export default {

  components: {AccountIdenticon, LoadingButton, Modal, Stars, ViewInvoice},

  data() {
    return {
      data: null,
      whoAmI: "",
      whoIsTheOther: "",
      result: null,
    }
  },

  computed: {
    title() {
      if (!this.data) return ""
      switch (this.data.version.toNumber()) {
        case 0:return "Step 0 - View Review"
        case 1:return "Step 1 - Review processed"
        default:return "invalid"
      }
    },
    reviewInfo(){
      return ChatInfo.reviewInfo(this.data, new Decimal(4), this.whoAmI, this.whoIsTheOther)
    },
  },

  methods:{
    async copyText(text, title){
      await this.$copyText(text)
      this.$store.dispatch('addToast', {
        type: 'success',
        title: `Copied to clipboard successfully`,
        text: `${title} ${text} copied to clipboard`,
      })
    },
    async showModal({  data, whoAmI, whoIsTheOther }) {
      Object.assign(this.$data, this.$options.data())

      this.data = data
      this.whoAmI = whoAmI
      this.whoIsTheOther = whoIsTheOther

      await this.$refs.modal.showModal()

      return this.result
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },

    processReview(){
      this.result = {type: "process-review"}
      return this.closeModal()
    },
    rejectReview(){
      this.result = {type: "reject-review"}
      return this.closeModal()
    },
  }

}
</script>