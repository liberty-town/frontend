<template>
  <modal ref="modal" title="Leave Review" >
    <template v-slot:body>

      <div class="row">
        <div class="col-12">
          <label class="form-label">Overall feedback</label>
          <input type="number" class="form-control" placeholder="cumulative score" v-model.number="score" max="5" min="0">
        </div>
      </div>

      <div class="row mt-1">
        <div class="col-12">
          <stars :score="score" class="fa-2x"/>
        </div>
      </div>

      <div class="row mt-1">
        <div class="col-12">
          <label class="form-label">Anonymous Text</label>
          <textarea :class="`form-control ${textError ? 'is-invalid': ''}`" rows="4" placeholder="Review text" v-model="text"/>
          <div v-if="textError" class="invalid-feedback">{{textError}}</div>
        </div>
      </div>

      <div class="row mt-1" v-if="allowIncludeItems">
        <div class="col-12">
          <div class="form-check">
            <input type="checkbox" class="form-check-input cursor-pointer" id="review-include-items" v-model="includePurchaseItems">
            <label class="form-check-label cursor-pointer" for="review-include-items">Include Purchase Items</label>
          </div>
        </div>
      </div>

    </template>
    <template v-slot:footer>
      <div class="col-12 d-flex justify-content-end">
        <loading-button :disabled="!!textError" text="Submit review" :submit="sendReview" class="me-1" />
        <button class="btn btn-outline-secondary waves-effect" @click="closeModal">
          <i class="fas fa-ban"></i> Close
        </button>
      </div>
    </template>
  </modal>
</template>
<script>

import Stars from "../../reviews/stars";
import Modal from "src/components/utils/modal"
import LoadingButton from "src/components/utils/loading-button";

export default {

  components: {LoadingButton, Stars, Modal},

  data(){
    return {
      text: "",
      score: 5,
      allowIncludeItems: false,
      includePurchaseItems: false,
      result: null,
    }
  },

  computed:{

    textError(){
      if (this.text.length < 5) return "at least 5 characters"
      if (this.text > 512) return "maximum length 512 characters"
    }

  },

  methods:{
    async showModal({allowIncludeItems}) {
      Object.assign(this.$data, this.$options.data())

      this.allowIncludeItems = allowIncludeItems

      await this.$refs.modal.showModal()

      return this.result
    },
    closeModal(){
      this.$refs.modal.closeModal()
    },
    sendReview(){
      this.result = { score: this.score, text: this.text, includePurchaseItems: this.includePurchaseItems }
      return this.closeModal()
    },
  }

}
</script>