<template>
  <layout>
    <div class="card">
      <div class="card-body">
        <div class="wizard clearfix">
          <div class="steps clearfix">
            <ul class="tablist">
              <li :class="`${show === 'seller' ? 'current' : ''}  nav-item cursor-pointer`" @click="show='seller'">
                <a :class="`${show === 'seller' ? 'active' : ''} nav-link`"><i class="fas fa-shop number nav-link"/>Seller</a>
              </li>
              <li :class="`${show === 'ui' ? 'current' : ''}  nav-item cursor-pointer`" @click="show='ui'">
                <a :class="`${show === 'ui' ? 'active' : ''} nav-link`"><i class="fas fa-laptop number nav-link"/>UI</a>
              </li>
            </ul>
          </div>
          <div class="content clearfix">
            <div class="tab-content body">

              <div v-if="show === 'seller'" :class="`tab-pane ${show === 'seller' ? 'active':''}`">
                <div class="col-12 p-0">
                  <label class="form-label fw-bold me-1">Seller Recipient:</label>
                  <input type="text" :class="`form-control ${sellerRecipient.length < 15 ? 'is-invalid' : ''}`" v-model="sellerRecipient"/>
                  <div v-if="sellerRecipient.length < 15 " class="invalid-feedback">Invalid PCASH address.</div>
                </div>
              </div>

              <div v-if="show === 'ui'" :class="`tab-pane ${show === 'ui' ? 'active':''}`">
                <div class="col-12 p-0">
                  <div class="form-check">
                    <input type="checkbox" class="form-check-input cursor-pointer" id="show-listings-images" v-model="uiShowListingsImages">
                    <label class="form-check-label cursor-pointer" for="show-listings-images">Show Listings images</label>
                  </div>
                  <div class="alert alert-warning fade show mx-0 mt-2">
                    <p class="my-0">
                      <i class="fas fa-warning me-2"></i>
                      Take note. Enable the images only when using Tor or other highly secure proxies to access the gateway. Through the images, it is possible to log the visitors' IP addresses.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
        <div class="col-12 d-flex justify-content-end mt-4">
          <loading-button icon="fas fa-floppy-disk" text="Save" :submit="save" class="me-2"/>
          <button class="btn btn-outline-secondary waves-effect" @click="load">
            <i class="fas fa-ban"></i>
            Cancel
          </button>
        </div>
      </div>
    </div>
  </layout>
</template>

<script>
import Layout from "src/views/layout/layout"
import LoadingButton from "src/components/utils/loading-button";
import Multiselect from "src/components/utils/multiselect";

// 应用程序设置
export default {
  components: {LoadingButton, Layout, Multiselect},

  data(){
    return {
      show: "seller",
      sellerRecipient: "",
      uiShowListingsImages: false,
    }
  },

  methods:{
    load(){
      this.$store.commit('setPage',{
        title: "Settings",
        breadcrumbs: [{
          text: "Home",
          url: "/"
        },{
          text: `Settings`,
          url: "/settings",
        }]
      })

      // 加密货币地址
      this.sellerRecipient = this.$store.state.settings.seller.recipient || ""

      this.uiShowListingsImages = this.$store.state.settings.ui.showListingsImages

    },

    async save(){

      if (this.show === 'seller'){
        if (this.sellerRecipient.length < 15) throw "Invalid Recipient Address"
        await LibertyTown.PandoraPay.addresses.decodeAddress(this.sellerRecipient)

        this.$store.commit('setSeller', {recipient: this.sellerRecipient})
        localStorage.setItem('seller', JSON.stringify( this.$store.state.settings.seller ))
      }else if (this.show === 'ui'){
        this.$store.commit('setUi', {showListingsImages: this.uiShowListingsImages})
        localStorage.setItem('ui', JSON.stringify( this.$store.state.settings.ui ))
      }

      this.$store.dispatch('addToast', {
        type: 'success',
        title: `Successful!`,
        text: `Settings were stored succesfully.`
      })
    }

  },

  watch:{
    "$route":{
      immediate: true,
      handler(to, old){
        if (to === old) return
        this.load()
      }
    }
  }

}
</script>