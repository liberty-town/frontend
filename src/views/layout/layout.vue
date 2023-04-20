<!--页面布局-->
<template>
  <div>

    <nav-bar-menu @toggleMainMenu="toggleMainMenu"/>
    <main-menu v-if="mainMenu || $store.state.page.width >= 992 "/>

    <div class="main-content">
      <div class="page-content">
        <div class="container-fluid">

          <div class="row">
            <div class="col-12">
              <div class="page-title-box d-sm-flex align-items-center justify-content-between">
                <h4 v-if="$store.state.page.title" class="mb-sm-0 font-size-18">{{$store.state.page.title}}</h4>

                <div class="page-title-right">
                  <slot name="top"/>
                </div>

              </div>
            </div>
          </div>

          <slot/>

        </div>
      </div>
    </div>

<!--    全局组件-->
    <validator-modal ref="validatorModal"/>
    <create-invoice-modal ref="createInvoiceModal"/>
    <view-invoice-modal ref="viewInvoiceModal" />
    <pay-invoice-modal ref="payInvoiceModal" />
    <input-modal ref="inputModal"/>
    <loading-modal ref="loadingModal" />
    <import-account-modal ref="importAccountModal"/>
    <propose-resolution-modal ref="proposeResolutionModal"/>
    <view-dispute-modal ref="viewDisputeModal"/>
    <update-dispute-modal ref="updateDisputeModal"/>
    <leave-review-modal ref="leaveReviewModal"/>
    <view-review-modal ref="viewReviewModal"/>
    <share-information-modal ref="shareInformationModal"/>
    <change-federation-modal ref="changeFederationModal"/>
    <add-review-modal ref="addReviewModal"/>

    <toasts/>

  </div>
</template>

<script>
import NavBarMenu from "./nav-bar-menu";
import MainMenu from "./main-menu";
import ValidatorModal from "../validator/validator-modal";
import CreateInvoiceModal from "../chat/invoice/create-invoice-modal"
import ViewInvoiceModal from "../chat/invoice/view-invoice-modal";
import Toasts from "./toasts";
import InputModal from "./modals/input-modal";
import LoadingModal from "./modals/loading-modal";
import ImportAccountModal from "./modals/import-account-modal";
import PayInvoiceModal from "../chat/invoice/pay-invoice-modal";
import ProposeResolutionModal from "../chat/invoice/propose-resolution-modal";
import ViewDisputeModal from "../chat/dispute/view-dispute-modal";
import UpdateDisputeModal from "../chat/dispute/update-dispute-modal";
import LeaveReviewModal from "../chat/review/leave-review-modal";
import ViewReviewModal from "../chat/review/view-review-modal";
import ShareInformationModal from "../chat/dispute/share-information-modal";
import ChangeFederationModal from "./modals/change-federation-modal";
import AddReviewForm from "../reviews/add-review-form";
import AddReviewModal from "../reviews/add-review-modal";

export default {

  components: {
    AddReviewModal,
    AddReviewForm,
    UpdateDisputeModal, ProposeResolutionModal, PayInvoiceModal, ImportAccountModal, ViewDisputeModal, LeaveReviewModal,
    LoadingModal, InputModal, ViewInvoiceModal, Toasts, ValidatorModal, MainMenu, NavBarMenu, CreateInvoiceModal,
    ViewReviewModal, ShareInformationModal, ChangeFederationModal,
  },

  data(){
    return {
      mainMenu: false,
    }
  },

  props:{
    app: {default: ''}
  },

  methods:{

    toggleMainMenu(){
      if (!this.mainMenu) setTimeout( () => this.mainMenu = !this.mainMenu, 100)
    },

    storeModals(){
      this.$store.commit('setModals', {
        validatorModal: this.$refs.validatorModal,
        createInvoiceModal: this.$refs.createInvoiceModal,
        viewInvoiceModal: this.$refs.viewInvoiceModal,
        inputModal: this.$refs.inputModal,
        loadingModal: this.$refs.loadingModal,
        importAccountModal: this.$refs.importAccountModal,
        payInvoiceModal: this.$refs.payInvoiceModal,
        proposeResolutionModal: this.$refs.proposeResolutionModal,
        viewDisputeModal: this.$refs.viewDisputeModal,
        updateDisputeModal: this.$refs.updateDisputeModal,
        leaveReviewModal: this.$refs.leaveReviewModal,
        viewReviewModal: this.$refs.viewReviewModal,
        shareInformationModal: this.$refs.shareInformationModal,
        changeFederationModal: this.$refs.changeFederationModal,
        addReviewModal: this.$refs.addReviewModal,
      })
      this.$store.commit('setModalVisibility', false)
    }
  },

  mounted() {
    document.addEventListener('click', () => this.mainMenu = false)
    return this.storeModals()
  },

  beforeUpdate() {
    return this.storeModals()
  },

  beforeUnmount() {
    document.removeEventListener('click', () => this.mainMenu = false )
  },

}
</script>

<style >
.avatar{
  background-color: white;
}
</style>