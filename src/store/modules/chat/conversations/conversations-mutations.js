export default {


    newConversation(state, {receiver, message = null}){
        if (!state.dict[receiver])
            return state.dict[receiver] = {
                receiver,
                message,
            }

        state.dict[receiver].message = message
    },

    conversationLoaded(state, conversation){

        state.dict[conversation.key] = {
            receiver: conversation.key,
            message: conversation.message,
        }

    },

    conversationsLoaded(state, count){
        if (count < LibertyTown.config.CHAT_CONVERSATIONS_LIST_COUNT) state.finished = true
        state.start = state.start.plus(count)
    },

    initConversations(state){
        state.dict = {}
        state.start = Decimal_0
        state.finished = false
    },


    setConversationRead(state, {receiver}){
        // for (const key in state.dict)
        //     if (state.dict[key].conversation.second === receiver || state.dict[key].conversation.first === receiver){
        //         state.dict[key].read = state.dict[key].conversation.messages
        //         localStorage.setItem('conversationRead:'+key, state.dict[key].read.toString() )
        //     }
    },

}