function setTheme(value){
    document.getElementsByTagName("body")[0].setAttribute("data-layout-mode", value )
    document.getElementsByTagName("body")[0].setAttribute("data-sidebar", value )
}

export default {

    setTheme(state, value ){

        state.theme = value;
        setTheme(value)
        localStorage.setItem('theme', value  )

    },

    readLocalStorage(state){
        state.theme = ( localStorage.getItem('theme') || 'light' )
        setTheme(state.theme)

        state.expert = ( localStorage.getItem('expert') || 'false' ) === 'true'

        state.seller = {
            recipient: "",
            ...JSONParse( localStorage.getItem('seller') || '{}'),
        }
        state.ui = {
            showListingsImages: true,
            ...JSONParse( localStorage.getItem('ui') || '{}'),
        }
    },

    setExpert(state, value){
        state.expert = value
        localStorage.setItem('expert', value ? 'true' : 'false' )
    },

    setSeller(state, newValue){
        state.seller = newValue
    },

    setUi(state, newValue){
        state.ui = newValue
    },

}