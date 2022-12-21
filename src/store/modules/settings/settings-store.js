import mutations from "./settings-mutations"

export default {

    state: {
        theme: true,
        expert: false,
        seller: {
            recipient: "",
        },
        ui: {
            showListingsImages: true,
        }
    },

    mutations,
}
