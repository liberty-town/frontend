<template>
  <modal ref="modal" title="Backup your account">
    <template v-slot:body>

      <div class="alert alert-warning fade show mx-0">
<!--        备份私钥-->
        <p>
          <i class="fas fa-warning me-2"></i>
          LibertyTown is a decentralized and non-custodial market. You don't have a user name or password. Nobody
          takes custody of your funds. Similar to how
          cryptocurrencies work, your account is your wallet. Your data belongs exclusively to you.
        </p>
        <p>
          You must therefore export your account to access it later. Export your wallet to JSON by selecting it from the top right
          menu dropdown. You can simply import it back the following time you connect.
        </p>
      </div>

    </template>

    <template v-slot:footer>
      <div class="d-flex w-100 justify-content-center">
        <button type="button" class="btn btn-primary waves-effect waves-light" @click="closeModal">OK</button>
      </div>
    </template>

  </modal>

</template>

<script>
import Modal from "src/components/utils/modal"
export default {

  components:{Modal},

  methods:{
    async showModal(){
      await this.$refs.modal.showModal()
    },

    closeModal(){
      this.$refs.modal.closeModal()
    },
  },

}
</script>