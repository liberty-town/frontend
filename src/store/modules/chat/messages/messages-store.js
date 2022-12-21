import mutations from './messages-mutations'
import actions from './messages-actions'

export default {

    state:{
        dict: {},
        index: new Decimal(Number.MAX_SAFE_INTEGER),
        loading: false,
    },

    mutations,
    actions,

}