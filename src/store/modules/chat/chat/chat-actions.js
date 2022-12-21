import InvoiceUtils from "src/utils/invoice-utils";
import {nextTick} from "vue";

export default {


    async LoadChat({state, dispatch, commit, getters} ){

        let resolve
        const promise = new Promise(async (res, reject)=> {
            resolve = res
        })

        commit('initConversations')
        commit('initMessages')
        commit('initChat', promise)

        try{
            resolve( await dispatch('loadConversations') )
        }catch(e){
            dispatch('addToast', {type:"error", title:"Error fetching data from chat federation", text: e.toString() })
        }finally{
            commit('loadedChat')
        }

        return promise
    },

    async loadConversations({state, dispatch, commit, getters, rootState}){

        try{

            const count = await LibertyTown.chat.getConversations(MyTextEncode( JSONStringify({
                start: rootState.conversations.start,
            })), (data) => {

                const conversation = JSONParse(MyTextDecode(data))
                commit('conversationLoaded', conversation )

            } )

            commit('conversationsLoaded', count)

            return true
        }catch(e){
            dispatch('addToast', {type:"error", title:`Error fetching conversations`, text: `There was an unexpected error fetching conversations. ${e.toString()}` })
            return false
        }
    },

    async chatMessageNotification({state, dispatch, commit, getters, rootState}, out ){

        try{

            let receiver
            if (out.message.first === rootState.page.settings.account.address) receiver = out.message.second
            else if (out.message.second === rootState.page.settings.account.address) receiver = out.message.first

            if (!receiver) return //invalid message

            await InvoiceUtils.decryptMessage( out.message, receiver, {dispatch, getters, state: rootState} )

            out.score = out.message.validation.timestamp

            commit( 'newConversation', { message: out.message, receiver } )
            commit( 'newMessage', { it: out, receiver, stored: true } )


        }catch(e){
            console.error("chat message notification", e)
        }
        return false

    }


}