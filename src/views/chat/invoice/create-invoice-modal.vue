<template>
  <modal ref="modal" modal-class="modal-xl" modal-content-class="create-invoice-modal-content" title="Create a peer-to-peer encrypted invoice">
    <template v-slot:body>

      <!-- Product Details starts -->
      <div class="card-body invoice-padding">
        <form class="source-item">
          <div class="items-list">
            <div class="repeater-wrapper " v-for="(item, key) in items" :key="key">
              <div class="row">
                <div class="col-12 d-flex pe-0 pb-2">
                  <div class="item-element row w-100 pe-lg-0 pe-1 py-1">

                    <div class="col-lg-3 col-12 ">
                      <p class="card-text col-title mb-md-50 mb-0">Item</p>
                      <input type="text" :class="`form-control ${item.name.length < LibertyTown.config.LISTING_TITLE_MIN_LENGTH ? 'is-invalid': ''}`" v-model="item.name" placeholder="Item">
                      <div v-if="item.name.length < LibertyTown.config.LISTING_TITLE_MIN_LENGTH" class="invalid-feedback">It must contain at least {{LibertyTown.config.LISTING_TITLE_MIN_LENGTH}} chars.</div>
                    </div>
                    <div class="col-lg-3 col-12 ">
                      <p class="card-text col-title mb-md-50 mb-0">Offer</p>
                      <input type="text" :class="`form-control ${item.offer.length < LibertyTown.config.LISTING_OFFER_MIN_LENGTH ? 'is-invalid': ''}`" v-model="item.offer" placeholder="Offer">
                      <div v-if="item.offer.length < LibertyTown.config.LISTING_OFFER_MIN_LENGTH" class="invalid-feedback">It must contain at least {{LibertyTown.config.LISTING_OFFER_MIN_LENGTH}} chars.</div>
                    </div>
                    <div class="col-lg-2 col-12 ">
                      <p class="card-text col-title mb-md-50 mb-0">Qty</p>
                      <input-amount :text="null" :allow-zero="false" :init-amount="item.initQuantity"
                                    :decimal-separator="Decimal_0" :spinner="false" :init-amount-disable="false"
                                    @changed="it => item.quantity = {...item.quantity, ...it}"/>
                    </div>
                    <div class="col-lg-2 col-12 ">
                      <p class="card-text col-title mb-md-50 mb-0">Unit price</p>
                      <input-amount :text="null" :allow-zero="false" :init-amount="item.initPrice"
                                    asset="currency-DOLLAR" :spinner="false" :init-amount-disable="false"
                                    @changed="it => item.price = {...item.price, ...it}"/>
                    </div>
                    <div class="col-lg-2 col-12">
                      <p class="card-text col-title mb-md-50 mb-0">Amount</p>
                      <p class="card-text mb-0 fw-bold ">
                        <amount asset="currency-DOLLAR" :value="item.price.amount.times( item.quantity.amount )" sign="$" />
                      </p>
                    </div>
                    <div class="col-lg-1 col-12">
                      <div class="d-flex flex-column align-items-center justify-content-between border-start delete-element" @click="() => removeItem(key)" style="padding: 0 10px">
                        <i v-if="items.length > 1" class="fa fa-times text-danger cursor-pointer"  />
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="row my-1">
            <div class="d-flex justify-content-end">
              <button type="button" class="btn btn-primary btn-sm btn-add-new waves-effect waves-float waves-light" @click="addItem">
                <i class="fa fa-plus"/>
                <span class="align-middle">Add Item</span>
              </button>
            </div>
          </div>

          <div class="row mt-1">
            <div class="col-12 col-sm-6">
              <label class="form-label">Shipping Price:</label>
              <input-amount :text="null" :allow-zero="true" :init-amount="initShipping"
                            asset="currency-DOLLAR" :spinner="false" :init-amount-disable="false"
                            @changed="it => this.shipping = it"/>
            </div>
            <div class="col-12 col-sm-6">
              <label class="form-label">Resolution Deadline:</label>
              <input type="number" class="form-control" placeholder="Deadline" v-model.number="deadline">
              <label :class="`form-label ${deadlineDays.lt(20) ? 'text-warning': ''}`">~{{deadlineString}}</label>
            </div>
          </div>

          <div class="row mt-1">
            <div class="col-md-12">
              <label class="form-label">Delivery Address:</label>
              <textarea rows="4" :class="`form-control ${delivery.length < 3 ? 'is-invalid': ''}`" placeholder="Delivery details" v-model="delivery"/>
              <div v-if="delivery.length < 3" class="invalid-feedback">Delivery must contain at least 3 characters.</div>
            </div>
          </div>

        </form>
      </div>
      <!-- Product Details ends -->

      <!-- Invoice Total starts -->
      <div class="card-body invoice-padding p-2">
        <div class="row">
          <div class="col-md-12">
            <label for="notes" class="form-label fw-bold me-1">Notes:</label>
            <textarea class="form-control" rows="1" id="notes" v-model="notes"></textarea>
          </div>
        </div>
      </div>

      <hr class="border-top"/>

      <div class="card-body invoice-padding">
        <div class="row">

          <div class="col-12 col-md-6">
            <div class="d-flex">
              <div class="me-4">
                <span class="text-secondary me-1">BUYER</span>
                <account-identicon :address="buyer" :size="25" route="/chat/conversation/" @click="closeModal"/>
              </div>
              <div>
                <span class="text-secondary me-1">SELLER</span>
                <account-identicon :address="seller" :size="25" route="/chat/conversation/" @click="closeModal"/>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6">
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
      </div>
      <!-- Invoice Total ends -->

    </template>
    <template v-slot:footer>
      <div class="col-12 d-flex justify-content-end">
        <loading-button class-custom="btn btn-primary me-1 waves-effect waves-float waves-light" :submit="submit" text="Create invoice"/>
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
import AccountIdenticon from "../../../components/utils/account-identicon";
import InputAmount from "../../../components/input-amount";
import Amount from "../../../components/amount";

export default {

  components: {AccountIdenticon, LoadingButton, Modal, AlertBox, InputAmount, Amount},

  data(){
    return {
      whoAmI: "seller",
      result: null,
      buyer: "",
      seller: "",
      delivery: "",
      notes: "",
      initShipping: Decimal_0,
      shipping: {
        amount: Decimal_0,
        amountValidationError: "",
      },
      deadline: new Decimal(30000),
      items: [{
        version: Decimal_0,
        name: "",
        offer: "",
        initPrice: Decimal_1,
        price: {
          amount: Decimal_1,
          amountValidationError: "",
        },
        initQuantity: Decimal_1,
        quantity: {
          amount: Decimal_1,
          amountValidationError: "",
        },
      }],
      conversionAsset: "PCASH",
      conversionAmount: Decimal_0,
      date: new Date(),
    }
  },

  computed:{
    dateString(){
      return this.date.toDateString()
    },
    total(){
      return InvoiceUtils.calculateInvoiceTotal(this.items.map(it => ({price: it.price.amount, quantity: it.quantity.amount}) ), this.shipping.amount)
    },
    deadlineDays(){
      return InvoiceUtils.calculateDeadlineSeconds(this.deadline).div(24*60*60)
    },
    deadlineString(){
      return this.$strings.timeSince( new Date().getTime() - InvoiceUtils.calculateDeadlineSeconds(this.deadline).mul(1000).toNumber() )
    }
  },

  methods: {
    async showModal({buyer, seller, items, shipping }) {

      Object.assign(this.$data, this.$options.data())

      this.buyer = buyer
      this.seller = seller

      if (items) this.items = items.map(it => ({
        version: new Decimal( it.listing ? LibertyTown.enums.invoiceItems.INVOICE_ITEM_ID : LibertyTown.enums.invoiceItems.INVOICE_ITEM_NEW ),
        address: it.listing ? it.listing : undefined,
        name: it.name,
        offer: it.offer,
        initPrice: it.price,
        price: {
          amount: it.price,
          amountValidationError: "",
        },
        initQuantity: it.quantity,
        quantity: {
          amount: it.quantity,
          amountValidationError: "",
        },
      }))

      if (shipping) {
        this.initShipping = shipping.price
        this.shipping.amount = shipping.price
        this.notes = "shipping: "+shipping.option
      }

      if (seller === this.$store.state.page.settings.account.address) this.whoAmI = "seller"
      else if (buyer === this.$store.state.page.settings.account.address) this.whoAmI = "buyer"

      await this.$refs.modal.showModal()

      return this.result
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },

    async submit(){

      if (this.delivery.length < 3) throw "Invalid delivery info"
      for (const it of this.items){
        if (it.name.length < 5) throw "Invalid Item name"
        if (it.quantity.amount.lt(1)) throw "Invalid Item Quantity"
      }

      if (this.whoAmI === 'seller')
        if (!this.$store.state.settings.seller.recipient) throw "You need to set the Seller Address in the Settings Page"

      if (this.whoAmI === 'buyer')
        await this.convertTotal()

      const out = InvoiceUtils.selectRandomModerator(this.$store.getters.selectedFederation)
      if (!out) throw "Moderator couldn't be selected for this federation"

      const invoice = {
        version: Decimal_0,
        federation: out.fed,
        moderator: out.moderator,
        buyer: {
          address: this.buyer,
        },
        seller: {
          address: this.seller,
        },
        items: this.items.map(it => ({
          version: it.version,
          address: it.address,
          name: it.name,
          offer: it.offer,
          quantity: it.quantity.amount,
          price: it.price.amount,
        })),
        notes: this.notes,
        date: this.date.getTime(),
        deadline: this.deadline,
        shipping: this.shipping.amount,
        delivery: this.delivery,
      }

      const confirmations = {
        buyer: {},
        seller: {},
      }

      if (this.whoAmI === 'buyer'){
        invoice.buyer.conversionAsset = this.conversionAsset
        invoice.buyer.conversionAmount = this.conversionAmount
        invoice.buyer.nonce = Buffer.from( await LibertyTown.crypto.randomBytes(32) ).toString("base64")
        invoice.buyer.multisig = Buffer.from( await LibertyTown.invoices.multisig.compute(MyTextEncode( JSONStringify({nonce: invoice.buyer.nonce })) )).toString("base64")
        invoice.buyer.signature = Buffer.from( await LibertyTown.invoices.sign(MyTextEncode( JSONStringify({invoice }))) ).toString("base64")
      }else if (this.whoAmI === 'seller') {
        invoice.seller.nonce = Buffer.from( await LibertyTown.crypto.randomBytes(32) ).toString("base64")
        invoice.seller.multisig = Buffer.from( await LibertyTown.invoices.multisig.compute(MyTextEncode(JSONStringify({nonce: invoice.seller.nonce })) )).toString("base64")
        invoice.seller.recipient = this.$store.state.settings.seller.recipient
        invoice.seller.signature = Buffer.from( await LibertyTown.invoices.sign(MyTextEncode( JSONStringify({invoice })) ) ).toString("base64")
      }

      this.result = {
        type: "created-invoice",
        invoice,
        confirmations,
      }

      this.closeModal()
    },

    addItem(){
      this.items.push({
        version: Decimal_0,
        name: "",
        offer: "",
        initPrice: Decimal_1,
        price: {
          amount: Decimal_1,
          amountValidationError: "",
        },
        initQuantity: Decimal_1,
        quantity: {
          amount: Decimal_1,
          amountValidationError: "",
        },
      })
    },

    removeItem(key){
      this.items.splice(key, 1)
    },

    async convertTotal(){
      const data = JSONParse(MyTextDecode( await LibertyTown.app.assets.convertCurrencyToAsset(MyTextEncode(JSONStringify({
        currency: "DOLLAR",
        asset: this.conversionAsset,
        amount: this.total,
      }))) ))
      this.conversionAmount = data.result
    },

  },
}
</script>

<style>
.create-invoice-modal-content{
  max-width: 1100px;
  margin: 0 auto;
}

.items-list .row .item-element{
  background-color: #eeeeee;
  padding: 10px 10px 0 10px;
}

[data-layout-mode="dark"] .items-list .row .item-element{
  background-color: #32394e;
}

.items-list .row .item-element .delete-element {
  padding: 5px 0 0 0;
  text-align: right;
  right: 0 !important;
  margin-right: -20px;
  font-size: 16px;
}
</style>