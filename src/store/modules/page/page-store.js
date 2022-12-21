import actions from "./page-actions"
import mutations from "./page-mutations"

export default {

    state: {

        accountRegistered: null,
        settings: null,

        title: "home",
        breadcrumbs: [{text: 'home', url: '/'}],

        // 全局组件
        validatorModal: null,
        createInvoiceModal: null,
        viewInvoiceModal: null,
        inputModal: null,
        loadingModal: null,
        importAccountModal: null,
        payInvoiceModal: null,
        proposeResolutionModal: null,
        viewDisputeModal: null,
        updateDisputeModal: null,
        leaveReviewModal: null,
        viewReviewModal: null,
        shareInformationModal: null,
        changeFederationModal: null,

        width: 0,
        height: 0,

        modalVisible: false,

    },

    mutations,
    actions,
}