export default {

    async addToast({state, dispatch, commit, getters}, data = {type: "warning", timeout: 5000, title: "Warning", text: "This is a warning!" } ){
        commit('addToast', data )
    },

}