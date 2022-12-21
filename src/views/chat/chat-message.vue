<template>
  <div>
    <div v-if="signedAddress"  :class="`${message && message.decrypted && $store.state.page.settings.account.address === message.decrypted.address ? 'right' : ''}`">

      <div :class="`conversation-list ${type && $utils.bigNumberInList(type, [3, 4, 5]) && !message.hideAttachment ? 'has-button' : ''}`">

        <div v-if="!error" class="order-button">
          <template v-if="message.hideAttachment && typeof message.hideAttachment === 'string'">
            <p class="text-info" > <i class="fa fa-triangle-exclamation fe-1"/> {{ message.hideAttachment }} </p>
          </template>
          <template v-else-if="!message.hideAttachment">

            <button type="button" v-if="type.eq(1)" class="my-1 attachment btn btn-outline-primary" @click="downloadAttachment" >
              <i class="fa fa-paperclip m-1"/>
              <span class="text-truncate" style="max-width: 150px">{{$strings.formatSize(data.data.length*0.75)}} - {{data.name}}</span>
            </button>
            <template v-else-if="type.eq(3)">
              <div class="invoice-button" @click="$emit('viewInvoice', message)">
                <i class="fa fa-file-edit m-1 text-wrap"/>
              </div>
            </template>
            <template v-else-if="type.eq(4)">
              <div class="invoice-button" @click="$emit('viewDispute', message)">
                <i class="fas fa-file-edit m-1 text-wrap"/>
              </div>
            </template>
            <template v-else-if="type.eq(5)">
              <div class="invoice-button" @click="$emit('viewReview', message)">
                <i class="fas fa-file-edit m-1 text-wrap"/>
              </div>
            </template>
          </template>
        </div>

        <div class="message-content" >

          <div v-if="!message.hideAttachment">
            <span v-if="type.eq(3)" class="badge text-break document-name document-title">Invoice Attached</span>
            <span v-if="type.eq(4)" class="badge text-break document-name document-title">Dispute Attached</span>
            <span v-if="type.eq(5)" class="badge text-break document-name document-title">Review Attached</span>

            <span v-if="invoiceInfo" :class="`badge text-break document-title ${invoiceInfo.badge||'bg-warning'}`">
              <i v-if="invoiceInfo.icon" :class="invoiceInfo.icon"/>
              {{invoiceInfo.text}}
            </span>
          </div>

          <span v-if="disputeInfo" :class="`badge text-break document-title ${disputeInfo.badge||'bg-warning'}`">
            <i v-if="disputeInfo.icon" :class="disputeInfo.icon"/>
            {{disputeInfo.text}}
          </span>

          <span v-if="reviewInfo" :class="`badge text-break document-title ${reviewInfo.badge||'bg-warning'}`">>
            <i v-if="reviewInfo.icon" :class="reviewInfo.icon"/>
            {{reviewInfo}}
          </span>


          <div class="ctext-wrap px-3 py-2">

            <div v-if="error">
              <p class="text-info">
                <i class="fa fa-triangle-exclamation fe-1"/> Invalid message - {{error}}
              </p>
            </div>
            <div v-else>

              <template v-if="!message.hideAttachment">
                <div v-if="type.eq(2)" class="pb-1 text-break d-flex">
                  <div v-if="listing" class="listing-preview">
                    <img class="listing-image" :src="listing.images.length ? listing.images[0] : '/assets/image-not-available.png'" :alt="listing.title"/>
                    <div>
                      <span class="d-block">{{listing.title}}</span>
                      <select class="form-select form-select-solid">
                        <option v-for="(offer, key) in listing.offers" :key="`preview-offer-${listing.identity}-${key}`">
                          <amount asset="currency-DOLLAR" :value="offer.price" sign="$"/> - {{offer.amount}}
                        </option>
                      </select>
                      <router-link :to="`/listings/view/${ data.listing }`">
                        <button class="btn btn-outline-primary waves-effect me-1 mt-1">
                          <i class="fas fa-shop"/>
                          View Listing
                        </button>
                      </router-link>
                    </div>
                  </div>
                  <template v-else>
                    Listing #{{ data.listing }}
                  </template>
                </div>

              </template>

              <p v-if="$utils.bigNumberInList(type, [0, 1, 2, 3, 4, 5])">
                {{$strings.base64ToString(text)}}
              </p>
              <p  v-else class="text-info">
                <i class="fa fa-triangle-exclamation fe-1"/> Unknown type
              </p>

            </div>

            <p class="chat-time mb-0">
              {{ $strings.timeSince(new Decimal(message.validation.timestamp).mul(1000)) }}
              <i :class="`fa ${message.stored ? 'fa-check' : 'fa-spinner fa-spin'}`" />
            </p>

          </div>
        </div>

      </div>

    </div>

  </div>
</template>

<script>
import FileSaver from 'file-saver'
import LoadingSpinner from "../../components/utils/loading-spinner";
import InvoiceUtils from 'src/utils/invoice-utils'
import ChatInfo from "../../utils/chat-info";
import Amount from "../../components/amount";

export default {

  components: {Amount, LoadingSpinner},

  props: {
    message: {default: null},
    receiver: {default: null},
  },

  data(){
    return {
      loaded: false,
      type: null,
      text: "",
      data: null,
      signedAddress: null,
      listing: null,
      error: "",
    }
  },

  computed: {



    invoiceInfo(){
      if (!this.data || !this.type.eq(3) || this.error ) return ""

      const invoice = this.data.invoice
      const whoAmI = InvoiceUtils.invoiceWhoAmI(invoice, this.$store.state.page.settings.account.address)
      const whoIsTheOther = InvoiceUtils.invoiceWhoAmI(invoice, this.receiver)

      return ChatInfo.invoiceInfo(this.data, this.type, whoAmI, whoIsTheOther)
    },

    disputeInfo(){
      if (!this.data || !this.type.eq(4) || this.error ) return ""

      const partialInvoice = this.data.partialInvoice

      const whoAmI = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.$store.state.page.settings.account.address)
      const whoIsTheOther = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.receiver)

      return ChatInfo.disputeInfo(this.data, this.type, whoAmI, whoIsTheOther)
    },

    reviewInfo(){
      if (!this.data || !this.type.eq(5) || this.error ) return ""

      const partialInvoice = this.data.partialInvoice

      const whoAmI = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.$store.state.page.settings.account.address)
      const whoIsTheOther = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.receiver)

      return ChatInfo.reviewInfo(this.data, this.type, whoAmI, whoIsTheOther)
    },

  },

  methods:{
    async load(){
      try{
        this.loaded=false
        this.error = ""

        if (!this.message.decrypted) throw "Invalid encryption"

        this.signedAddress = this.message.decrypted.address

        if (this.message.error) {
          this.data = null
          this.text = ""
          this.type = Decimal_0
          this.error = this.message.error
          return
        }

        this.data = this.message.decrypted.data
        this.text = this.message.decrypted.text
        this.type = this.message.decrypted.type

        if (this.type.eq( 2 ) ){

          const data = JSONParse( MyTextDecode( await LibertyTown.listings.get( JSONStringify({
            listing: this.data.listing,
          })) ))

          if (!data) this.listing = null
          else this.listing = data

        }else this.listing = null

      }catch(e){
        this.error = e.toString()
      }finally{
        this.loaded=true
      }
    },

    downloadAttachment(){
      try{
        if ( typeof Blob === "undefined")
          throw "Blob not supported by browser"

        const filename = this.data.name

        const file = new Blob([ Buffer.from(this.data.data, "base64") ] );
        FileSaver.saveAs(file, filename );

        this.$store.dispatch('addToast', {type:"success", title:`Attachment was downloaded`, text: `File ${filename} was saved in the downloads directory.` })

      }catch(e){
        this.$store.dispatch('addToast', {type:"error", title:"Error downloading file", text: e.toString() })
      }
    },



  },

  watch:{
    message:{
      handler (val, oldVal) {
        if (val === oldVal) return
        return this.load()
      }
    }
  },

  mounted(){
    this.load()
  },

}
</script>

<style scoped>
.attachment {
  display: grid;
  grid-template-columns: 20px 1fr;
  grid-column-gap: 5px;
}
.listing-preview{
  display: grid;
  grid-template-columns: 64px 1fr;
  grid-column-gap: 15px;
}
.listing-image{
  width: 64px;
  height: 64px;
}
.chat a {
  color: aliceblue;
}
.chat-left a {
  color: #7367F0;
}

.chat-time{
  text-align: right;
  margin-right: -5px;
  margin-bottom: -2px !important;
  font-size:10px!important;
  float: right;
  margin-left: 10px;
}

[data-layout-mode="dark"] .right .chat-time{
  color:#81aea8!important;
}

.chat-time i{
  color:rgb(74, 188, 232);
  font-size: 13px;
}

.conversation-list{
  max-width:80%;
}

.ctext-wrap{
  padding: 5px 10px !important;
}

.ctext-wrap p{
  margin-bottom: 3px;
  text-align: justify;
}

[data-layout-mode="dark"] .ctext-wrap p{
  color:#fff;
}

.chat-conversation .conversation-list{
  margin-bottom: 5px!important;
}

.order-button, .message-content{
  display: inline-block;
  vertical-align: top;
}

.order-button button{
  width: 100%;
}

.invoice-button{
  overflow: hidden;
  background-color: rgb(72, 94, 196);
  height: 100%;
  position: absolute;
  color: #fff !important;
  font-size: 22px;
  line-height: 46px;
  padding: 0 9px;
  width: 50px;
  cursor: pointer;
  border-top-left-radius: 8px!important;
  border-bottom-left-radius: 8px!important;
}

.invoice-button:hover{
  background-color: #233898FF !important;
}

.document-name{
  background-color: rgb(72, 94, 196) !important;
  width: 100%;
  text-align: center!important;
}

.invoice-button i{
  margin: 0;
  position: absolute;
  top: 45%;
  transform: translateY(-50%);
}


.bg-secondary{
  background-color: #6174cc !important
}

.document-title{
  border-radius: 0;
  vertical-align: top;
  padding: 5px;
  width: 100%;
  white-space: normal;
  text-align: left;
}

.has-button .message-content{
  border-top-left-radius: 0!important;
  border-bottom-left-radius: 0!important;
  border-top-right-radius: 8px!important;
  border-bottom-right-radius: 8px!important;
}

.right .has-button .message-content{
  border-top-left-radius: 0!important;
  border-bottom-left-radius: 0!important;
  border-top-right-radius: 8px!important;
}

.has-button .message-content{
  margin-left:50px
}

</style>