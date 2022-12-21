export default {

    setScreenInformation(state){
        const width = window.innerWidth
        const height = window.innerHeight

        state.width = width
        state.height = height

        if (width < 992 )
            document.body.classList.remove('vertical-collpsed')
        else
            document.body.classList.add('vertical-collpsed')

    },

    setAccountRegistered(state, account){
        state.accountRegistered = account
    },

    setSettings(state, settings){
        state.settings = settings
    },



    setPage(state, data){
        state.title = data.title
        if (data.breadcrumbs) state.breadcrumbs = data.breadcrumbs
    },

    setModals(state, modals ){
        state.validatorModal = modals.validatorModal
        state.createInvoiceModal = modals.createInvoiceModal
        state.viewInvoiceModal = modals.viewInvoiceModal
        state.inputModal = modals.inputModal
        state.loadingModal = modals.loadingModal
        state.importAccountModal = modals.importAccountModal
        state.payInvoiceModal = modals.payInvoiceModal
        state.proposeResolutionModal = modals.proposeResolutionModal
        state.viewDisputeModal = modals.viewDisputeModal
        state.updateDisputeModal = modals.updateDisputeModal
        state.leaveReviewModal = modals.leaveReviewModal
        state.viewReviewModal = modals.viewReviewModal
        state.shareInformationModal = modals.shareInformationModal
        state.changeFederationModal = modals.changeFederationModal
    },

    setModalVisibility(state, modalVisible){
        state.modalVisible = modalVisible
        if (modalVisible){
            document.body.classList.add('modal-open')
            document.getElementById('foreground').classList.add('modal-backdrop', 'fade','show')
        }else {
            document.body.classList.remove('modal-open')
            document.getElementById('foreground').classList.remove('modal-backdrop', 'fade','show')
        }
    }

}