<template>
  <modal ref="modal" title="Pay invoice" >
    <template v-slot:body>

      <template v-if="generatedLink">

        <div class="form-check form-check-inline">
          <input class="form-check-input" type="radio" id="web-wallet" value="web-wallet" v-model="type">
          <label class="form-check-label" for="web-wallet">Pay using Web Wallet</label>
        </div>

        <div class="form-check form-check-inline my-2">
          <input class="form-check-input" type="radio" id="desktop-wallet" value="desktop-wallet" v-model="type">
          <label class="form-check-label" for="desktop-wallet">Pay using Desktop Wallet</label>
        </div>

        <div v-if="type === 'web-wallet'" class="row mt-1 mb-1 ms-2">
          <div class="col-12">
            <a :href="`https://wallet.pandoracash.com${generatedLink}`" target="_blank">
              <button class="btn btn-primary waves-effect">
                <i class="fas fa-globe me-2"/>
                <span>Pay now</span>
              </button>
            </a>
          </div>
        </div>

        <div v-if="type === 'desktop-wallet'" class="row mt-1 ms-2 mb-2">
          <div class="col-12">
            <textarea class="form-control active" rows="8" placeholder="Counter" disabled="true">{{generatedLink}}</textarea>
            <label class="form-label">Import link in Desktop Wallet</label>
          </div>
        </div>

      </template>

      <div class="row">
        <div class="col-12">
          <label class="form-label">Provide TX hash</label>
          <textarea :class="`form-control ${$validator.validateHash(txId) ? 'is-invalid' : ''}`" rows="2" v-model="txId" />
          <div v-if="$validator.validateHash(txId)" class="invalid-feedback">{{$validator.validateHash(txId)}}</div>
        </div>
      </div>

    </template>

    <template v-slot:footer>
      <loading-button :disabled="!!$validator.validateHash(txId)" :submit="paid" text="Payed" icon="fas fa-save"/>
      <button class="btn btn-outline-primary" type="button" @click="closeModal">
        <i class="fas fa-ban"></i> Close
      </button>
    </template>

  </modal>
</template>

<script>
import Modal from "src/components/utils/modal"
import InvoiceUtils from "src/utils/invoice-utils"
import LoadingButton from "src/components/utils/loading-button";

export default {
  components:{Modal, LoadingButton},

  data(){
    return {
      type: "web-wallet",
      invoice: null,
      result: null,
      txId: "",
      generatedLink: "",
    }
  },

  computed:{

  },

  methods:{

    generateLink(){
      if (!this.invoice) return ""

      const mod = this.$store.getters.getFederationModerator(this.invoice.federation, this.invoice.moderator)
      if (!mod) throw "Moderator was not found in Federation"

      const total = this.invoice.buyer.conversionAmount

      const rewardAddress = mod.rewardAddresses[Math.floor( Math.random()*mod.rewardAddresses.length) ]

      const publicKeys = [ this.invoice.buyer.multisig, mod.conditionalPublicKey, this.invoice.seller.multisig ]
      const recipients = [this.invoice.seller.recipient, rewardAddress ]
      const amounts = [total, Decimal.floor( total.mul(mod.fee).div( 100000)) ]
      const extraData = [this.invoice.id, this.invoice.id]
      const assets = [ this.$store.state.assets.all['asset-'+this.invoice.buyer.conversionAsset].hash, this.$store.state.assets.all['asset-'+this.invoice.buyer.conversionAsset].hash ]

      const link =  "/advanced/private/conditional-payment?"+this.$utils.serialize({
        "deadline": "30000",
        "defaultResolution": "sender",
        "threshold": 2,
        "multisigPublicKeys": publicKeys.map(it => this.$strings.base64ToHex(it)),
        recipients,
        amounts: amounts.map(it => it.toString()),
        "assets": assets.map(it => this.$strings.base64ToHex(it)),
        "extraData": extraData.map(it => Buffer.from( it, "ascii" ).toString("hex") ),
        "extraDataEncrypted": ["true","true"],
        "commonRingSize": 256,
      })

      return link
    },

    async showModal(invoice, showPayButton) {
      Object.assign(this.$data, this.$options.data())

      this.invoice = invoice

      if (showPayButton) this.generatedLink = this.generateLink()
      else this.generatedLink = ""

      await this.$refs.modal.showModal()

      return this.result
    },

    async paid(){

      await InvoiceUtils.validateInvoicePayment(this.invoice, this.txId, this.$store)

      this.result = {
        type: "paid-tx-hash",
        tx: this.txId,
      }
      return this.closeModal()
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },

  },
}
</script>