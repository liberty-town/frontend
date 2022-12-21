export default {

    async GetSettings({state, dispatch, commit, getters} ){
        commit('setSettings', JSONParse( MyTextDecode( await LibertyTown.settings.get() ) ) )
        return dispatch('AccountCheckRegistered')
    },

    async AccountCheckRegistered({state, dispatch, commit, getters} ){
        try{
            const result = await LibertyTown.accounts.get(JSONStringify({} ))
            if (!result) return commit('setAccountRegistered', null )

            const data = MyTextDecode( result )
            commit('setAccountRegistered', JSONParse(data) )
        }catch(e){
            commit('setAccountRegistered', null )
        }
    },

}