<template>
  <modal ref="modal" title="Add Review"  modal-class="modal-xl">
    <template v-slot:body>
      <add-review-form :account="account" :listing="listing" :update-type="updateType" :amount="amount" ref="addReviewForm" @success="success" />
    </template>
  </modal>
</template>

<script>
import Modal from "src/components/utils/modal"
import Multiselect from "../../components/utils/multiselect";
import AddReviewForm from "./add-review-form";

export default {
  components: {AddReviewForm, Multiselect, Modal },

  data(){
    return {
      account: "",
      listing: "",
      updateType: "",
      amount: null,
    }
  },

  methods:{

    async showModal( {account, listing, updateType, amount } ){

      Object.assign(this.$data, this.$options.data())

      this.account = account
      this.listing = listing
      this.updateType = updateType
      this.amount = amount

      await this.$refs.modal.showModal( async ()=>{
        await this.$refs.addReviewForm.load()
      })

    },

    closeModal(){
      this.$refs.modal.closeModal()
    },

    success(){
      return this.closeModal()
    }

  }

}
</script>