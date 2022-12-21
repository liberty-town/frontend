<template>
  <modal ref="modal" title="Pay invoice" >
    <template v-slot:body>

      <div class="row">
        <div class="col-12">
          <label class="form-label">TX hash</label>
          <textarea :class="`form-control ${$validator.validateHash(tx) ? 'is-invalid' : ''}`" rows="2" v-model="tx" />
          <div v-if="$validator.validateHash(tx)" class="invalid-feedback">{{$validator.validateHash(tx)}}</div>
        </div>
      </div>

      <div class="row mt-2">
        <div class="col-12">
          <div class="form-check">
            <input type="checkbox" class="form-check-input cursor-pointer" id="tx-verified" v-model="txVerified">
            <label class="form-check-label cursor-pointer" for="tx-verified">Tx Hash Verified</label>
          </div>
        </div>
      </div>

      <div class="row mt-2">
        <div class="col-12">
          <label class="form-label">Public Notes</label>
          <textarea class="form-control" rows="8" v-model="notes" />
        </div>
      </div>

      <div class="row mt-2">
        <div class="col-12">
          <div class="form-check">
            <input type="checkbox" class="form-check-input cursor-pointer" id="rejected" v-model="rejected">
            <label class="form-check-label cursor-pointer" for="rejected">Dispute Rejected</label>
          </div>
        </div>
      </div>

    </template>

    <template v-slot:footer>
      <loading-button :disabled="!!$validator.validateHash(tx)" :submit="update" text="Update dispute" icon="fas fa-save"/>
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
      data: null,
      tx: "",
      notes: "",
      txVerified: false,
      rejected: false,
      result: null,
      whoAmI: "",
      generatedLink: "",
    }
  },

  computed:{

  },

  methods:{

    async showModal({data, whoAmI}) {
      Object.assign(this.$data, this.$options.data())

      this.data = data
      this.whoAmI = whoAmI

      this.tx = data.tx

      if (data.info){
        this.tx = data.info.tx || data.tx
        this.notes = data.info.notes
        this.txVerified = data.info.txVerified
        this.rejected = data.info.rejected
      }


      await this.$refs.modal.showModal()

      return this.result
    },

    update(){
      this.result = {type: "updated-dispute",
        tx: this.tx,
        notes: this.notes,
        txVerified: this.txVerified,
        rejected: this.rejected,
      }
      return this.closeModal()
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },

  },
}
</script>