import actions from "./chat-actions"
import mutations from "./chat-mutations"

export default {

    state: {

        loading: false,
        loadingPromise: null,

    },

    mutations,
    actions,
}