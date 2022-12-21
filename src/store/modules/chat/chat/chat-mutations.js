export default {

    initChat(state, promise){
        if (state.loading) return
        state.loading = true
        state.loadingPromise = promise
    },

    loadedChat(state, ){
        state.loading = false
    },

}