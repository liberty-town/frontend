<template>
  <div class="text-truncate">
    <template v-if="loaded">
      <p v-if="error" class="card-text text-warning">
        <i class="fa fa-circle-exclamation fe-1"/> Invalid message - {{error}}
      </p>
      <template v-else>
        <p v-if="$utils.bigNumberInList(type, [0, 1, 2, 3, 4, 5])" class="card-text">
          {{$strings.base64ToString(text)}}
          <i v-if="getIcon" :class="getIcon"/>
          <span v-if="getText" class="ms-25">{{getText}}</span>
        </p>
        <p class="card-text text-warning" v-else>
          <i class="fa fa-triangle-exclamation fe-1"/> Unknown type
        </p>
      </template>
    </template>
  </div>
</template>

<script>
import InvoiceUtils from "src/utils/invoice-utils"

export default {

  props: {
    message: {default: null},
    receiver: {default: null},
  },

  data(){
    return {
      loaded: false,
      type: null,
      data: null,
      text: null,
      signedAddress: null,
      error: null,
    }
  },

  computed:{
    getIcon(){
      switch (this.type){
        case 1: return "fas fa-paperclip"
        case 2:return "fas fa-store"
        case 3:return "fas fa-file-invoice-dollar"
        case 4:return "fas fa-face-angry"
      }
      return ""
    },
    getText(){
      switch (this.type){
        case 1: return "Attachment"
        case 2: return "Listing"
        case 3: return "Invoice update"
        case 4: return "Dispute update"
      }
      return ""
    }
  },

  methods:{
    async load(){
      try{
        this.loaded=false
        this.error = null

        await InvoiceUtils.decryptMessage(this.message, this.receiver, this.$store)

        if (this.message.error) this.error = this.message.error

        const data = this.message.decrypted
        this.data = data.data
        this.text = data.text
        this.type = data.type
        this.signedAddress = data.address

      }catch(e){
        this.error = e.toString()
      }finally{
        this.loaded=true
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