<template>
  <div :class="`dropdown-menu dropdown-menu-end ${showMenu ? 'show': ''}`">

    <router-link :to="`/accounts/view/${ $store.state.page.settings.account.address }`"  v-tooltip.left="'View stored account in the federation'" class="dropdown-item">
      <i class="fas fa-mouse-pointer font-size-16 align-middle me-1"></i>
      View Account
    </router-link>

    <template v-if="!$store.state.page.accountRegistered" >
      <router-link to="/accounts/add"  v-tooltip.left="'Register account to the federation'" class="dropdown-item" >
        <i class="fas fa-user font-size-16 align-middle me-1 "></i>
        Register account
      </router-link>
    </template>

    <loading-button  :submit="copyAddress" text="Copy Address" icon="fas fa-copy font-size-16 align-middle me-1" tooltip="Copy address to clipboard" component="span" class-custom="dropdown-item cursor-pointer d-block" />
    <loading-button  :submit="renameAccount" text="Rename Account" icon="fas fa-pencil font-size-16 align-middle me-1" tooltip="Rename account" component="span" class-custom="dropdown-item cursor-pointer d-block" />
    <div class="dropdown-divider"></div>

    <loading-button :submit="showSecretWords" text="Show Secret Words (mnemonic)" icon="fas fa-key font-size-16 align-middle me-1" tooltip="Show your Secret Words (mnemonic)" component="span" class-custom="dropdown-item cursor-pointer d-block" />
    <loading-button :submit="importSecretWords" text="Import Secret Words" icon="fas fa-upload font-size-16 align-middle me-1" tooltip="Clear & import Secret Words (mnemonic)" component="span" class-custom="dropdown-item cursor-pointer d-block"/>
    <loading-button v-if="$store.state.settings.expert" :submit="showSecretEntropy" text="Show Secret Entropy" icon="fas fa-key font-size-16 align-middle me-1" tooltip="Show your Secret Words (mnemonic)" component="span" class-custom="dropdown-item cursor-pointer d-block" />
    <loading-button v-if="$store.state.settings.expert" :submit="importSecretEntropy" text="Import Secret Entropy" icon="fas fa-upload font-size-16 align-middle me-1" tooltip="Clear & import wallet from secret entropy" component="span" class-custom="dropdown-item cursor-pointer d-block"/>

    <loading-button :submit="exportToJSON" text="Export to JSON" icon="fas fa-download font-size-16 align-middle me-1" tooltip="Export account to JSON" component="span" class-custom="dropdown-item cursor-pointer d-block"/>
    <loading-button :submit="importFromJSON" text="Import from JSON" icon="fas fa-upload font-size-16 align-middle me-1" tooltip="Clear & import from JSON" component="span" class-custom="dropdown-item cursor-pointer d-block"/>

    <div class="dropdown-item cursor-pointer form-check form-switch" @click.stop="switchExpertMode" v-tooltip.bottom="`Switch between Expert and Basic mode of the Wallet.`">
      <input type="checkbox" class="form-check-input cursor-pointer" :checked="$store.state.settings.expert">
      <label class="form-check-label  cursor-pointer ms-1">Switch Expert Mode</label>
    </div>

    <div class="dropdown-item cursor-pointer form-check form-switch" @click.stop="switchTheme" v-tooltip.bottom="`Switch between Light and Dark theme.`">
      <input type="checkbox" class="form-check-input cursor-pointer" :checked="$store.state.settings.theme === 'dark'">
      <label class="form-check-label  cursor-pointer ms-1">Switch {{$store.state.settings.theme === 'dark' ? 'light' : 'dark' }} Mode</label>
    </div>

    <div class="dropdown-divider"></div>
    <loading-button :submit="clearNewAccount" text="New Account" icon="fas fa-trash font-size-16 align-middle me-1" tooltip="Clear & create new Account" component="span" class-custom="dropdown-item cursor-pointer d-block"/>

  </div>
</template>

<script>
import LoadingButton from "src/components/utils/loading-button"
import FileSaver from 'file-saver'
import config from "src/config"

export default {

  components: {LoadingButton},

  data(){
    return {
      showMenu: false,
    }
  },

  methods:{
    toggleShowMenu(){
      if (!this.showMenu) setTimeout( () => this.showMenu = !this.showMenu, 100)
    },
    closeMenu(){
      this.showMenu = false
    },
    async showSecretWords(){
      const secretWords = await LibertyTown.settings.manager.getSecretWords()
      this.$store.state.page.inputModal.showModal({title: "View Secret Words (mnemonic)", button: null,
        secret: { value: secretWords, title: "mnemonic", security: "DO NOT share this secret key with anyone!"}  })
    },

    async showSecretEntropy(){
      const data = await LibertyTown.settings.manager.getSecretEntropy()
      this.$store.state.page.inputModal.showModal({title: "View Secret Entropy", button: null,
        secret: { value: Buffer.from(data).toString("base64"), title: "entropy", security: "DO NOT share this secret key with anyone!"}  })
    },

    async clearNewAccount(){
      try{
        const confirmed = await this.$store.state.page.inputModal.showModal({
          title: "Clear existing account?", data: "It will clear your existing account and you will get a new wallet!",
          confirmation: {type: "warning"},
          button: { text: "Yes, I confirm", icon: 'fas fa-times', class:'btn btn-danger'} })
        if (!confirmed) return
        await this.$store.state.page.loadingModal.showModal()
        await LibertyTown.settings.manager.clear()
        this.$store.dispatch('addToast', {type:"success", title:"Success!", text: "Secret Words were imported" })
      }catch(e){
        throw e
      }finally{
        await this.$store.state.page.loadingModal.closeModal()
      }
    },

    async importSecretWords(){
      try{
        const words = await this.$store.state.page.inputModal.showModal({title: "Import Secret Words", textarea:{allowEdit: true, rows: 5}})
        if (!words) throw "Import Canceled"

        await this.$store.state.page.loadingModal.showModal()
        await LibertyTown.settings.manager.importSecretWords(words)
        this.$store.dispatch('addToast', {type:"success", title:"Success!", text: "Secret Words were imported" })
      }catch(e){
        throw e
      }finally{
        await this.$store.state.page.loadingModal.closeModal()
      }
    },

    async importSecretEntropy(){
      try{
        const input = await this.$store.state.page.inputModal.showModal({title: "Import Entropy", textarea:{allowEdit: true, rows: 5}})
        if (!input) throw "Import Canceled"

        await this.$store.state.page.loadingModal.showModal()
        await LibertyTown.settings.manager.importSecretEntropy(input)
        this.$store.dispatch('addToast', {type:"success", title:"Success!", text: "Entropy was imported" })
      }catch(e){
        throw e
      }finally{
        await this.$store.state.page.loadingModal.closeModal()
      }
    },

    async exportToJSON(){
      if (typeof Blob === "undefined") throw "Blob Blob is not supported by your Browser. Update your Browser."

      const jsonData = await LibertyTown.settings.manager[this.$store.state.settings.expert ? 'exportJSONAll': 'exportJSON']();
      if (!jsonData) return false;

      const json = MyTextDecode(jsonData)

      const fileName = config.name + "_" + this.$store.state.page.settings.account.address + ".liberty";

      const file = new Blob([json], {type: "application/json;charset=utf-8"});
      FileSaver.saveAs(file, fileName);

      return this.$store.dispatch('addToast', {
        type: 'success',
        title: `Wallet has been saved on your machine`,
        text: `The wallet has been saved in the downloads folder.`,
      });
    },

    async importFromJSON(){
      return this.$store.state.page.importAccountModal.showModal()
    },

    async copyAddress(){
      const addr = this.$store.state.page.settings.account.address
      await this.$copyText(addr)
      this.$store.dispatch('addToast', {
        type: 'success',
        title: `Copied to clipboard successfully`,
        text: `Address ${addr} copied to clipboard`,
      })
    },

    async renameAccount(){
      const newName = await this.$store.state.page.inputModal.showModal({title: "Rename account", input:{ allowEdit: true }, data: this.$store.state.page.settings.name })
      if (!newName) return

      await LibertyTown.settings.manager.rename(newName)
      this.$store.dispatch('addToast', { type: 'success',  title: `Success`,  text: `Account was renamed to: ${newName}`,})
    },

    switchExpertMode(){
      this.$store.commit('setExpert', !this.$store.state.settings.expert)
    },

    switchTheme(){
      this.$store.commit('setTheme', this.$store.state.settings.theme === 'dark' ? 'light' : 'dark' )
    }

  },

  mounted() {
    document.addEventListener('click', this.closeMenu)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  }

}
</script>

<style scoped>
.dropdown-menu{
  right: 10px
}
.form-check input{
  margin-left:0;
}
</style>