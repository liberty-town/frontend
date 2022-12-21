export default {

    setAssets(state, data) {

        for (const name in data.currencies)
            state.all['currency-'+name] = data.currencies[name]

        for (const name in data.assets)
            state.all['asset-'+name] = data.assets[name]

    },

}