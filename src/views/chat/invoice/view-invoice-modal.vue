<template>
  <modal ref="modal" modal-class="modal-xl" modal-content-class="view-invoice-modal-content" :title="title" >
    <template v-slot:body>
      <div class="row invoice-preview">
        <div class="invoice-preview-card" v-if="data">
          <div class="card-body p-0">
            <div class="row invoice-spacing mt-0">

              <div class="col-12 col-sm-6">
                <div class="col-lg-12 col-sm-6 d-flex">
                  <div class="col-lg-6 col-12">
                    <span class="text-secondary me-2">SELLER</span>
                    <account-identicon :address="data.invoice.seller.address" :size="25" route="/chat/conversation/" @click="closeModal" />
                  </div>
                  <div class="col-lg-6 col-sm-12" v-if="data.invoice.moderator">
                    <span class="text-secondary me-2">MODERATOR</span>
                    <account-identicon v-if="data.invoice.moderator" :address="data.invoice.moderator" :size="25" route="/chat/conversation/" @click="closeModal" />
                  </div>
                </div>
                <div class="col-lg-12 col-12">
                  <span class="text-secondary me-2">BUYER</span>
                  <account-identicon :address="data.invoice.buyer.address" :size="25" route="/chat/conversation/" @click="closeModal" />
                </div>
              </div>

              <div class="col-12 col-sm-6">
                <div v-if="data.invoice.id" class="d-flex mb-1" >
                  <span class="text-secondary me-2">Invoice:</span>
                  <span class="card-text text-truncate">{{data.invoice.id}}</span>
                  <i class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.invoice.id, 'Invoice Id')" v-tooltip.bottom="'Copy Invoice Id to clipboard'"/>
                </div>
                <div class="d-flex mb-1" >
                  <span class="text-secondary me-2">Date:</span>
                  <span class="card-text text-truncate">{{dateString}}</span>
                </div>
              </div>

              <div class="col-12" v-if="$store.state.settings.expert">
                <div class="d-flex mb-1" >
                  <span class="text-secondary me-2">Recipient</span>
                  <span class="card-text text-truncate">{{data.invoice.seller.recipient}}</span>
                </div>
              </div>

            </div>
          </div>

          <view-invoice :items="data.invoice.items" :delivery="data.invoice.delivery" :notes="data.invoice.notes" :shipping="data.invoice.shipping" />

          <div class="card-body pt-2">

            <div v-if="data.version.gte(1) || data.invoice.buyer.nonce" class="col-12">
              <div class="d-flex mb-1">
                <span class="me-1">Now it is worth:</span>
                <template v-if="conversionAmountBackToCurrency">
                  <amount asset="currency-DOLLAR" :value="conversionAmountBackToCurrency" class="fw-bolder me-2" sign="$"/>
                  (diff <amount asset="currency-DOLLAR" :value="totalDiff" :class="`fw-bolder ${totalDiffSignColor} ms-1 me-2`" :sign="`${totalDiffSign}$`"/> )
                </template>
                <loading-button ref="btnConvertAmountBackToCurrency"  icon="fas fa-calculator" :submit="convertAmountBackToCurrency" text="" class-custom="btn btn-soft-primary waves-effect waves-light btn-sm" tooltip="Calculate how much is it worth" />
              </div>
              <div class="d-flex mb-1" >
                <span class="text-secondary me-2">
                  {{whoAmI === 'buyer' ? 'Total to pay:' : 'Total to receive:'}}
                </span>
                <amount :asset="'asset-'+data.invoice.buyer.conversionAsset" :value="data.invoice.buyer.conversionAmount" class="fw-bold me-2"/>
                <span class="fw-bold me-2">{{data.invoice.buyer.conversionAsset}}</span>
              </div>
            </div>

            <div class="row pb-1" v-if="data.version.gte(2)" >
              <hr class="border-top"/>
              <div class="col-12  d-flex">
                <span class="fw-bolder">Payment TxId:</span>
                <span class="ms-1 text-break">{{data.tx}}</span>
                <i v-if="data.tx" class="fas fa-copy ms-1 cursor-pointer" @click="()=>copyText(data.tx, 'Payment TxId')" v-tooltip.bottom="'Copy Payment Transaction Id to clipboard'"/>
              </div>
            </div>

            <div class="col-12 col-md-6" v-if="data.version.eq(0) && whoAmI === 'buyer' && !data.invoice.buyer.conversionAsset">
              <div class="d-flex">
                <span class="text-secondary me-2">Total: </span>
                <amount :decimal-separator="Decimal_2" :value="total" sign="$" class="fw-bold" />
              </div>
              <div class="d-flex mt-2" v-if="whoAmI === 'buyer'">
                <span class="text-secondary me-2">Pay using: </span>
                <select class="form-select form-select-solid" style="max-width: 200px" v-model="conversionAsset" @change="conversionAmount=Decimal_0">
                  <option v-for="(asset, key) in this.$store.getters.selectedFederation.acceptedAssets" :key="`create-invoice-asset-${key}`"
                          :value="asset">
                    {{asset}}
                  </option>
                </select>
              </div>
              <div class="d-flex mt-2" v-if="whoAmI === 'buyer'">
                <span class="text-secondary me-2">Total to pay: </span>
                <amount :asset="'asset-'+conversionAsset" :value="conversionAmount" class="fw-bolder me-2" />
                <span class="fw-bolder me-2">{{conversionAsset}}</span>
                <loading-button icon="fas fa-calculator" :submit="convertTotal" text="" class-custom="btn btn-soft-primary waves-effect waves-light btn-sm" tooltip="Calculate how many tokens you have to pay" />
              </div>
            </div>

          </div>
          <!-- Invoice Note ends -->

        </div>
      </div>
    </template>

    <template v-slot:footer>

      <span v-if="invoiceInfo" :class="`badge ${invoiceInfo.badge||'bg-primary'} text-break fs-6 p-2`">
        <i v-if="invoiceInfo.icon" :class="invoiceInfo.icon"/>
        {{invoiceInfo.text}}
      </span>

      <div class="col-12 d-flex justify-content-end" v-if="data">

        <loading-button v-if="data.version.eq(0) && !data.invoice[whoAmI].multisig" class="me-1" icon="fas fa-signature" text="Accept Invoice" :submit="acceptInvoice" />
        <loading-button v-if="data.version.eq(1) && !data.invoice[whoAmI].signature" class="me-1" icon="fas fa-signature" text="Confirm Invoice" :submit="confirmInvoice" />
        <loading-button v-if="data.version.eq(2) && whoAmI === 'buyer'" class="me-1" icon="fas fa-credit-card" text="Pay Invoice" :submit="()=>payInvoice(true)" />

        <template v-if="data.version.eq(3)">
          <template v-if="$store.state.settings.expert">
            <loading-button v-if="whoAmI === 'buyer'" class="me-1 btn-danger" icon="fas fa-credit-card" text="Pay again" :submit="()=>payInvoice(true)" />
            <loading-button v-if="whoAmI === 'buyer'" class="me-1" icon="fas fa-credit-card" text="Update Payment" :submit="()=>payInvoice(false)" />
            <loading-button v-if="whoAmI === 'seller'" class="me-1" icon="fas fa-credit-card" text="Provide Payment TxId if you know" :submit="()=>payInvoice(false)" />
          </template>
          <loading-button v-if="whoAmI === 'seller'" class="me-1" icon="fas fa-check" text="Confirm Payment" :submit="confirmPayment" />
        </template>

        <template v-if="$utils.bigNumberInList(data.version, [3, 4])">
          <loading-button class="me-1 btn-warning" icon="fas fa-gavel" text="Dispute Moderator" :submit="disputeModerator" />
        </template>

        <template v-if="data.version.eq(4)">
          <loading-button v-if="whoAmI === 'buyer'" class="me-1 btn-danger" icon="fas fa-money-bill-transfer" text="Confirm goods when received" :submit="proposeResolution" />
          <loading-button v-if="whoAmI === 'seller'" class="me-1 btn-danger" icon="fas fa-money-bill-transfer" text="Refund buyer" :submit="proposeResolution" />
        </template>

        <template v-if="data.version.eq(5) || data.version.eq(6)">
          <loading-button v-if="data.resolution === true && whoAmI === 'seller'" :text="`${data.version.eq(5) ? 'Claim payment' : 'Claim payment again'}`" :submit="claimPayment" class="me-1 btn-success" icon="fas fa-sack-dollar" />
          <loading-button v-if="data.resolution === false && whoAmI === 'buyer'" :text="`${data.version.eq(5) ? 'Claim refunding' : 'Claim refunding again'}`" :submit="claimPayment" class="me-1 btn-success" icon="fas fa-sack-dollar" />
          <loading-button text="Leave Review" :submit="leaveReview" class="me-1" icon="fas fa-comment-dots" />
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
import AlertBox from "src/components/utils/alert-box"
import LoadingButton from "src/components/utils/loading-button";
import InvoiceUtils from "src/utils/invoice-utils"
import ViewInvoice from "./view-invoice";
import AccountIdenticon from "src/components/utils/account-identicon";
import ChatInfo from "src/utils/chat-info"
import Amount from "src/components/amount";

export default {

  components: {AccountIdenticon, ViewInvoice, LoadingButton,  Modal, AlertBox, Amount},

  data() {
    return {
      data: null,
      whoAmI: "",
      whoIsTheOther: "",
      result: null,
      conversionAsset: "PCASH",
      conversionAmount: Decimal_0,
      conversionAmountBackToCurrency: null,
    }
  },

  computed:{

    total(){
      if (!this.data.invoice || !this.data.invoice.items) return Decimal_0
      return InvoiceUtils.calculateInvoiceTotal(this.data.invoice.items, this.data.invoice.shipping)
    },

    title(){
      if (!this.data) return ""
      if (this.data.version.eq(0)) return "Step 1 - Draft Invoice"
      if (this.data.version.eq(1)) return "Step 2 - Draft Invoice"
      if (this.data.version.eq(2)) return "Step 3 - Confirmed Invoice"
      if (this.data.version.eq(3)) return "Step 4 - Payment"
      if (this.data.version.eq(4)) return "Step 5 - View Payment"
      if (this.data.version.eq(5)) return "Step 6 - Resolution"
      if (this.data.version.eq(6)) return "Step 7 - Final"
      return "invalid"
    },

    dateString(){
      if (!this.data) return
      return new Date(this.data.invoice.date.toNumber()).toDateString()
    },

    deadlineDays(){
      if (!this.data) return
      return InvoiceUtils.calculateDeadlineSeconds(this.data.invoice.deadline).div(24*60*60)
    },

    deadlineString(){
      if (!this.data) return
      return this.$strings.timeSince( new Date().getTime() - InvoiceUtils.calculateDeadlineSeconds(this.data.invoice.deadline).mul(1000).toNumber() )
    },

    invoiceInfo(){
      return ChatInfo.invoiceInfo(this.data, new Decimal(3), this.whoAmI, this.whoIsTheOther)
    },

    totalDiff(){
      if (!this.conversionAmountBackToCurrency || !this.total) return Decimal_0
      return this.total.minus(this.conversionAmountBackToCurrency)
    },

    totalDiffSign(){
      if (!this.totalDiff) return
      const sign = this.totalDiff.cmp(0)
      if (sign === 1) return this.whoAmI === 'buyer' ? '+' : '-'
      if (sign === -1) return this.whoAmI === 'seller' ? '-' : '+'
    },

    totalDiffSignColor(){
      if (!this.totalDiff) return
      const sign = this.totalDiff.cmp(0)
      if (sign === 1) return this.whoAmI === 'buyer' ? 'text-success' : 'text-danger'
      if (sign === -1) return this.whoAmI === 'seller' ? 'text-danger' : 'text-success'
    }

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

    async showModal({ data, whoAmI, whoIsTheOther}) {
      Object.assign(this.$data, this.$options.data())

      this.data = data
      this.whoAmI = whoAmI
      this.whoIsTheOther = whoIsTheOther

      this.$nextTick(()=>{
        if (data.version.gte(1) || data.invoice.buyer.nonce)
          this.$refs.btnConvertAmountBackToCurrency.handleClick()
      })

      await this.$refs.modal.showModal()

      return this.result
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },

    async acceptInvoice(){

      if (this.whoAmI === 'seller')
        if (!this.$store.state.settings.seller.recipient) throw "You need to set the Seller Address in the Settings Page"

      let conversion
      if (this.data.version.eq(0) && this.whoAmI === 'buyer'){
        await this.convertTotal()
        conversion = {
          conversionAsset: this.conversionAsset,
          conversionAmount: this.conversionAmount,
        }
      }

      this.result = {type: "accept-invoice", conversion}

      return this.closeModal()
    },

    confirmInvoice(){
      this.result = {type: "confirm-invoice"}
      return this.closeModal()
    },

    payInvoice(showPayButton){
      this.result = {type: "show-pay-invoice", showPayButton }
      return this.closeModal()
    },

    async confirmPayment(){

      await InvoiceUtils.validateInvoicePayment(this.data.invoice, this.data.tx, this.$store)

      this.result = {type: "confirm-payment" }
      return this.closeModal()
    },

    async claimPayment(){

      // 验证
      if (this.whoAmI === 'buyer' && this.data.resolution !== false) throw "invalid resolution for buyer"
      if (this.whoAmI === 'seller' && this.data.resolution !== true) throw "invalid resolution for seller"

      const myResolutionSignature = Buffer.from( await LibertyTown.invoices.multisig.sign(MyTextEncode( JSONStringify({
        nonce: this.data.invoice[this.whoAmI].nonce,
        txId: Buffer.from( this.data.tx, "hex").toString("base64"),
        payloadIndex: Decimal_0,
        resolution: this.data.resolution,
      })) )).toString("base64")

      let multisigPublicKeys = [this.data.invoice[this.whoIsTheOther].multisig,  this.data.invoice[this.whoAmI].multisig ]
      let multisigSignatures = [this.data.resolutionSignature, myResolutionSignature ]

      if (Math.random() < 0.5){
        multisigPublicKeys = multisigPublicKeys.reverse()
        multisigSignatures = multisigSignatures.reverse()
      }

      const claimTx = JSONParse( MyTextDecode( await LibertyTown.invoices.multisig.claim(MyTextEncode( JSONStringify({
        txId: Buffer.from( this.data.tx, "hex").toString("base64"),
        payloadIndex: Decimal_0,
        resolution: this.data.resolution,
        multisigPublicKeys,
        multisigSignatures,
      })) )))

      console.log("claimTx", claimTx)

      if ( await InvoiceUtils.sendClaimTx(this.$store.state.federations.dict[this.data.invoice.federation], claimTx, this.$store) === true){
        this.result = {type: "claim-payment" }
        return this.closeModal()
      }
    },

    async convertTotal(){
      const data = JSONParse(MyTextDecode( await LibertyTown.app.assets.convertCurrencyToAsset(MyTextEncode(JSONStringify({
        currency: "DOLLAR",
        asset: this.conversionAsset,
        amount: this.total,
      }))) ))
      this.conversionAmount = data.result
    },

    async convertAmountBackToCurrency(){
      const data = JSONParse(MyTextDecode( await LibertyTown.app.assets.convertAssetToCurrency(MyTextEncode(JSONStringify({
        asset: this.data.invoice.buyer.conversionAsset,
        currency: "DOLLAR",
        amount: this.data.invoice.buyer.conversionAmount,
      }))) ))
      this.conversionAmountBackToCurrency = data.result
    },

    disputeModerator(){
      this.result = {type: "open-dispute"}
      return this.closeModal()
    },

    leaveReview(){
      this.result = {type: "show-leave-review"}
      return this.closeModal()
    },

    proposeResolution(){
      this.result = {type: "show-propose-resolution"}
      return this.closeModal()
    }
  },

}
</script>

<style scoped>
.view-invoice-modal-content{
  max-width: 900px;
  margin: 0 auto;
}
</style>