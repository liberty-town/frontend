export default {

    async GetAssets({state, dispatch, commit, getters}) {
        commit('setAssets', JSONParse(MyTextDecode(await LibertyTown.app.assets.get())))
    },

}