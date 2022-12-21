import InvoiceUtils from "src/utils/invoice-utils";

export default {


    async loadMessages({state, dispatch, commit, getters, rootState}, receiver){

        try{

            if (!receiver) return

            commit('setLoading', true )

            if (state.dict[receiver] && state.dict[receiver].finished) return

            const count = await LibertyTown.chat.getMessages(MyTextEncode( JSONStringify({
                receiver: receiver,
                start: state.dict[receiver] ? state.dict[receiver].start : 0,
            })), async (data)=>{
                const it = JSONParse(MyTextDecode(data))
                await InvoiceUtils.decryptMessage(it.message, receiver, {dispatch, getters, state: rootState} )

                it.id = it.key
                delete it.key

                commit('newMessage', {it,  receiver, stored: true})
            } )

            commit('messagesLoaded', {receiver, count })

        }catch(e){
            dispatch('addToast', {type:"error", title:"Error retrieving messages", text: e.toString() })
        }finally{
            commit('setLoading', false )
        }

    },

}