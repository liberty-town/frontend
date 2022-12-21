<template>
  <modal ref="modal" modal-class="modal-xl" modal-content-class="view-invoice-modal-content" :title="title" >
    <template v-slot:body>
      <div class="row invoice-preview">
        <div class="invoice-preview-card" v-if="data">
          <div class="card-body p-0">
            <div class="row invoice-spacing mt-0">

              <div class="col-12 col-sm-6 d-flex">
                <span class="text-secondary">BUYER</span>
                <account-identicon class="ms-1" :address="data.partialInvoice.buyer.address" :size="25" route="/chat/conversation/" @click="closeModal" />
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.partialInvoice.buyer.address, 'Buyer address')" v-tooltip.bottom="'Copy Buyer address to clipboard'"/>
              </div>
              <div class="col-12 col-sm-6 d-flex mt-1 mt-sm-0 justify-content-sm-end">
                <span class="text-secondary">SELLER</span>
                <account-identicon class="ms-1" :address="data.partialInvoice.seller.address" :size="25" route="/chat/conversation/" @click="closeModal" />
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.partialInvoice.seller.address, 'Seller address')" v-tooltip.bottom="'Copy Seller address to clipboard'"/>
              </div>

              <div class="col-12 d-flex mt-1">
                <span class="text-secondary me-1">Invoice:</span>
                <p class="card-text text-truncate">{{data.partialInvoice.id}}</p>
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.partialInvoice.id, 'Invoice Id')" v-tooltip.bottom="'Copy Invoice Id to clipboard'"/>
              </div>

              <view-invoice :items="data.proofs.purchase ? data.proofs.purchase.data.items : null"
                            :notes="data.proofs.purchase ? data.proofs.purchase.data.notes : null"
                            :shipping="data.proofs.purchase ? data.proofs.purchase.data.shipping : null"
                            :delivery="data.proofs.delivery ? data.proofs.delivery.data : null"
              />

              <div class="col-12 d-flex mt-1"  v-if="data.proofs.recipient">
                <span class="fw-bolder me-1">Recipient Address:</span>
                <span>{{data.proofs.recipient.data}}</span>
              </div>

              <div class="col-12 d-flex mt-1">
                <span class="fw-bolder me-1">Payment (TxId):</span>
                <p class="card-text text-truncate">{{data.info ? data.info.tx : data.tx}}</p>
                <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.info ? data.info.tx : data.tx, 'Payment TxId')" v-tooltip.bottom="'Copy Payment Transaction Id to clipboard'"/>
              </div>

              <!-- Invoice Note starts -->
              <div class="card-body pt-1" v-if="data.info">

                <hr class="invoice-spacing mt-1 ">

                <div class="col-12 mt-1" v-if="data.info.rejected">
                  <span class="text-danger fw-bolder me-1">Dispute Rejected:</span>
                  <i class="fas fa-times text-danger"/>
                </div>

                <div class="col-12 mt-1">
                  <span class="text-secondary me-1">Verified Tx:</span>
                  <i :class="`fas ${data.info.txVerified ? 'fa-check text-success' : 'fa-times text-danger'}`"/>
                </div>

                <div class="col-12 mt-1">
                  <span class="text-secondary me-1">Notes:</span>
                  <textarea class="form-control" rows="4" :disabled="true">{{data.info.notes}}</textarea>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </template>

    <template v-slot:footer>

      <span v-if="disputeInfo" :class="`badge ${disputeInfo.badge||'bg-primary'} text-break fs-6 p-2`">
        <i v-if="disputeInfo.icon" :class="disputeInfo.icon"/>
        {{disputeInfo.text}}
      </span>

      <div class="col-12 d-flex justify-content-end" v-if="data">

        <template v-if="whoAmI === 'moderator'">
          <loading-button class="me-1" icon="fas fa-signature" text="Update status" :submit="updateStatus" />
          <loading-button v-if="!data.resolutionSignature" class="btn-danger me-1" :disabled="!data.info || data.info.rejected || !data.info.txVerified" :submit="finalResolution" text="Final conclusion" icon="fas fa-gavel"/>
        </template>
        <template v-if="data.version.eq(1) || data.version.eq(2)">
          <loading-button v-if="data.resolution === true && whoAmI === 'seller'" :text="`${data.version.eq(2) ? 'Claim payment' : 'Claim payment again'}`" :submit="claimPayment" class="me-1 btn-success" icon="fas fa-sack-dollar" />
          <loading-button v-if="data.resolution === false && whoAmI === 'buyer'" :text="`${data.version.eq(2) ? 'Claim refunding' : 'Claim refunding again'}`" :submit="claimPayment" class="me-1 btn-success" icon="fas fa-sack-dollar" />
          <loading-button v-if="data.version.eq(2)" text="Leave Review" :submit="leaveReview" class="me-1" icon="fas fa-comment-dots"  />
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
import LoadingButton from "src/components/utils/loading-button";
import InvoiceUtils from "src/utils/invoice-utils"
import ViewInvoice from "../invoice/view-invoice"
import AccountIdenticon from "../../../components/utils/account-identicon";
import ChatInfo from "../../../utils/chat-info";

export default {

  components: {AccountIdenticon, LoadingButton, Modal, ViewInvoice},

  data() {
    return {
      data: null,
      whoAmI: "",
      whoIsTheOther: "",
      result: null,
    }
  },

  computed:{
    title(){
      if (!this.data) return ""
      switch (this.data.version.toNumber()){
        case 0: return "Step 0 - Proposed Dispute"
        case 1: return "Step 1 - Claim your funds"
        case 2: return "Step 1 - Funds were claimed by you"
        default: return "invalid"
      }
    },

    disputeInfo(){
      return ChatInfo.disputeInfo(this.data, new Decimal(5), this.whoAmI, this.whoIsTheOther )
    },

  },

  methods: {

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

    finalResolution(){
      this.result = {type: "show-propose-resolution"}
      return this.closeModal()
    },

    updateStatus(){
      this.result = {type: "update-dispute-status"}
      return this.closeModal()
    },

    async claimPayment(){

      // 验证
      if (this.whoAmI === 'buyer' && this.data.resolution !== false) throw "invalid resolution for buyer"
      if (this.whoAmI === 'seller' && this.data.resolution !== true) throw "invalid resolution for seller"

      const myResolutionSignature = Buffer.from( await LibertyTown.invoices.multisig.sign( MyTextEncode( JSONStringify({
        nonce: this.data.partialInvoice[this.whoAmI].nonce,
        txId: Buffer.from( this.data.tx, "hex").toString("base64"),
        payloadIndex: Decimal_0,
        resolution: this.data.resolution,
      })) ) ).toString("base64")

      const myMultisigPublicKey = Buffer.from( await LibertyTown.invoices.multisig.compute( MyTextEncode( JSONStringify({ nonce: this.data.partialInvoice[this.whoAmI].nonce })) )).toString("base64")

      const mod = this.$store.getters.getFederationModerator(this.data.partialInvoice.federation, this.data.partialInvoice.moderator)
      if (!mod) throw "moderator was not found"

      let multisigPublicKeys = [mod.conditionalPublicKey, myMultisigPublicKey ]
      let multisigSignatures = [this.data.resolutionSignature, myResolutionSignature ]

      if (Math.random() < 0.5){
        multisigPublicKeys = multisigPublicKeys.reverse()
        multisigSignatures = multisigSignatures.reverse()
      }

      const claimTx = JSONParse( MyTextDecode( await LibertyTown.invoices.multisig.claim( MyTextEncode( JSONStringify({
        txId: Buffer.from( this.data.tx, "hex").toString("base64"),
        payloadIndex: Decimal_0,
        resolution: this.data.resolution,
        multisigPublicKeys,
        multisigSignatures,
      })) )))

      console.log("claimTx", claimTx)

      if ( await InvoiceUtils.sendClaimTx(this.$store.state.federations.dict[this.data.partialInvoice.federation], claimTx, this.$store) === true){
        this.result = {type: "claim-payment" }
        return this.closeModal()
      }

    },

    leaveReview(){
      this.result = {type: "show-leave-review"}
      return this.closeModal()
    },

  },

}
</script>

<style>

</style>