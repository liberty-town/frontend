export default {

    async SetSelectedFederation({state, dispatch, commit, getters}, federation){

        if (federation === state.selected) return

        const out = await LibertyTown.app.setSelectedFederation(federation);
        if (!out) throw "Invalid selection"

        commit('setSelectedFederation', federation)
        dispatch('AccountCheckRegistered' )
    },

    async GetFederations({state, dispatch, commit, getters}){
        const federations = JSONParse( MyTextDecode( await LibertyTown.app.getFederations() ) )
        commit('setFederations', federations )

        if (!state.selected)
            for (let key in federations)
                return dispatch('SetSelectedFederation', key)

    },

}