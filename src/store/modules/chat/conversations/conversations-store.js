import actions from "./conversations-actions"
import mutations from "./conversations-mutations"

export default{
    state:{
        dict: {},
        start: Decimal_0,
        finished: false,
    },
    actions,
    mutations,
}