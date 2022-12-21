<template>
  <div :class="`${showChatSidebar ? 'd-none' : ' d-flex'} d-md-flex col-12 col-md-7 col-lg-8 user-chat p-0 border`">
    <div class="card app-layout h-100 mb-0 w-100">

      <div class="py-2 px-2 border-bottom d-flex">

        <button type="button" class="d-flex d-md-none btn btn-dark btn-rounded waves-effect me-2" @click="$emit('toggleChatSidebar', true)"
                v-tooltip.bottom="'Show all your conversations'"  style="width: 119px" >
          <i class="fas fa-comments fa-2x px-2"/>
        </button>

        <account-identicon :address="receiver" :size="28" route="" class="py-1 me-2" />
        <div class="mt-2 mb-0 text-truncate w-100 me-2">
          <span class="text-muted">{{receiver}}</span>
        </div>

        <chat-conversation-menu  :receiver="receiver" @showCreateInvoice="e => showCreateInvoice(e)"/>
      </div>

<!--      <chat-progress-bar/>-->

      <div v-if="!receiver" class="chat-conversation d-flex flex-column h-100">
        <div class="d-flex flex-grow-1 justify-content-center align-items-center">
          <span class="cursor-pointer" @click="()=>$emit('startConversation')">Start a conversation</span>
        </div>
      </div>
      <template v-else>

        <div class="chat-conversation">
          <div :class="`chat-conversation ${attachment? 'has-attachment':''} chat-box p-3 d-flex`" style="flex-direction:column-reverse;">

            <div v-if="!messages || $store.state.messages.loading"  class="d-flex flex-column h-100">
              <div class="d-flex flex-grow-1 justify-content-center align-items-center">
                <loading-spinner class="fa-2x"/>
              </div>
            </div>
            <template v-else>

              <ul class="list-unstyled mb-0">

                <li v-for="(it, key) in messagesFiltered" :key="`chat-msg-${key}`">
                  <chat-message :message="it" :receiver="receiver" @viewInvoice="viewInvoice" @viewDispute="viewDispute" @viewReview="viewReview" />
                </li>

              </ul>
              <div class="text-center pb-4" v-if="!messages.finished">
                <loading-button :submit="loadMore" text="Load more" icon="fa fa-download" class="btn-secondary" />
              </div>

            </template>

          </div>
          <div :class="`${attachment ? 'grid-chat-attachment' : ''}`">
            <div v-if="attachment" class="px-4" >
              <label class="form-label mb-0 cursor-pointer" @click="attachment = null" >
                <i class="fa fa-file-excel me-2"/>
              </label>
            </div>
            <div class="chat-input-section">
              <div class="row">
                <div class="col pe-0">
                  <div class="position-relative">
                    <input type="text" class="form-control chat-input" placeholder="Enter Message..." v-model="message" v-on:keyup.enter="onEnter"
                          @click="inputClicked">
                    <div class="chat-input-links" id="tooltip-container">
                      <ul class="list-inline mb-0">
                        <li v-if="!attachment" class="list-inline-item cursor-pointer"  @click="$refs['attach-doc'].click()">
                          <i class="fa fa-paperclip"></i>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div class="col-auto">
                  <loading-button ref="submitButton" :submit="sendMessage" icon="fa fa-paper-plane" :disabled="(!message.length && !attachment) || $store.state.messages.loading" text="" class-custom="btn btn-primary btn-rounded btn-send waves-effect waves-light"/>
                </div>
              </div>
            </div>
          </div>

        </div>

        <input class="form-control" ref="attach-doc" type="file" v-on:change="attachFile" size="1" hidden="" />

      </template>

    </div>
  </div>

</template>

<script>
import LoadingButton from "../../components/utils/loading-button";
import ChatMessage from "./chat-message";
import InvoiceUtils from "src/utils/invoice-utils";
import LoadingSpinner from "../../components/utils/loading-spinner";
import ChatConversationMenu from "./chat-conversation-menu";
import AccountIdenticon from "../../components/utils/account-identicon";
import ChatProgressBar from "./chat-progress-bar"

export default {
  components: {AccountIdenticon, LoadingSpinner, ChatMessage, LoadingButton, ChatConversationMenu, ChatProgressBar },
  props: {
    receiver: {default: ""},
    showChatSidebar: {default: false},
  },
  data(){
    return {
      message: "",
      attachment: null,
    }
  },
  computed:{

    messages(){
      return this.$store.state.messages.dict[this.receiver]
    },

    messagesFiltered(){
      let msg = this.messages

      if (!msg || !msg.messages) return []

      msg = [...Object.values(msg.messages)].sort( (a,b) => a.score.minus(b.score).toNumber() )

      const filtered = {}, all = { dispute: {},  invoice: {},  review: {}, }

      for (let i=0; i < msg.length; i++ ) {

        const m = msg[i].message

        if (!m.error && ( this.$utils.bigNumberInList(m.decrypted.type, [3, 4, 5]) ) ){

          try{
            const data = m.decrypted.data
            const {version} = data

            let object, objectName, type, idProperty = "id"
            if (m.decrypted.type.eq(3) ) {
              type = "invoice"
              objectName = "invoice"
              if ( this.$utils.bigNumberInList(version, [0]) ) idProperty = "initialId"
            } else if (m.decrypted.type.eq(4) ) {
              type = "dispute"
              objectName = "partialInvoice"
            }else if (m.decrypted.type.eq(5) ) {
              type = "review"
              objectName = "partialInvoice"
            }

            object = data[objectName]

            if (m.decrypted.type.eq(3) && version.eq(1)){ //invoice - 发票
              all[type][object[idProperty]] = all[type][object.initialId]
              delete all[type][object.initialId]
            }

            let id = object[idProperty]
            let best = all[type][ id ]
            if (!best || ( best.data.version.eq(version.minus(1)) || best.data.version.eq(version) ) ) {

              if (best && best.data.version.eq(version.minus(1))){
                if (type === "invoice") {
                  if (this.$utils.bigNumberInList(version, [4, 5, 6]) && data.tx !== best.data.tx) throw "invoice tx does not match with previous tx"
                }
                if (type === "dispute") {
                }
              }

              if (best){
                if (type === "dispute" || type === "review") {
                  const currentCounter = data.info ? data.info.counter : Decimal_0
                  const bestCounter = best.info ? best.info.counter : Decimal_0
                  if (currentCounter.lt(bestCounter)) throw "wrong counter for dispute info"
                }
              }

              if (type === "invoice") {
                if (version.eq(5) && m.decrypted.address !== object[data.resolution ? 'buyer' : 'seller'].address) throw "wrong resolution signature"
                if (version.eq(6) && m.decrypted.address !== object[data.resolution ? 'seller' : 'buyer'].address) throw "wrong confirmation signature"
              }
              if (type === "dispute") {
                if (version.eq(2) && m.decrypted.address !== object[data.resolution ? 'seller' : 'buyer'].address) throw "wrong confirmation signature"
              }

              if (best) {
                if (filtered[best.index].decrypted.text) filtered[best.index] = {...filtered[best.index], hideAttachment:true}
                else delete filtered[best.index]
              }
              all[type][object[idProperty]] = {data: m.decrypted.data, index: i }
              filtered[i] = m
            }
          }catch(e){
            filtered[i] = {...m, hideAttachment: e.toString()}
          }
          continue
        }
        filtered[i] = m
      }
      return filtered
    },
  },
  methods:{

    async load(receiver = this.receiver){
      await this.$store.dispatch('loadMessages', receiver)
      this.loadAttachmentFromURI(undefined, receiver)
    },

    loadMore(){
        return this.load()
    },

    async sendMessage(  ){

      if (this.$store.state.messages.loading) throw "Not loaded yet"

      const message = {
        type: Decimal_0,
        text: Buffer.from(this.message).toString("base64"),
        data: null,
      }

      let changeUri = false

      if (this.attachment) {
        message.type = this.attachment.type
        message.data = {
          ...this.attachment,
          receiver: undefined,
          type: undefined,
          typeDescription: undefined,
        }
        changeUri = true
      }

      if (this.$utils.bigNumberInList( message.type, [1,2,3,4,5] ) )
        message.data = Buffer.from( JSONStringify(message.data )).toString("base64")

      const json = JSONParse( MyTextDecode( await LibertyTown.chat.sendMessage(MyTextEncode( JSONStringify({
        message,
        receiver: this.receiver
      }) ), (data) => this.$store.state.page.validatorModal.showModal(data) ) ) )

      if (!json) throw "Invalid answer from Chat provider"

      json.score = json.message.validation.timestamp

      this.message = ""
      this.attachment = null

      await InvoiceUtils.decryptMessage(json.message, this.receiver, this.$store)

      this.$store.commit('newMessage',{receiver: this.receiver, it: json })

      this.$store.commit('setConversationRead', {receiver: this.receiver })

      if (changeUri) this.$router.push(`/chat/conversation/${ this.receiver }`)

    },

    onEnter(){
      return this.$refs.submitButton.handleClick()
    },

    attachFile(){
      try{

        if ((window.File && window.FileReader && window.FileList && window.Blob) === false)
          throw `Your browser/device doesn't support file import.`

        const file = this.$refs["attach-doc"].files[0];
        if (!file) throw "No file selected"

        const reader = new FileReader();

        const attachment = {
          receiver: this.receiver,
          type: Decimal_1,
          name: file.name,
          data: null,
          typeDescription: "attachment",
        }

        reader.onload = async (e) => {
          attachment.data = Buffer.from(reader.result).toString("base64");
        }

        reader.readAsArrayBuffer(file);

        this.attachment = attachment

      }catch(e){
        this.$store.dispatch('addToast', {type:"error", title:"Error attaching file", text: e.toString() })
      }

    },

    async showCreateInvoice(buyer, items, shipping, notes ){

      this.$nextTick(async ()=>{

        const out = await this.$store.state.page.createInvoiceModal.showModal( {
          buyer: buyer ? this.$store.state.page.settings.account.address : this.receiver,
          seller: buyer ? this.receiver : this.$store.state.page.settings.account.address,
          items,
          shipping,
          notes,
        } )

        if (out && out.type === "created-invoice") {

          const data = await MyTextEncode(JSONStringify({invoice: out.invoice}))
          const serialized = Buffer.from( await LibertyTown.invoices.serialize(data) )

          this.attachment = {
            receiver: this.receiver,
            type: new Decimal(3),
            version: Decimal_0,
            typeDescription: "invoice draft",
            invoice: serialized.toString("base64"),
            initialId: out.invoice[buyer?'buyer':'seller'].nonce,
            confirmations: out.confirmations,
          }
        }
      })

    },

    async viewInvoice(message){

      try{

        if (message.error) throw message.error

        const data = message.decrypted.data
        const invoice = data.invoice

        const whoAmI = InvoiceUtils.invoiceWhoAmI(invoice, this.$store.state.page.settings.account.address)
        const whoIsTheOther = InvoiceUtils.invoiceWhoAmI(invoice, this.receiver)

        const output = await this.$store.state.page.viewInvoiceModal.showModal( { data, whoAmI, whoIsTheOther, } )

        let attachment

        if (whoAmI && output && output.type === "accept-invoice"){

          let newInvoice = JSONParse( JSONStringify( invoice ) )

          if (whoAmI === 'seller') {
            newInvoice.seller.recipient = this.$store.state.settings.seller.recipient
          }
          else if (whoAmI === 'buyer'){
            newInvoice.buyer.conversionAsset = output.conversion.conversionAsset
            newInvoice.buyer.conversionAmount = output.conversion.conversionAmount
          }

          const nonce = Buffer.from( await LibertyTown.crypto.randomBytes(32) ).toString("base64")
          newInvoice[whoAmI].nonce = nonce
          newInvoice[whoAmI].multisig = Buffer.from( await LibertyTown.invoices.multisig.compute(MyTextEncode( JSONStringify({nonce }))) ).toString("base64")

          const removedSignature = newInvoice[whoIsTheOther].signature
          delete newInvoice[whoIsTheOther].signature

          newInvoice[whoAmI].signature = Buffer.from( await LibertyTown.invoices.sign(MyTextEncode( JSONStringify({invoice: newInvoice})) ) ).toString("base64")

          attachment = {
            ...JSONParse(JSONStringify(data)),
            receiver: this.receiver,
            type: new Decimal(3),
            version: Decimal_1,
            typeDescription: "accepted invoice",
            invoice: Buffer.from( await LibertyTown.invoices.serialize(  await MyTextEncode(JSONStringify({invoice: newInvoice})) ) ).toString("base64"),
            removedSignature,
          }

          newInvoice.id = await InvoiceUtils.generateInvoiceId(newInvoice)

          const msg =  await LibertyTown.invoices.messageToSignItems( MyTextEncode( JSONStringify( { id: newInvoice.id, items: newInvoice.items, notes: newInvoice.notes, shipping: newInvoice.shipping }) ) )
          attachment.confirmations[whoAmI].purchase = (await LibertyTown.crypto.sign(msg) ).toString("base64")
          attachment.confirmations[whoAmI].delivery = (await LibertyTown.crypto.sign( InvoiceUtils.messageToSignDelivery(newInvoice.id, newInvoice.delivery )) ).toString("base64")

          if (whoAmI === "seller")
            attachment.confirmations.seller.recipient = (await LibertyTown.crypto.sign( InvoiceUtils.messageToSignRecipient(newInvoice.id, newInvoice.seller.recipient)  ) ).toString("base64")

        } else if ( output && output.type === "confirm-invoice"){

          let newInvoice = JSONParse( JSONStringify( invoice ) )
          newInvoice[whoAmI].signature = ( await LibertyTown.invoices.sign(MyTextEncode( JSONStringify({invoice})) ) ).toString("base64")

          attachment = {
            ...JSONParse(JSONStringify(data)),
            receiver: this.receiver,
            type: new Decimal(3),
            version: new Decimal(2),
            typeDescription: "invoice confirmed",
            invoice: Buffer.from( await LibertyTown.invoices.serialize(  await MyTextEncode(JSONStringify({invoice: newInvoice})) ) ).toString("base64"),
            initialId: undefined,
          }

          const msg = await LibertyTown.invoices.messageToSignItems( MyTextEncode( JSONStringify( { id: invoice.id, items: invoice.items, notes: invoice.notes, shipping: invoice.shipping }) ) )
          attachment.confirmations[whoAmI].purchase =  (await LibertyTown.crypto.sign(msg) ).toString("base64")
          attachment.confirmations[whoAmI].delivery =  (await LibertyTown.crypto.sign( InvoiceUtils.messageToSignDelivery(invoice.id, invoice.delivery )) ).toString("base64")

          if (whoAmI === "seller")
            attachment.confirmations.seller.recipient = (await LibertyTown.crypto.sign( InvoiceUtils.messageToSignRecipient(newInvoice.id, newInvoice.seller.recipient)  ) ).toString("base64")

        }else if (whoAmI && output && output.type === "show-pay-invoice") {
          const out = await this.$store.state.page.payInvoiceModal.showModal(invoice, output.showPayButton)
          if (out && out.type === "paid-tx-hash") {
            attachment = {
              ...JSONParse(JSONStringify(data)),
              receiver: this.receiver,
              type: new Decimal(3),
              typeDescription: "invoice payment",
              invoice: Buffer.from( await LibertyTown.invoices.serialize(  await MyTextEncode(JSONStringify({invoice})) ) ).toString("base64"),
              version: new Decimal(3),
              tx: out.tx,
            }
          }
        } else if (output && output.type === 'confirm-payment'){

          attachment = {
            ...JSONParse(JSONStringify(data)),
            receiver: this.receiver,
            type: new Decimal(3),
            invoice: Buffer.from( await LibertyTown.invoices.serialize(  await MyTextEncode(JSONStringify({invoice})) ) ).toString("base64"),
            version: new Decimal(4),
            typeDescription: "invoice payment confirmed",
          }

          attachment.confirmations.seller.confirmsTx = ( await LibertyTown.crypto.sign( InvoiceUtils.messageToSignTxConfirmation( invoice.id, data.tx  ) )).toString("base64")

        } else if (output && output.type === "open-dispute"){

          const out = await this.$store.state.page.shareInformationModal.showModal()
          if (out){
            const newDispute = {
              partialInvoice: { id: invoice.id,
                federation: invoice.federation, moderator: invoice.moderator,
                buyer: { address: invoice.buyer.address, nonce: invoice.buyer.nonce, conversionAsset: invoice.buyer.conversionAsset, conversionAmount: invoice.buyer.conversionAmount},
                seller: { address: invoice.seller.address, nonce: invoice.seller.nonce},
                total: InvoiceUtils.calculateInvoiceTotal(invoice.items, invoice.shipping),
              },
              tx: data.tx,
              proofs: {},
            }

            if (out.includeItems)
              newDispute.proofs.purchase = { data: {items: invoice.items, shipping: invoice.shipping, notes: invoice.notes },
                signatures: {buyer: data.confirmations.buyer.purchase, seller: data.confirmations.seller.purchase } }

            if (out.includeDelivery)
              newDispute.proofs.delivery = { data: invoice.delivery,
                signatures: { buyer: data.confirmations.buyer.delivery, seller: data.confirmations.seller.delivery } }

            if (out.includeRecipient)
              newDispute.proofs.recipient = { data: invoice.seller.recipient, signature: data.confirmations.seller.recipient }

            this.$router.push({ path: `/chat/conversation/${invoice.moderator}`, query: { newDispute: JSONStringify(newDispute)} } )
          }

        } else if (output && output.type === "show-propose-resolution"){

          let resolution
          if (whoAmI === 'buyer') resolution = true
          else if (whoAmI === 'seller') resolution = false
          else throw "invalid resolution"

          const out = await this.$store.state.page.proposeResolutionModal.showModal( {txId: data.tx, whoAmI, resolution } )
          if (out && out.type === "proposed-resolution"){
            attachment = {
              ...JSONParse(JSONStringify(data)),
              receiver: this.receiver,
              type: new Decimal(3),
              version: new Decimal(5),
              invoice: Buffer.from( await LibertyTown.invoices.serialize(  await MyTextEncode(JSONStringify({invoice})) ) ).toString("base64"),
              typeDescription: "invoice proposed resolution",
              resolution,
              resolutionSignature: Buffer.from( await LibertyTown.invoices.multisig.sign( MyTextEncode( JSONStringify({
                nonce: invoice[whoAmI].nonce,
                txId: Buffer.from( data.tx, "hex").toString("base64"),
                payloadIndex: Decimal_0,
                resolution,
              })) ) ).toString("base64")
            }
          }
        } else if (output && output.type === "claim-payment"){

          if (data.version.eq(5))
            attachment = {
              ...JSONParse(JSONStringify(data)),
              receiver: this.receiver,
              type: new Decimal(3),
              version: new Decimal(6),
              invoice: Buffer.from( await LibertyTown.invoices.serialize(  await MyTextEncode(JSONStringify({invoice})) ) ).toString("base64"),
              typeDescription: "funds claimed",
              resolution: data.resolution,
              resolutionSignature: data.resolutionSignature,
            }

        } else if (output && output.type === "show-leave-review"){
          const out = await this.$store.state.page.leaveReviewModal.showModal({allowIncludeItems: true})
          if (out){
            this.$router.push({ path: `/chat/conversation/${invoice.moderator}`, query:{
              newReview: JSONStringify({
                review: {
                  score: out.score,
                  text: out.text,
                },
                partialInvoice: {
                  id: invoice.id, federation: invoice.federation, moderator: invoice.moderator,
                  buyer: { address: invoice.buyer.address, nonce: invoice.buyer.nonce, conversionAsset: invoice.buyer.conversionAsset, conversionAmount: invoice.buyer.conversionAmount},
                  seller: { address: invoice.seller.address, nonce: invoice.seller.nonce},
                  total: InvoiceUtils.calculateInvoiceTotal(invoice.items, invoice.shipping),
                },
                tx: data.tx,
                proofs: {
                  purchase: out.includePurchaseItems ? { data: {items: invoice.items, shipping: invoice.shipping, notes: invoice.notes },
                    signatures: {buyer: data.confirmations.buyer.purchase, seller: data.confirmations.seller.purchase } } : undefined,
                }
              }) }})
          }
        }

        if (attachment) this.attachment = attachment

      }catch(e){
        return this.$store.dispatch('addToast', {type:"error", title:"Error processing your request", text: e.toString() })
      }


    },

    async viewDispute(message){
      try {

        if (message.error) throw message.error

        const data = message.decrypted.data
        const partialInvoice = data.partialInvoice

        const whoAmI = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.$store.state.page.settings.account.address)
        const whoIsTheOther = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.receiver)

        const output = await this.$store.state.page.viewDisputeModal.showModal( { data, whoAmI,  whoIsTheOther,} )

        if (output && output.type === "update-dispute-status"){
          const out = await this.$store.state.page.updateDisputeModal.showModal({ data, whoAmI,  whoIsTheOther, })

          if (out && out.type === "updated-dispute"){
            const newInfo = {
              counter: data.info ? data.info.counter.plus(1) : Decimal_0,
              tx: out.tx,
              notes: out.notes,
              rejected: out.rejected,
              txVerified: out.txVerified,
            }
            newInfo.signature = ( await LibertyTown.crypto.sign(MyTextEncode(JSONStringify(newInfo))) ).toString("base64")

            this.attachment = {
              ...JSONParse(JSONStringify(data)),
              receiver: this.receiver,
              type: new Decimal(4),
              version: Decimal_0,
              typeDescription: "dispute update",
              info: newInfo,
            }
          }
        } else if (output && output.type === "show-propose-resolution"){

          let resolution
          if (whoAmI !== "moderator") throw "i should be moderator"
          if (whoIsTheOther === 'buyer') resolution = false
          else if (whoIsTheOther === 'seller') resolution = true
          else throw "invalid resolution"

          const out = await this.$store.state.page.proposeResolutionModal.showModal( { txId: data.tx, whoAmI, resolution } )
          if (out && out.type === "proposed-resolution"){
            this.attachment = {
              ...JSONParse(JSONStringify(data)),
              receiver: this.receiver,
              type: new Decimal(4),
              typeDescription: "dispute proposed resolution",
              version: Decimal_1,
              resolution,
              resolutionSignature: Buffer.from( await LibertyTown.invoices.multisig.moderatorSign( MyTextEncode( JSONStringify({
                privateKey: out.privateKey,
                txId: Buffer.from( data.tx, "hex").toString("base64"),
                payloadIndex: Decimal_0,
                resolution,
              }))) ).toString("base64"),
            }
          }
      } else if (output && output.type === "claim-payment"){

        if (data.version.eq(1))
          this.attachment = {
            ...JSONParse(JSONStringify(data)),
            receiver: this.receiver,
            type: new Decimal(4),
            version: new Decimal(2),
            typeDescription: "funds claimed",
          }

      } else if (output && output.type === "show-leave-review") {
          const out = await this.$store.state.page.leaveReviewModal.showModal({ allowIncludeItems: !!data.proofs.purchase })
          if (out) {
            this.$router.push({ path: `/chat/conversation/${partialInvoice.moderator}`, query: {
                newReview: JSONStringify({
                  review: {
                    score: out.score,
                    text: out.text,
                  },
                  partialInvoice,
                  tx: data.tx,
                  proofs: {
                    purchase: out.includePurchaseItems ? data.proofs.purchase : undefined,
                  }
                })}})
          }
        }

      }catch(e){
        return this.$store.dispatch('addToast', {type:"error", title:"Error processing your request", text: e.toString() })
      }

    },

    async viewReview(message ){
      try {

        if (message.error) throw message.error

        const data = message.decrypted.data
        const partialInvoice = data.partialInvoice

        const whoAmI = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.$store.state.page.settings.account.address)
        const whoIsTheOther = InvoiceUtils.invoiceWhoAmI(partialInvoice, this.receiver)

        const output = await this.$store.state.page.viewReviewModal.showModal( { data, whoAmI,  whoIsTheOther, } )

        if (output && ( output.type === "process-review" || output.type === "reject-review" ) ){

          const newInfo = {
            counter: data.info ? data.info.counter.plus(1) : Decimal_0,
            processed: output.type === "process-review",
            rejected: output.type === "reject-review",
          }
          newInfo.signature = ( await LibertyTown.crypto.sign( MyTextEncode( JSONStringify(newInfo)) ) ).toString("base64")

          this.attachment = {
            ...JSONParse(JSONStringify(data)),
            receiver: this.receiver,
            type: new Decimal(5),
            typeDescription: "new review",
            version: Decimal_1,
            info: newInfo,
          }

        }

      }catch(e){
        return this.$store.dispatch('addToast', {type:"error", title:"Error processing your request", text: e.toString() })
      }

    },

    loadAttachmentFromURI( to = this.$route, receiver = this.receiver){

      if (!receiver) return

      const messages = this.messagesFiltered
      let found, attachment

      if (to.query.listing){

        for (const key in messages)
          if (!messages[key].error && messages[key].decrypted.type.eq(2) && messages[key].decrypted.data.listing === to.query.listing)
            return

        attachment = {
          receiver: receiver,
          typeDescription: "listing",
          type: new Decimal(2),
          listing: to.query.listing,
        }
      }

      if (to.query.newOffer){
        const data = JSONParse(to.query.newOffer)
        this.showCreateInvoice( !data.type,
          [ { listing: data.listing, name: data.title, quantity: data.quantity, offer: data.offer.amount, price: data.offer.price } ],
            data.shipping,
        )
      }

      if (to.query.newDispute) {

        const data = JSONParse(to.query.newDispute)
        const partialInvoice = data.partialInvoice

        let foundKey = 0
        for (const key in messages)
          if (!messages[key].error && messages[key].decrypted.type.eq(4) && messages[key].decrypted.data.partialInvoice.id === partialInvoice.id && foundKey < Number.parseInt(key)) {
            found = messages[key]
            foundKey = Number.parseInt(key)
          }

        if (!found || (data.proofs.purchase && !found.decrypted.data.proofs.purchase) ||
            (data.proofs.delivery && !found.decrypted.data.proofs.delivery) ||
            (data.proofs.recipient && !found.decrypted.data.proofs.recipient) ) {

          attachment = {
            version: Decimal_0,
            proofs: {},
            partialInvoice,
            tx: data.tx,
            ...found ? JSONParse(JSONStringify(found.decrypted.data)) : {},
            receiver,
            type: new Decimal(4),
            typeDescription: "new dispute",
          }

          if (data.proofs.purchase) attachment.proofs.purchase = data.proofs.purchase
          if (data.proofs.delivery) attachment.proofs.delivery = data.proofs.delivery
          if (data.proofs.recipient) attachment.proofs.recipient = data.proofs.recipient

        }
      }

      if (to.query.newReview){

        const data = JSONParse(to.query.newReview)
        const partialInvoice = data.partialInvoice

        let foundKey = 0
        for (const key in messages)
          if (!messages[key].error && messages[key].decrypted.type.eq(5) && messages[key].decrypted.data.partialInvoice.id === partialInvoice.id && foundKey < Number.parseInt(key)) {
            found = messages[key]
            foundKey = Number.parseInt(key)
        }

        if (!found || (data.proofs.purchase && !found.decrypted.data.proofs.purchase)) {
          attachment = {
            version: Decimal_0,
            proofs: {},
            partialInvoice,
            tx: data.tx,
            ...found ? JSONParse(JSONStringify(found.decrypted.data)) : {},
            receiver,
            review: data.review,
            type: new Decimal(5),
            typeDescription: "new review",
          }

          if (data.proofs.purchase) attachment.proofs.purchase = data.proofs.purchase
        }

      }

      if (attachment) this.attachment = attachment

    },

    clear(receiver = this.receiver){
      if (receiver && this.attachment && this.attachment.receiver !== receiver) this.attachment = null
    },

    inputClicked(){
      return this.$store.commit('setConversationRead', {receiver: this.receiver })
    }

  },

  watch: {
    receiver: {
      immediate: true,
      async handler(val, oldVal) {
        if (val === oldVal) return
        this.clear(val)
        return this.load(val)
      }
    },
    "$route": {
      immediate: true,
      handler(to, oldVal){
        this.loadAttachmentFromURI(to, to.query.receiver)
      },
    },
  },

  beforeUnmount() {
  }

}
</script>

<style scoped>

.btn-send{
  width: 60px;
}

.chat-box{
  height: calc(100vh - 255px) !important;
  overflow-y: scroll;
}

.chat-conversation{
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHZpZXdCb3g9IjAgMCAyNjAgMjYwIiB4bWw6c3BhY2U9InByZXNlcnZlIj48c3R5bGU+LnN0MHtmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtmaWxsOiNlMWUwZTl9PC9zdHlsZT48ZyBpZD0iaS1saWtlLWZvb2QiPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNC40IDE2Yy4yLjYuNCAxLjMuNSAyaC0zLjdsMS4yIDIuMy41LjktLjIuMVYyOGMyLjIgMS43IDIuNyA0LjggMSA3LS44IDEtMS45IDEuNy0zLjIgMS45di4xYy0uOSAzLjUtNC4xIDYtNy44IDZoLTIwYy0zLjYgMC02LjgtMi41LTcuNy02di0uMWMtMi43LS40LTQuNi0zLTQuMi01LjcuMi0xLjMuOS0yLjUgMS45LTMuMnYtNi44bC0uOC0xLjYtLjQtLjkuOS0uNC42LS4zaC0zQy0xNy4yIDUuNi00LjktMi4yIDcuNS42IDE1LjQgMi4zIDIxLjkgOC4yIDI0LjQgMTZ6bS0zNi44IDJjLS4yIDAtLjMgMC0uNC4xbC0zLjEgMS42LjkgMS44IDEuMy0uN2MuOC0uNCAxLjgtLjQgMi43IDBsMi4yIDEuMWMuMy4xLjYuMS45IDBsMi4yLTEuMWMuOC0uNCAxLjgtLjQgMi43IDBsMi4yIDEuMWMuMy4xLjYuMS45IDBsMi4yLTEuMWMuOC0uNCAxLjgtLjQgMi43IDBsMi4yIDEuMWMuMi4xLjUuMS44IDBsMi45LTEuM2MuOC0uMyAxLjctLjMgMi40IDBsMi45IDEuM2MuMy4xLjYuMS45IDBsMy4xLTEuNS0uOS0xLjgtMS40LjdjLS44LjQtMS43LjQtMi42LjFsLTIuOC0xLjJjLS4yLS4yLS4zLS4yLS40LS4yLS4xIDAtLjMgMC0uNC4xbC0yLjggMS4yYy0uOC40LTEuOC4zLTIuNi0uMUw0IDE4LjFjLS4xLS4xLS4zLS4xLS40LS4xLS4yIDAtLjMgMC0uNC4xTDEgMTkuMmMtLjguNC0xLjguNC0yLjcgMEwtNCAxOC4xYy0uMS0uMS0uMy0uMS0uNC0uMS0uMiAwLS4zIDAtLjQuMUwtNyAxOS4yYy0uOC40LTEuOC40LTIuNyAwbC0yLjItMS4xYy0uMi0uMS0uNC0uMS0uNS0uMXptMC0yaC00LjlDLTEzLjUgNS4xLTEuNS0uNyA5LjUgMy4yYzYgMi4xIDEwLjcgNi44IDEyLjggMTIuOGgtMi4xbC0uMS0uMS0uMi4xaC0zMi4zem0zMC4zIDcuN2wxLjQtLjdoMS4zdjJoLTM2di0xLjFsLjMtLjIgMS40LS43aDIuNmwxLjQuN2MuOC40IDEuOC40IDIuNyAwbDEuNC0uN0gtM2wxLjQuN2MuOC40IDEuOC40IDIuNyAwbDEuMi0uN2gyLjZsMS40LjdjLjcuNCAxLjcuNCAyLjUgMGwxLjctLjdoMy4ybDEuNy43Yy44LjQgMS43LjQgMi41IDB6TS0xMy44IDI3bDE2LjQgNC45TDE4LjkgMjdoLTMyLjd6bS0uNiAyaC4zbDE2LjcgNSAxNi43LTVoLjNjMS43IDAgMyAxLjMgMyAzcy0xLjMgMy0zIDNoLTM0Yy0xLjcgMC0zLTEuMy0zLTNzMS4zLTMgMy0zem0xLjMgOGMuOCAyLjQgMy4xIDQgNS43IDRoMjBjMi41IDAgNC44LTEuNiA1LjctNGgtMzEuNHoiLz48cGF0aCBpZD0icGF0aDZfZmlsbC1jb3B5IiBjbGFzcz0ic3QwIiBkPSJNMjg0LjQgMTZjLjIuNi40IDEuMy41IDJoLTMuN2wxLjIgMi4zLjUuOS0uMi4xVjI4YzIuMiAxLjcgMi43IDQuOCAxIDctLjggMS0xLjkgMS43LTMuMiAxLjl2LjFjLS45IDMuNS00LjEgNi03LjggNmgtMjBjLTMuNiAwLTYuOC0yLjUtNy43LTZ2LS4xYy0yLjctLjQtNC42LTMtNC4yLTUuNy4yLTEuMy45LTIuNSAxLjktMy4ydi02LjhsLS44LTEuNi0uNC0uOS45LS40LjYtLjNoLTNDMjQyLjggNS42IDI1NS4xLTIuMiAyNjcuNS42YzcuOSAxLjcgMTQuNCA3LjYgMTYuOSAxNS40em0tMzYuOSAyYy0uMiAwLS4zIDAtLjQuMWwtMy4xIDEuNi45IDEuOCAxLjMtLjdjLjgtLjQgMS44LS40IDIuNyAwbDIuMiAxLjFjLjMuMS42LjEuOSAwbDIuMi0xLjFjLjgtLjQgMS44LS40IDIuNyAwbDIuMiAxLjFjLjMuMS42LjEuOSAwbDIuMi0xLjFjLjgtLjQgMS44LS40IDIuNyAwbDIuMiAxLjFjLjMuMS42LjEuOSAwbDIuOS0xLjNjLjgtLjMgMS43LS4zIDIuNCAwbDIuOSAxLjNjLjMuMS42LjEuOSAwbDMuMS0xLjUtLjktMS44LTEuNC43Yy0uOC40LTEuNy40LTIuNi4xbC0yLjgtMS4yYy0uMS0uMS0uMy0uMS0uNC0uMS0uMSAwLS4zIDAtLjQuMWwtMi44IDEuMmMtLjguNC0xLjguMy0yLjYtLjFsLTIuMy0xLjFjLS4xLS4xLS4zLS4xLS41LS4xcy0uMyAwLS40LjFsLTIuMiAxLjFjLS44LjQtMS44LjQtMi43IDBsLTIuMi0xLjFjLS4xLS4xLS4zLS4xLS40LS4xLS4yIDAtLjMgMC0uNC4xbC0yLjIgMS4xYy0uOC40LTEuOC40LTIuNyAwbC0yLjItMS4xYy0uMi0uMi0uNC0uMi0uNi0uMnptMC0yaC00LjljMy45LTEwLjkgMTUuOS0xNi43IDI2LjgtMTIuOCA2IDIuMSAxMC43IDYuOCAxMi44IDEyLjhoLTIuMWwtLjEtLjEtLjMuMWgtMzIuMnptMzAuNCA3LjdsMS40LS43aDEuM3YyaC0zNnYtMS4xbC4zLS4yIDEuNC0uN2gyLjZsMS40LjdjLjguNCAxLjguNCAyLjcgMGwxLjQtLjdoMi42bDEuNC43Yy44LjQgMS44LjQgMi43IDBsMS40LS43aDIuNmwxLjQuN2MuOC40IDEuNy40IDIuNi4xbDEuNy0uN2gzLjJsMS43LjdjLjUuMyAxLjQuMyAyLjItLjF6TTI0Ni4yIDI3bDE2LjQgNC45TDI3OSAyN2gtMzIuOHptLS43IDJoLjNsMTYuNyA1IDE2LjctNWguM2MxLjcgMCAzIDEuMyAzIDNzLTEuMyAzLTMgM2gtMzRjLTEuNyAwLTMtMS4zLTMtM3MxLjQtMyAzLTN6bTEuNCA4Yy44IDIuNCAzLjEgNCA1LjYgNGgyMGMyLjUgMCA0LjgtMS42IDUuNy00aC0zMS4zeiIvPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xNTkuNSAyMWMtMS4zLTMuNi00LjctNi04LjUtNmgtNDJjLTMuOCAwLTcuMiAyLjQtOC41IDYtMy4zLjMtNS44IDMuMi01LjUgNi41LjIgMi45IDIuNiA1LjIgNS41IDUuNS0xLjcgNC43LjggOS44IDUuNCAxMS41IDEgLjMgMiAuNSAzIC41aDQyYzUgMCA5LTQgOS05IDAtMS0uMi0yLjEtLjUtMyAzLjMtLjMgNS44LTMuMiA1LjUtNi41LS4yLTIuOS0yLjUtNS4yLTUuNC01LjV6bS04LjUtNGgtNDJjLTIuNyAwLTUuMiAxLjYtNi4zIDRoNTQuN2MtMS4yLTIuNC0zLjctNC02LjQtNHptLTkuMyAyNmMyLjEtMS43IDMuMy00LjMgMy4zLTdoLTJjMCAzLjktMy4xIDctNyA3aC00LjNjMi4xLTEuNyAzLjMtNC4zIDMuMy03aC0yYzAgMy45LTMuMSA3LTcgN2gtNC4zYzIuMS0xLjcgMy4zLTQuMyAzLjMtN2gtMmMwIDMuOS0zLjEgNy03IDdoLTdjLTMuOSAwLTctMy4xLTctN3MzLjEtNyA3LTdoNDJjMy45IDAgNyAzLjEgNyA3cy0zLjEgNy03IDdoLTkuM3pNMTA5IDI3Yy0zIDAtNS44IDEuNS03LjUgNGgtLjVjLTIuMiAwLTQtMS44LTQtNHMxLjgtNCA0LTRoNThjMi4yIDAgNCAxLjggNCA0cy0xLjggNC00IDRoLS41Yy0xLjctMi41LTQuNS00LTcuNS00aC00MnpNMzkgMTE1YzQuNCAwIDgtMy42IDgtOHMtMy42LTgtOC04LTggMy42LTggOCAzLjYgOCA4IDh6bTYtOGMwIDMuMy0yLjcgNi02IDZzLTYtMi43LTYtNiAyLjctNiA2LTYgNiAyLjcgNiA2em0tMy0yOXYtMmg4di02SDQwYy0yLjIgMC00IDEuOC00IDR2MTBIMjJsLTEuMyA0LS43IDJoMi4ybDMuOCA0MGgyNmwzLjgtNDBINThsLS43LTItMS4zLTRINDJ2LTZ6bS00LTR2MTBoMlY3NGg4di0yaC04Yy0xLjEgMC0yIC45LTIgMnptMiAxMmgxNC42bC43IDJIMjIuOGwuNy0ySDQwem0xMy44IDRIMjQuMmwzLjYgMzhoMjIuNGwzLjYtMzh6TTEyOSA5MmgtNnY0aC02djRoLTZ2MTRoLTNsLjIgMiAzLjggMzJoMzZsMy44LTMyIC4yLTJoLTN2LTE0aC02di00aC02di00aC04em0xOCAyMnYtMTJoLTR2NGgzdjhoMXptLTMgMHYtNmgtNHY2aDR6bS02IDZ2LTE2aC00djE5LjJjMS42LS43IDMtMS44IDQtMy4yem0tNiAzLjhWMTAwaC00djIzLjhjMS4zLjMgMi43LjMgNCAwem0tNi0uNlYxMDRoLTR2MTZjMSAxLjQgMi40IDIuNSA0IDMuMnptLTYtOS4ydi02aC00djZoNHptLTYgMHYtOGgzdi00aC00djEyaDF6bTI3LTEydi00aC00djRoM3Y0aDF2LTR6bS02IDB2LThoLTR2NGgzdjRoMXptLTYtNHYtNGgtNHY4aDF2LTRoM3ptLTYgNHYtNGgtNHY4aDF2LTRoM3ptNyAyNGM1LjkgMCAxMC45LTQuMiAxMS44LTEwaDcuOWwtMy41IDMwaC0zMi40bC0zLjUtMzBoNy45Yy45IDUuOCA1LjkgMTAgMTEuOCAxMHpNMjEyIDg2djJoLTR2LTJoNHptNCAwaC0ydjJoMnYtMnptLTIwIDBjLTIuNy43LTQuNSAzLjMtMy45IDYgLjQgMS44IDEuNiAzLjIgMy4zIDMuOGwuMS4yIDEuMSA0LjVjLjIuOSAxIDEuNSAxLjkgMS41bDcgMjQuNmMuMi45IDEgMS40IDEuOSAxLjRoNWMuOSAwIDEuNy0uNiAxLjktMS40bDctMjQuNmMuOSAwIDEuNy0uNiAxLjktMS41bDEuMS00LjUuMS0uMmMyLjYtLjkgNC4xLTMuNyAzLjItNi4zLS42LTEuNy0yLTMtMy44LTMuM1Y4NmMwLTcuNy02LjMtMTQtMTQtMTRTMTk2IDc4LjMgMTk2IDg2em00IDBoNnYyaC05Yy0xLjcgMC0zIDEuMy0zIDNzMS4zIDMgMyAzaDI2YzEuNyAwIDMtMS4zIDMtM3MtMS4zLTMtMy0zaC0zdi0yaDJjMC02LjYtNS40LTEyLTEyLTEycy0xMiA1LjQtMTIgMTJoMnptLTEuNCAxNGwtMS00aDI0LjlsLTEgNGgtMjIuOXptOC45IDI2bC02LjktMjRoMTguN2wtNi45IDI0aC00Ljl6TTE1MCAyNDJjMTIuMiAwIDIyLTkuOCAyMi0yMnMtOS44LTIyLTIyLTIyLTIyIDkuOC0yMiAyMiA5LjggMjIgMjIgMjJ6bTI0LTIyYzAgMTMuMy0xMC43IDI0LTI0IDI0cy0yNC0xMC43LTI0LTI0IDEwLjctMjQgMjQtMjQgMjQgMTAuNyAyNCAyNHptLTI4LjQgMTcuN2wyLS45YzEuNS0uNiAzLjItLjYgNC43IDBsMiAuOWMuOS40IDIgMCAyLjUtLjhsMS4xLTEuOWMuOC0xLjQgMi4yLTIuNCAzLjgtMi44bDIuMS0uNWMxLS4yIDEuNi0xLjEgMS41LTIuMWwtLjItMi4yYy0uMS0xLjYuNC0zLjIgMS40LTQuNWwxLjQtMS43Yy43LS44LjctMS45IDAtMi42bC0xLjQtMS43Yy0xLjEtMS4yLTEuNi0yLjgtMS40LTQuNWwuMi0yLjJjLjEtMS0uNi0xLjktMS42LTIuMWwtMi4xLS41Yy0xLjYtLjQtMy0xLjQtMy44LTIuOGwtMS4xLTEuOWMtLjUtLjktMS42LTEuMi0yLjUtLjhsLTIgLjljLTEuNS42LTMuMi42LTQuNyAwbC0yLS45Yy0uOS0uNC0yIDAtMi41LjhsLTEgMi4xYy0uOCAxLjQtMi4yIDIuNC0zLjggMi44bC0yLjEuNWMtMSAuMi0xLjYgMS4xLTEuNSAyLjFsLjIgMi4yYy4xIDEuNi0uNCAzLjItMS40IDQuNWwtMS40IDEuN2MtLjcuOC0uNyAxLjkgMCAyLjZsMS40IDEuN2MxLjEgMS4yIDEuNiAyLjggMS40IDQuNWwtLjIgMi4yYy0uMSAxIC42IDEuOSAxLjYgMi4xbDIuMS41YzEuNi40IDMgMS40IDMuOCAyLjhsMS4xIDEuOWMuNC43IDEuNSAxIDIuNC42em0yLjggMWMxLS40IDIuMS0uNCAzLjEgMGwyIC45YzEuOC44IDQgLjEgNS0xLjZsMS4xLTEuOWMuNi0uOSAxLjUtMS42IDIuNS0xLjhsMi4xLS41YzEuOS0uNCAzLjMtMi4zIDMuMS00LjJsLS4yLTIuMmMtLjEtMS4xLjMtMi4yIDEtM2wxLjQtMS43YzEuMy0xLjUgMS4zLTMuNyAwLTUuMmwtMS40LTEuN2MtLjctLjgtMS4xLTEuOS0xLTNsLjItMi4yYy4yLTItMS4xLTMuOC0zLjEtNC4ybC0yLjEtLjVjLTEuMS0uMi0yLS45LTIuNS0xLjhsLTEuMS0xLjljLTEtMS43LTMuMi0yLjQtNS0xLjZsLTIgLjljLTEgLjQtMi4xLjQtMy4xIDBsLTItLjljLTEuOC0uOC00LS4xLTUgMS42bC0xLjEgMS45Yy0uNi45LTEuNSAxLjYtMi41IDEuOGwtMi4xLjVjLTEuOS40LTMuMyAyLjMtMy4xIDQuMmwuMiAyLjJjLjEgMS4xLS4zIDIuMi0xIDNsLTEuNCAxLjdjLTEuMyAxLjUtMS4zIDMuNyAwIDUuMmwxLjQgMS43Yy43LjggMS4xIDEuOSAxIDNsLS4yIDIuMmMtLjIgMiAxLjEgMy44IDMuMSA0LjJsMi4xLjVjMS4xLjIgMiAuOSAyLjUgMS44bDEuMSAxLjljMSAxLjcgMy4yIDIuNCA1IDEuNmwyLS45ek0xNTIgMjA3YzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptNiAyYzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptLTExIDFjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem0tNiAwYzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptMy01YzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptLTggOGMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTMgNmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTAgNmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTQgN2MwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTUtMmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTUgNGMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTQtNmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTYtNGMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bS00LTNjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem00LTNjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem0tNS00YzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptLTI0IDZjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem0xNiA1YzIuOCAwIDUtMi4yIDUtNXMtMi4yLTUtNS01LTUgMi4yLTUgNSAyLjIgNSA1IDV6bTctNWMwIDMuOS0zLjEgNy03IDdzLTctMy4xLTctNyAzLjEtNyA3LTcgNyAzLjEgNyA3em04Ni0yOWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem0xOSA5YzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0tMTQgNWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem0tMjUgMWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem01IDRjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptOSAwYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xNSAxYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xMi0yYy0uNiAwLTEgLjQtMSAxcy40IDEgMSAxaDJjLjYgMCAxLS40IDEtMXMtLjQtMS0xLTFoLTJ6bS0xMS0xNGMwLS42LjQtMSAxLTFoMmMuNiAwIDEgLjQgMSAxcy0uNCAxLTEgMWgtMmMtLjYgMC0xLS40LTEtMXptLTE5IDBjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptNiA1YzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0tMjUgMTV2LTEuNGMtMi41LTEuMS0zLjctNC0yLjYtNi42LjItLjUuNS0xIC45LTEuNC0uOS0yIDAtNC4yIDEuOS01LjItLjgtMi42LjctNS40IDMuNC02LjIuNC0uNS45LS45IDEuNS0xLjEuNS0yLjcgMy4xLTQuNSA1LjgtNC4xLjcuMSAxLjQuNCAyIC44IDUuMy0zLjggMTEuNi01LjkgMTguMi01LjkgNi44IDAgMTMuMSAyLjIgMTguMiA1LjkgMi4zLTEuNiA1LjQtMSA3IDEuMy40LjYuNyAxLjMuOCAyIC42LjIgMS4xLjYgMS41IDEuMSAyLjcuOCA0LjIgMy41IDMuNCA2LjIgMS45IDEgMi43IDMuMiAxLjkgNS4yIDEuOSAyIDEuOCA1LjItLjIgNy0uNC40LS45LjctMS41IDF2Mi40aC02MnYtMWgtLjJ6bS44LTcuMmMtLjMgMS4yLS41IDIuNC0uNiAzLjYtMS4zLTEtMS42LTIuOS0uNi00LjIuNC4zLjguNSAxLjIuNnptMS41LTQuNmMtLjQuOS0uNyAxLjgtMSAyLjctMS0uNC0xLjYtMS41LTEuMy0yLjUuMi0uNS42LS45IDEuMS0xLjIuNC40LjguNyAxLjIgMXptMi4zLTQuNWwtMS41IDIuN2MtMS4zLTEtMS41LTIuOS0uNS00LjIuMS0uMi4zLS4zLjQtLjUuMy45LjkgMS42IDEuNiAyem0xLjItMS43Yy40LS41LjctMSAxLjEtMS41LS4zLS41LS45LS43LTEuNC0uNHMtLjcuOS0uNCAxLjRjLjIuMi40LjQuNy41em01LjMtNS44Yy0xIC45LTIgMS44LTIuOSAyLjgtLjMtLjMtLjctLjYtMS4xLS44LjQtMS42IDIuMS0yLjUgMy43LTIuMS4xIDAgLjIuMS4zLjF6bTQyLjcgMi44Yy0uOS0xLTEuOS0xLjktMi45LTIuOCAxLjUtLjYgMy4zLjEgMy45IDEuNyAwIC4xLjEuMi4xLjMtLjQuMi0uOC40LTEuMS44em0xLjMgMS41Yy40LjUuOCAxIDEuMSAxLjQuNS0uMS45LS43LjgtMS4ycy0uNy0uOS0xLjItLjhjLS4zLjItLjUuNC0uNy42em0zLjggNS45bC0xLjUtMi43Yy44LS40IDEuNC0xLjEgMS42LTIgMS4zIDEuMSAxLjQgMyAuNCA0LjItLjIuMi0uNC4zLS41LjV6bTEuNyA0LjVjLS4zLS45LS42LTEuOC0xLTIuNy40LS4zLjgtLjYgMS4yLTEgMSAuNSAxLjQgMS43IDEgMi43LS4yLjQtLjYuOC0xLjIgMXptMS4yIDUuNWMtLjEtMS4yLS40LTIuNC0uNi0zLjYuNS0uMS45LS40IDEuMi0uNiAxIDEuMy43IDMuMi0uNiA0LjJ6TTI3NSAyMTRjLS41LTE2LTEzLjktMjguNi0yOS45LTI4LjEtMTUuMy41LTI3LjYgMTIuOC0yOC4xIDI4LjFoNTh6TTcyLjMgMTk4LjFjLS4yLS4zLS4zLS43LS4zLTEuMXYtMTJoLTJ2MTJjMCAyLjIgMS44IDQgNCA0IDEuMiAwIDIuMy0uNSAzLjEtMS40LjYtLjcuOS0xLjYuOS0yLjV2LTEyaC0ydjEyYzAgMS4xLS45IDItMiAyLS43LS4xLTEuMy0uNC0xLjctMXpNNzUgMTc2Yy40IDAgLjcgMCAxLjEtLjEuNSAyLjIgMi42IDMuNSA0LjggMyAuNS0uMSAxLS4zIDEuNC0uNiAxLjEgMi4xIDEuNyA0LjQgMS43IDYuN3YyNGMwIDMuMy0yLjcgNi02IDZoLTN2OWMwIDIuOC0yLjIgNS01IDVzLTUtMi4yLTUtNXYtOWgtM2MtMy4zIDAtNi0yLjctNi02di0yNGMwLTcuNyA2LjMtMTQgMTQtMTQgMCAyLjggMi4yIDUgNSA1em0tMTcgMTV2MTJjMCAuOC41IDEuNSAxLjIgMS44LjkuNCAxLjkuMSAyLjQtLjcuMi0uMy4zLS43LjMtMS4xdi0xMmgydjEyYzAgMi4yLTEuNyA0LTMuOSA0LS41IDAtMS0uMS0xLjQtLjItLjItLjEtLjQtLjItLjctLjN2Mi41YzAgMi4yIDEuOCA0IDQgNGgxNmMyLjIgMCA0LTEuOCA0LTR2LTI0YzAtMS41LS4yLTIuOS0uNy00LjItLjQuMS0uOS4yLTEuMy4yLTIuMSAwLTQuMS0xLjEtNS4yLTMtMy0uMS01LjYtMi02LjUtNC45QzYyLjQgMTc0IDU4IDE3OSA1OCAxODV2NnptOSAyNHY5YzAgMS43IDEuMyAzIDMgM3MzLTEuMyAzLTN2LTloLTZ6TS0xNyAxOTFjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptMTkgOWMwLS42LjQtMSAxLTFoMmMuNiAwIDEgLjQgMSAxcy0uNCAxLTEgMUgzYy0uNiAwLTEtLjQtMS0xem0tMTQgNWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem0tMjUgMWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem01IDRjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptOSAwYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xNSAxYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xMi0yYy0uNiAwLTEgLjQtMSAxcy40IDEgMSAxaDJjLjYgMCAxLS40IDEtMXMtLjQtMS0xLTFINHptLTExLTE0YzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0tMTkgMGMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem02IDVjMC0uNi40LTEgMS0xaDJjLjYgMCAxIC40IDEgMXMtLjQgMS0xIDFoLTJjLS42IDAtMS0uNC0xLTF6bS0yNSAxNXYtMS40Yy0yLjUtMS4xLTMuNy00LTIuNi02LjYuMi0uNS41LTEgLjktMS40LS45LTIgMC00LjIgMS45LTUuMi0uOC0yLjYuNy01LjQgMy40LTYuMi40LS41LjktLjkgMS41LTEuMS41LTIuNyAzLjEtNC41IDUuOC00LjEuNy4xIDEuNC40IDIgLjggNS4zLTMuOCAxMS42LTUuOSAxOC4yLTUuOSA2LjggMCAxMy4xIDIuMiAxOC4yIDUuOSAyLjMtMS42IDUuNC0xIDcgMS4zLjQuNi43IDEuMy44IDIgLjYuMiAxLjEuNiAxLjUgMS4xIDIuNy44IDQuMiAzLjUgMy40IDYuMiAxLjkgMSAyLjcgMy4yIDEuOSA1LjIgMS45IDIgMS44IDUuMi0uMiA3LS40LjQtLjkuNy0xLjUgMXYyLjRoLTYydi0xaC0uMnptLjgtNy4yYy0uMyAxLjItLjUgMi40LS42IDMuNi0xLjMtMS0xLjYtMi45LS42LTQuMi40LjMuOC41IDEuMi42em0xLjUtNC42Yy0uNC45LS43IDEuOC0xIDIuNy0xLS40LTEuNi0xLjUtMS4zLTIuNS4yLS41LjYtLjkgMS4xLTEuMi40LjQuOC43IDEuMiAxem0yLjMtNC41bC0xLjUgMi43Yy0xLjMtMS0xLjUtMi45LS41LTQuMi4xLS4yLjMtLjMuNC0uNS4zLjkuOSAxLjYgMS42IDJ6bTEuMi0xLjdjLjMtLjUuNy0xIDEuMS0xLjUtLjMtLjUtLjktLjctMS40LS40cy0uNy45LS40IDEuNGMuMi4yLjQuNC43LjV6bTUuMy01LjhjLTEgLjktMiAxLjgtMi45IDIuOC0uMy0uMy0uNy0uNi0xLjEtLjguNC0xLjYgMi4xLTIuNSAzLjctMi4xLjEgMCAuMi4xLjMuMXpNOC44IDE5NGMtLjktMS0xLjktMS45LTIuOS0yLjggMS41LS42IDMuMy4xIDMuOSAxLjcgMCAuMS4xLjIuMS4zLS40LjItLjguNC0xLjEuOHptMS4zIDEuNWMuNC41LjggMSAxLjEgMS40LjUtLjEuOS0uNy44LTEuMi0uMS0uNS0uNy0uOS0xLjItLjgtLjMuMi0uNS40LS43LjZ6bTMuOCA1LjljLS41LS45LS45LTEuOC0xLjUtMi43LjgtLjQgMS40LTEuMSAxLjYtMiAxLjMgMS4xIDEuNCAzIC40IDQuMi0uMi4yLS40LjMtLjUuNXptMS44IDQuNWMtLjMtLjktLjYtMS44LTEtMi43LjQtLjMuOC0uNiAxLjItMSAxIC41IDEuNCAxLjcgMSAyLjctLjMuNC0uNy44LTEuMiAxem0xLjEgNS41Yy0uMS0xLjItLjQtMi40LS42LTMuNi41LS4xLjktLjQgMS4yLS42IDEgMS4zLjcgMy4yLS42IDQuMnpNMTUgMjE0Yy0uNS0xNi0xMy45LTI4LjYtMjkuOS0yOC4xLTE1LjMuNS0yNy42IDEyLjgtMjguMSAyOC4xaDU4eiIvPjwvZz48L3N2Zz4=");
  background-color: #f2f0f7;
  background-repeat: repeat;
  background-size: 210px;
  padding-bottom: 0px!important;
}

[data-layout-mode="dark"] .chat-conversation{
  background-image: url("data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHg9IjAiIHk9IjAiIHZpZXdCb3g9IjAgMCAyNjAgMjYwIiB4bWw6c3BhY2U9InByZXNlcnZlIj48c3R5bGU+LnN0MHtmaWxsLXJ1bGU6ZXZlbm9kZDtjbGlwLXJ1bGU6ZXZlbm9kZDtmaWxsOiMxNzFhMjR9PC9zdHlsZT48ZyBpZD0iaS1saWtlLWZvb2QiPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0yNC40IDE2Yy4yLjYuNCAxLjMuNSAyaC0zLjdsMS4yIDIuMy41LjktLjIuMVYyOGMyLjIgMS43IDIuNyA0LjggMSA3LS44IDEtMS45IDEuNy0zLjIgMS45di4xYy0uOSAzLjUtNC4xIDYtNy44IDZoLTIwYy0zLjYgMC02LjgtMi41LTcuNy02di0uMWMtMi43LS40LTQuNi0zLTQuMi01LjcuMi0xLjMuOS0yLjUgMS45LTMuMnYtNi44bC0uOC0xLjYtLjQtLjkuOS0uNC42LS4zaC0zQy0xNy4yIDUuNi00LjktMi4yIDcuNS42IDE1LjQgMi4zIDIxLjkgOC4yIDI0LjQgMTZ6bS0zNi44IDJjLS4yIDAtLjMgMC0uNC4xbC0zLjEgMS42LjkgMS44IDEuMy0uN2MuOC0uNCAxLjgtLjQgMi43IDBsMi4yIDEuMWMuMy4xLjYuMS45IDBsMi4yLTEuMWMuOC0uNCAxLjgtLjQgMi43IDBsMi4yIDEuMWMuMy4xLjYuMS45IDBsMi4yLTEuMWMuOC0uNCAxLjgtLjQgMi43IDBsMi4yIDEuMWMuMi4xLjUuMS44IDBsMi45LTEuM2MuOC0uMyAxLjctLjMgMi40IDBsMi45IDEuM2MuMy4xLjYuMS45IDBsMy4xLTEuNS0uOS0xLjgtMS40LjdjLS44LjQtMS43LjQtMi42LjFsLTIuOC0xLjJjLS4yLS4yLS4zLS4yLS40LS4yLS4xIDAtLjMgMC0uNC4xbC0yLjggMS4yYy0uOC40LTEuOC4zLTIuNi0uMUw0IDE4LjFjLS4xLS4xLS4zLS4xLS40LS4xLS4yIDAtLjMgMC0uNC4xTDEgMTkuMmMtLjguNC0xLjguNC0yLjcgMEwtNCAxOC4xYy0uMS0uMS0uMy0uMS0uNC0uMS0uMiAwLS4zIDAtLjQuMUwtNyAxOS4yYy0uOC40LTEuOC40LTIuNyAwbC0yLjItMS4xYy0uMi0uMS0uNC0uMS0uNS0uMXptMC0yaC00LjlDLTEzLjUgNS4xLTEuNS0uNyA5LjUgMy4yYzYgMi4xIDEwLjcgNi44IDEyLjggMTIuOGgtMi4xbC0uMS0uMS0uMi4xaC0zMi4zem0zMC4zIDcuN2wxLjQtLjdoMS4zdjJoLTM2di0xLjFsLjMtLjIgMS40LS43aDIuNmwxLjQuN2MuOC40IDEuOC40IDIuNyAwbDEuNC0uN0gtM2wxLjQuN2MuOC40IDEuOC40IDIuNyAwbDEuMi0uN2gyLjZsMS40LjdjLjcuNCAxLjcuNCAyLjUgMGwxLjctLjdoMy4ybDEuNy43Yy44LjQgMS43LjQgMi41IDB6TS0xMy44IDI3bDE2LjQgNC45TDE4LjkgMjdoLTMyLjd6bS0uNiAyaC4zbDE2LjcgNSAxNi43LTVoLjNjMS43IDAgMyAxLjMgMyAzcy0xLjMgMy0zIDNoLTM0Yy0xLjcgMC0zLTEuMy0zLTNzMS4zLTMgMy0zem0xLjMgOGMuOCAyLjQgMy4xIDQgNS43IDRoMjBjMi41IDAgNC44LTEuNiA1LjctNGgtMzEuNHoiLz48cGF0aCBpZD0icGF0aDZfZmlsbC1jb3B5IiBjbGFzcz0ic3QwIiBkPSJNMjg0LjQgMTZjLjIuNi40IDEuMy41IDJoLTMuN2wxLjIgMi4zLjUuOS0uMi4xVjI4YzIuMiAxLjcgMi43IDQuOCAxIDctLjggMS0xLjkgMS43LTMuMiAxLjl2LjFjLS45IDMuNS00LjEgNi03LjggNmgtMjBjLTMuNiAwLTYuOC0yLjUtNy43LTZ2LS4xYy0yLjctLjQtNC42LTMtNC4yLTUuNy4yLTEuMy45LTIuNSAxLjktMy4ydi02LjhsLS44LTEuNi0uNC0uOS45LS40LjYtLjNoLTNDMjQyLjggNS42IDI1NS4xLTIuMiAyNjcuNS42YzcuOSAxLjcgMTQuNCA3LjYgMTYuOSAxNS40em0tMzYuOSAyYy0uMiAwLS4zIDAtLjQuMWwtMy4xIDEuNi45IDEuOCAxLjMtLjdjLjgtLjQgMS44LS40IDIuNyAwbDIuMiAxLjFjLjMuMS42LjEuOSAwbDIuMi0xLjFjLjgtLjQgMS44LS40IDIuNyAwbDIuMiAxLjFjLjMuMS42LjEuOSAwbDIuMi0xLjFjLjgtLjQgMS44LS40IDIuNyAwbDIuMiAxLjFjLjMuMS42LjEuOSAwbDIuOS0xLjNjLjgtLjMgMS43LS4zIDIuNCAwbDIuOSAxLjNjLjMuMS42LjEuOSAwbDMuMS0xLjUtLjktMS44LTEuNC43Yy0uOC40LTEuNy40LTIuNi4xbC0yLjgtMS4yYy0uMS0uMS0uMy0uMS0uNC0uMS0uMSAwLS4zIDAtLjQuMWwtMi44IDEuMmMtLjguNC0xLjguMy0yLjYtLjFsLTIuMy0xLjFjLS4xLS4xLS4zLS4xLS41LS4xcy0uMyAwLS40LjFsLTIuMiAxLjFjLS44LjQtMS44LjQtMi43IDBsLTIuMi0xLjFjLS4xLS4xLS4zLS4xLS40LS4xLS4yIDAtLjMgMC0uNC4xbC0yLjIgMS4xYy0uOC40LTEuOC40LTIuNyAwbC0yLjItMS4xYy0uMi0uMi0uNC0uMi0uNi0uMnptMC0yaC00LjljMy45LTEwLjkgMTUuOS0xNi43IDI2LjgtMTIuOCA2IDIuMSAxMC43IDYuOCAxMi44IDEyLjhoLTIuMWwtLjEtLjEtLjMuMWgtMzIuMnptMzAuNCA3LjdsMS40LS43aDEuM3YyaC0zNnYtMS4xbC4zLS4yIDEuNC0uN2gyLjZsMS40LjdjLjguNCAxLjguNCAyLjcgMGwxLjQtLjdoMi42bDEuNC43Yy44LjQgMS44LjQgMi43IDBsMS40LS43aDIuNmwxLjQuN2MuOC40IDEuNy40IDIuNi4xbDEuNy0uN2gzLjJsMS43LjdjLjUuMyAxLjQuMyAyLjItLjF6TTI0Ni4yIDI3bDE2LjQgNC45TDI3OSAyN2gtMzIuOHptLS43IDJoLjNsMTYuNyA1IDE2LjctNWguM2MxLjcgMCAzIDEuMyAzIDNzLTEuMyAzLTMgM2gtMzRjLTEuNyAwLTMtMS4zLTMtM3MxLjQtMyAzLTN6bTEuNCA4Yy44IDIuNCAzLjEgNCA1LjYgNGgyMGMyLjUgMCA0LjgtMS42IDUuNy00aC0zMS4zeiIvPjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xNTkuNSAyMWMtMS4zLTMuNi00LjctNi04LjUtNmgtNDJjLTMuOCAwLTcuMiAyLjQtOC41IDYtMy4zLjMtNS44IDMuMi01LjUgNi41LjIgMi45IDIuNiA1LjIgNS41IDUuNS0xLjcgNC43LjggOS44IDUuNCAxMS41IDEgLjMgMiAuNSAzIC41aDQyYzUgMCA5LTQgOS05IDAtMS0uMi0yLjEtLjUtMyAzLjMtLjMgNS44LTMuMiA1LjUtNi41LS4yLTIuOS0yLjUtNS4yLTUuNC01LjV6bS04LjUtNGgtNDJjLTIuNyAwLTUuMiAxLjYtNi4zIDRoNTQuN2MtMS4yLTIuNC0zLjctNC02LjQtNHptLTkuMyAyNmMyLjEtMS43IDMuMy00LjMgMy4zLTdoLTJjMCAzLjktMy4xIDctNyA3aC00LjNjMi4xLTEuNyAzLjMtNC4zIDMuMy03aC0yYzAgMy45LTMuMSA3LTcgN2gtNC4zYzIuMS0xLjcgMy4zLTQuMyAzLjMtN2gtMmMwIDMuOS0zLjEgNy03IDdoLTdjLTMuOSAwLTctMy4xLTctN3MzLjEtNyA3LTdoNDJjMy45IDAgNyAzLjEgNyA3cy0zLjEgNy03IDdoLTkuM3pNMTA5IDI3Yy0zIDAtNS44IDEuNS03LjUgNGgtLjVjLTIuMiAwLTQtMS44LTQtNHMxLjgtNCA0LTRoNThjMi4yIDAgNCAxLjggNCA0cy0xLjggNC00IDRoLS41Yy0xLjctMi41LTQuNS00LTcuNS00aC00MnpNMzkgMTE1YzQuNCAwIDgtMy42IDgtOHMtMy42LTgtOC04LTggMy42LTggOCAzLjYgOCA4IDh6bTYtOGMwIDMuMy0yLjcgNi02IDZzLTYtMi43LTYtNiAyLjctNiA2LTYgNiAyLjcgNiA2em0tMy0yOXYtMmg4di02SDQwYy0yLjIgMC00IDEuOC00IDR2MTBIMjJsLTEuMyA0LS43IDJoMi4ybDMuOCA0MGgyNmwzLjgtNDBINThsLS43LTItMS4zLTRINDJ2LTZ6bS00LTR2MTBoMlY3NGg4di0yaC04Yy0xLjEgMC0yIC45LTIgMnptMiAxMmgxNC42bC43IDJIMjIuOGwuNy0ySDQwem0xMy44IDRIMjQuMmwzLjYgMzhoMjIuNGwzLjYtMzh6TTEyOSA5MmgtNnY0aC02djRoLTZ2MTRoLTNsLjIgMiAzLjggMzJoMzZsMy44LTMyIC4yLTJoLTN2LTE0aC02di00aC02di00aC04em0xOCAyMnYtMTJoLTR2NGgzdjhoMXptLTMgMHYtNmgtNHY2aDR6bS02IDZ2LTE2aC00djE5LjJjMS42LS43IDMtMS44IDQtMy4yem0tNiAzLjhWMTAwaC00djIzLjhjMS4zLjMgMi43LjMgNCAwem0tNi0uNlYxMDRoLTR2MTZjMSAxLjQgMi40IDIuNSA0IDMuMnptLTYtOS4ydi02aC00djZoNHptLTYgMHYtOGgzdi00aC00djEyaDF6bTI3LTEydi00aC00djRoM3Y0aDF2LTR6bS02IDB2LThoLTR2NGgzdjRoMXptLTYtNHYtNGgtNHY4aDF2LTRoM3ptLTYgNHYtNGgtNHY4aDF2LTRoM3ptNyAyNGM1LjkgMCAxMC45LTQuMiAxMS44LTEwaDcuOWwtMy41IDMwaC0zMi40bC0zLjUtMzBoNy45Yy45IDUuOCA1LjkgMTAgMTEuOCAxMHpNMjEyIDg2djJoLTR2LTJoNHptNCAwaC0ydjJoMnYtMnptLTIwIDBjLTIuNy43LTQuNSAzLjMtMy45IDYgLjQgMS44IDEuNiAzLjIgMy4zIDMuOGwuMS4yIDEuMSA0LjVjLjIuOSAxIDEuNSAxLjkgMS41bDcgMjQuNmMuMi45IDEgMS40IDEuOSAxLjRoNWMuOSAwIDEuNy0uNiAxLjktMS40bDctMjQuNmMuOSAwIDEuNy0uNiAxLjktMS41bDEuMS00LjUuMS0uMmMyLjYtLjkgNC4xLTMuNyAzLjItNi4zLS42LTEuNy0yLTMtMy44LTMuM1Y4NmMwLTcuNy02LjMtMTQtMTQtMTRTMTk2IDc4LjMgMTk2IDg2em00IDBoNnYyaC05Yy0xLjcgMC0zIDEuMy0zIDNzMS4zIDMgMyAzaDI2YzEuNyAwIDMtMS4zIDMtM3MtMS4zLTMtMy0zaC0zdi0yaDJjMC02LjYtNS40LTEyLTEyLTEycy0xMiA1LjQtMTIgMTJoMnptLTEuNCAxNGwtMS00aDI0LjlsLTEgNGgtMjIuOXptOC45IDI2bC02LjktMjRoMTguN2wtNi45IDI0aC00Ljl6TTE1MCAyNDJjMTIuMiAwIDIyLTkuOCAyMi0yMnMtOS44LTIyLTIyLTIyLTIyIDkuOC0yMiAyMiA5LjggMjIgMjIgMjJ6bTI0LTIyYzAgMTMuMy0xMC43IDI0LTI0IDI0cy0yNC0xMC43LTI0LTI0IDEwLjctMjQgMjQtMjQgMjQgMTAuNyAyNCAyNHptLTI4LjQgMTcuN2wyLS45YzEuNS0uNiAzLjItLjYgNC43IDBsMiAuOWMuOS40IDIgMCAyLjUtLjhsMS4xLTEuOWMuOC0xLjQgMi4yLTIuNCAzLjgtMi44bDIuMS0uNWMxLS4yIDEuNi0xLjEgMS41LTIuMWwtLjItMi4yYy0uMS0xLjYuNC0zLjIgMS40LTQuNWwxLjQtMS43Yy43LS44LjctMS45IDAtMi42bC0xLjQtMS43Yy0xLjEtMS4yLTEuNi0yLjgtMS40LTQuNWwuMi0yLjJjLjEtMS0uNi0xLjktMS42LTIuMWwtMi4xLS41Yy0xLjYtLjQtMy0xLjQtMy44LTIuOGwtMS4xLTEuOWMtLjUtLjktMS42LTEuMi0yLjUtLjhsLTIgLjljLTEuNS42LTMuMi42LTQuNyAwbC0yLS45Yy0uOS0uNC0yIDAtMi41LjhsLTEgMi4xYy0uOCAxLjQtMi4yIDIuNC0zLjggMi44bC0yLjEuNWMtMSAuMi0xLjYgMS4xLTEuNSAyLjFsLjIgMi4yYy4xIDEuNi0uNCAzLjItMS40IDQuNWwtMS40IDEuN2MtLjcuOC0uNyAxLjkgMCAyLjZsMS40IDEuN2MxLjEgMS4yIDEuNiAyLjggMS40IDQuNWwtLjIgMi4yYy0uMSAxIC42IDEuOSAxLjYgMi4xbDIuMS41YzEuNi40IDMgMS40IDMuOCAyLjhsMS4xIDEuOWMuNC43IDEuNSAxIDIuNC42em0yLjggMWMxLS40IDIuMS0uNCAzLjEgMGwyIC45YzEuOC44IDQgLjEgNS0xLjZsMS4xLTEuOWMuNi0uOSAxLjUtMS42IDIuNS0xLjhsMi4xLS41YzEuOS0uNCAzLjMtMi4zIDMuMS00LjJsLS4yLTIuMmMtLjEtMS4xLjMtMi4yIDEtM2wxLjQtMS43YzEuMy0xLjUgMS4zLTMuNyAwLTUuMmwtMS40LTEuN2MtLjctLjgtMS4xLTEuOS0xLTNsLjItMi4yYy4yLTItMS4xLTMuOC0zLjEtNC4ybC0yLjEtLjVjLTEuMS0uMi0yLS45LTIuNS0xLjhsLTEuMS0xLjljLTEtMS43LTMuMi0yLjQtNS0xLjZsLTIgLjljLTEgLjQtMi4xLjQtMy4xIDBsLTItLjljLTEuOC0uOC00LS4xLTUgMS42bC0xLjEgMS45Yy0uNi45LTEuNSAxLjYtMi41IDEuOGwtMi4xLjVjLTEuOS40LTMuMyAyLjMtMy4xIDQuMmwuMiAyLjJjLjEgMS4xLS4zIDIuMi0xIDNsLTEuNCAxLjdjLTEuMyAxLjUtMS4zIDMuNyAwIDUuMmwxLjQgMS43Yy43LjggMS4xIDEuOSAxIDNsLS4yIDIuMmMtLjIgMiAxLjEgMy44IDMuMSA0LjJsMi4xLjVjMS4xLjIgMiAuOSAyLjUgMS44bDEuMSAxLjljMSAxLjcgMy4yIDIuNCA1IDEuNmwyLS45ek0xNTIgMjA3YzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptNiAyYzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptLTExIDFjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem0tNiAwYzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptMy01YzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptLTggOGMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTMgNmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTAgNmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTQgN2MwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTUtMmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTUgNGMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTQtNmMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bTYtNGMwLS42LjQtMSAxLTFzMSAuNCAxIDEtLjQgMS0xIDEtMS0uNC0xLTF6bS00LTNjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem00LTNjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem0tNS00YzAtLjYuNC0xIDEtMXMxIC40IDEgMS0uNCAxLTEgMS0xLS40LTEtMXptLTI0IDZjMC0uNi40LTEgMS0xczEgLjQgMSAxLS40IDEtMSAxLTEtLjQtMS0xem0xNiA1YzIuOCAwIDUtMi4yIDUtNXMtMi4yLTUtNS01LTUgMi4yLTUgNSAyLjIgNSA1IDV6bTctNWMwIDMuOS0zLjEgNy03IDdzLTctMy4xLTctNyAzLjEtNyA3LTcgNyAzLjEgNyA3em04Ni0yOWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem0xOSA5YzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0tMTQgNWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem0tMjUgMWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem01IDRjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptOSAwYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xNSAxYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xMi0yYy0uNiAwLTEgLjQtMSAxcy40IDEgMSAxaDJjLjYgMCAxLS40IDEtMXMtLjQtMS0xLTFoLTJ6bS0xMS0xNGMwLS42LjQtMSAxLTFoMmMuNiAwIDEgLjQgMSAxcy0uNCAxLTEgMWgtMmMtLjYgMC0xLS40LTEtMXptLTE5IDBjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptNiA1YzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0tMjUgMTV2LTEuNGMtMi41LTEuMS0zLjctNC0yLjYtNi42LjItLjUuNS0xIC45LTEuNC0uOS0yIDAtNC4yIDEuOS01LjItLjgtMi42LjctNS40IDMuNC02LjIuNC0uNS45LS45IDEuNS0xLjEuNS0yLjcgMy4xLTQuNSA1LjgtNC4xLjcuMSAxLjQuNCAyIC44IDUuMy0zLjggMTEuNi01LjkgMTguMi01LjkgNi44IDAgMTMuMSAyLjIgMTguMiA1LjkgMi4zLTEuNiA1LjQtMSA3IDEuMy40LjYuNyAxLjMuOCAyIC42LjIgMS4xLjYgMS41IDEuMSAyLjcuOCA0LjIgMy41IDMuNCA2LjIgMS45IDEgMi43IDMuMiAxLjkgNS4yIDEuOSAyIDEuOCA1LjItLjIgNy0uNC40LS45LjctMS41IDF2Mi40aC02MnYtMWgtLjJ6bS44LTcuMmMtLjMgMS4yLS41IDIuNC0uNiAzLjYtMS4zLTEtMS42LTIuOS0uNi00LjIuNC4zLjguNSAxLjIuNnptMS41LTQuNmMtLjQuOS0uNyAxLjgtMSAyLjctMS0uNC0xLjYtMS41LTEuMy0yLjUuMi0uNS42LS45IDEuMS0xLjIuNC40LjguNyAxLjIgMXptMi4zLTQuNWwtMS41IDIuN2MtMS4zLTEtMS41LTIuOS0uNS00LjIuMS0uMi4zLS4zLjQtLjUuMy45LjkgMS42IDEuNiAyem0xLjItMS43Yy40LS41LjctMSAxLjEtMS41LS4zLS41LS45LS43LTEuNC0uNHMtLjcuOS0uNCAxLjRjLjIuMi40LjQuNy41em01LjMtNS44Yy0xIC45LTIgMS44LTIuOSAyLjgtLjMtLjMtLjctLjYtMS4xLS44LjQtMS42IDIuMS0yLjUgMy43LTIuMS4xIDAgLjIuMS4zLjF6bTQyLjcgMi44Yy0uOS0xLTEuOS0xLjktMi45LTIuOCAxLjUtLjYgMy4zLjEgMy45IDEuNyAwIC4xLjEuMi4xLjMtLjQuMi0uOC40LTEuMS44em0xLjMgMS41Yy40LjUuOCAxIDEuMSAxLjQuNS0uMS45LS43LjgtMS4ycy0uNy0uOS0xLjItLjhjLS4zLjItLjUuNC0uNy42em0zLjggNS45bC0xLjUtMi43Yy44LS40IDEuNC0xLjEgMS42LTIgMS4zIDEuMSAxLjQgMyAuNCA0LjItLjIuMi0uNC4zLS41LjV6bTEuNyA0LjVjLS4zLS45LS42LTEuOC0xLTIuNy40LS4zLjgtLjYgMS4yLTEgMSAuNSAxLjQgMS43IDEgMi43LS4yLjQtLjYuOC0xLjIgMXptMS4yIDUuNWMtLjEtMS4yLS40LTIuNC0uNi0zLjYuNS0uMS45LS40IDEuMi0uNiAxIDEuMy43IDMuMi0uNiA0LjJ6TTI3NSAyMTRjLS41LTE2LTEzLjktMjguNi0yOS45LTI4LjEtMTUuMy41LTI3LjYgMTIuOC0yOC4xIDI4LjFoNTh6TTcyLjMgMTk4LjFjLS4yLS4zLS4zLS43LS4zLTEuMXYtMTJoLTJ2MTJjMCAyLjIgMS44IDQgNCA0IDEuMiAwIDIuMy0uNSAzLjEtMS40LjYtLjcuOS0xLjYuOS0yLjV2LTEyaC0ydjEyYzAgMS4xLS45IDItMiAyLS43LS4xLTEuMy0uNC0xLjctMXpNNzUgMTc2Yy40IDAgLjcgMCAxLjEtLjEuNSAyLjIgMi42IDMuNSA0LjggMyAuNS0uMSAxLS4zIDEuNC0uNiAxLjEgMi4xIDEuNyA0LjQgMS43IDYuN3YyNGMwIDMuMy0yLjcgNi02IDZoLTN2OWMwIDIuOC0yLjIgNS01IDVzLTUtMi4yLTUtNXYtOWgtM2MtMy4zIDAtNi0yLjctNi02di0yNGMwLTcuNyA2LjMtMTQgMTQtMTQgMCAyLjggMi4yIDUgNSA1em0tMTcgMTV2MTJjMCAuOC41IDEuNSAxLjIgMS44LjkuNCAxLjkuMSAyLjQtLjcuMi0uMy4zLS43LjMtMS4xdi0xMmgydjEyYzAgMi4yLTEuNyA0LTMuOSA0LS41IDAtMS0uMS0xLjQtLjItLjItLjEtLjQtLjItLjctLjN2Mi41YzAgMi4yIDEuOCA0IDQgNGgxNmMyLjIgMCA0LTEuOCA0LTR2LTI0YzAtMS41LS4yLTIuOS0uNy00LjItLjQuMS0uOS4yLTEuMy4yLTIuMSAwLTQuMS0xLjEtNS4yLTMtMy0uMS01LjYtMi02LjUtNC45QzYyLjQgMTc0IDU4IDE3OSA1OCAxODV2NnptOSAyNHY5YzAgMS43IDEuMyAzIDMgM3MzLTEuMyAzLTN2LTloLTZ6TS0xNyAxOTFjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptMTkgOWMwLS42LjQtMSAxLTFoMmMuNiAwIDEgLjQgMSAxcy0uNCAxLTEgMUgzYy0uNiAwLTEtLjQtMS0xem0tMTQgNWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem0tMjUgMWMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem01IDRjLS42IDAtMSAuNC0xIDFzLjQgMSAxIDFoMmMuNiAwIDEtLjQgMS0xcy0uNC0xLTEtMWgtMnptOSAwYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xNSAxYzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0xMi0yYy0uNiAwLTEgLjQtMSAxcy40IDEgMSAxaDJjLjYgMCAxLS40IDEtMXMtLjQtMS0xLTFINHptLTExLTE0YzAtLjYuNC0xIDEtMWgyYy42IDAgMSAuNCAxIDFzLS40IDEtMSAxaC0yYy0uNiAwLTEtLjQtMS0xem0tMTkgMGMtLjYgMC0xIC40LTEgMXMuNCAxIDEgMWgyYy42IDAgMS0uNCAxLTFzLS40LTEtMS0xaC0yem02IDVjMC0uNi40LTEgMS0xaDJjLjYgMCAxIC40IDEgMXMtLjQgMS0xIDFoLTJjLS42IDAtMS0uNC0xLTF6bS0yNSAxNXYtMS40Yy0yLjUtMS4xLTMuNy00LTIuNi02LjYuMi0uNS41LTEgLjktMS40LS45LTIgMC00LjIgMS45LTUuMi0uOC0yLjYuNy01LjQgMy40LTYuMi40LS41LjktLjkgMS41LTEuMS41LTIuNyAzLjEtNC41IDUuOC00LjEuNy4xIDEuNC40IDIgLjggNS4zLTMuOCAxMS42LTUuOSAxOC4yLTUuOSA2LjggMCAxMy4xIDIuMiAxOC4yIDUuOSAyLjMtMS42IDUuNC0xIDcgMS4zLjQuNi43IDEuMy44IDIgLjYuMiAxLjEuNiAxLjUgMS4xIDIuNy44IDQuMiAzLjUgMy40IDYuMiAxLjkgMSAyLjcgMy4yIDEuOSA1LjIgMS45IDIgMS44IDUuMi0uMiA3LS40LjQtLjkuNy0xLjUgMXYyLjRoLTYydi0xaC0uMnptLjgtNy4yYy0uMyAxLjItLjUgMi40LS42IDMuNi0xLjMtMS0xLjYtMi45LS42LTQuMi40LjMuOC41IDEuMi42em0xLjUtNC42Yy0uNC45LS43IDEuOC0xIDIuNy0xLS40LTEuNi0xLjUtMS4zLTIuNS4yLS41LjYtLjkgMS4xLTEuMi40LjQuOC43IDEuMiAxem0yLjMtNC41bC0xLjUgMi43Yy0xLjMtMS0xLjUtMi45LS41LTQuMi4xLS4yLjMtLjMuNC0uNS4zLjkuOSAxLjYgMS42IDJ6bTEuMi0xLjdjLjMtLjUuNy0xIDEuMS0xLjUtLjMtLjUtLjktLjctMS40LS40cy0uNy45LS40IDEuNGMuMi4yLjQuNC43LjV6bTUuMy01LjhjLTEgLjktMiAxLjgtMi45IDIuOC0uMy0uMy0uNy0uNi0xLjEtLjguNC0xLjYgMi4xLTIuNSAzLjctMi4xLjEgMCAuMi4xLjMuMXpNOC44IDE5NGMtLjktMS0xLjktMS45LTIuOS0yLjggMS41LS42IDMuMy4xIDMuOSAxLjcgMCAuMS4xLjIuMS4zLS40LjItLjguNC0xLjEuOHptMS4zIDEuNWMuNC41LjggMSAxLjEgMS40LjUtLjEuOS0uNy44LTEuMi0uMS0uNS0uNy0uOS0xLjItLjgtLjMuMi0uNS40LS43LjZ6bTMuOCA1LjljLS41LS45LS45LTEuOC0xLjUtMi43LjgtLjQgMS40LTEuMSAxLjYtMiAxLjMgMS4xIDEuNCAzIC40IDQuMi0uMi4yLS40LjMtLjUuNXptMS44IDQuNWMtLjMtLjktLjYtMS44LTEtMi43LjQtLjMuOC0uNiAxLjItMSAxIC41IDEuNCAxLjcgMSAyLjctLjMuNC0uNy44LTEuMiAxem0xLjEgNS41Yy0uMS0xLjItLjQtMi40LS42LTMuNi41LS4xLjktLjQgMS4yLS42IDEgMS4zLjcgMy4yLS42IDQuMnpNMTUgMjE0Yy0uNS0xNi0xMy45LTI4LjYtMjkuOS0yOC4xLTE1LjMuNS0yNy42IDEyLjgtMjguMSAyOC4xaDU4eiIvPjwvZz48L3N2Zz4=");
  background-color: #1e232f;
}


.chat-input{
  background-color: #fff!important;
}

[data-layout-mode="dark"] .chat-input{
  background-color: #5b5f6a!important;
}

.chat-box.has-attachment{
  height: calc(100vh - 260px) !important;
  overflow-y: scroll;
}


.chat-input-section{
  border-top: none;
  padding: 8px 10px 8px 10px;
}

.grid-chat-attachment{
  display: grid;
  grid-template-columns: 50px 1fr;
}


.grid-chat-attachment i{
  font-size: 26px;
  padding: 12px 0;
}

.chatButton{
  border-radius:10px;
  border:none;
}

.chatButton i{
  font-size:20px;
}

</style>

<style>
.chat-conversation li .ctext-wrap{
  background-color: #fff !important;
  background-repeat: repeat-x;
  -webkit-box-shadow: 0 4px 8px 0 rgba(34,41,47,.12);
  box-shadow: 0 4px 8px 0 rgba(34,41,47,.12);
}

.chat-conversation li .message-content{
  border-radius: .357rem;
}

.chat-conversation .right .conversation-list .ctext-wrap{
  border-radius: 0;
}

.chat-conversation .right .conversation-list .message-content{
  border-radius: 8px 8px 0 8px;
  overflow: hidden;
}

.chat-conversation .right .ctext-wrap{
  background-color: #edffd9 !important;
}

[data-layout-mode="dark"] .chat-conversation li .ctext-wrap{
  background-color: #292f37 !important;
}

[data-layout-mode="dark"] .chat-conversation .right .ctext-wrap{
  background-color: #054640 !important;
}
</style>