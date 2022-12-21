export default {

    selectedFederation: state => {
        if (!state.selected || !state.dict[state.selected]) return null
        return state.dict[state.selected]
    },

    isFederationModerator: (state, getters, rootState) => {
        if (!state.selected || !state.dict[state.selected]) return false
        const f  = state.dict[state.selected]

        if (f && rootState.page.settings.account) {
            for (const mod of f.moderators)
                if (mod.ownership.address === rootState.page.settings.account.address)
                    return true
        }
    },

    getFederationModerator: (state, getters, rootState) => (federation, moderator) => {

        const fed = state.dict[federation]
        if (!fed) return null

        for (const m of fed.moderators)
            if (m.ownership.address === moderator)
                return m

        return null
    },

}