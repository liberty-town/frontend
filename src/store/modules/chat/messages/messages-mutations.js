export default {

    initMessages(state){
        state.dict = {}
    },

    newMessage(state, {it, receiver, stored = false} ){
        if (!state.dict[receiver])
            state.dict[receiver] = {
                messages: {},
                start: Decimal_0,
                finished: false,
            }
        it.message.stored = stored
        if (!state.dict[receiver].messages[it.id] || (stored && !state.dict[receiver].messages[it.id].message.stored ))
            state.dict[receiver].messages[it.id] = it
    },

    setLoading(state, val){
        state.loading = val
    },


    messagesLoaded(state, { count, receiver } ){
        if (!state.dict[receiver])
            state.dict[receiver] = {
                messages: {},
                start: Decimal_0,
                finished: false,
            }

        state.dict[receiver].start = state.dict[receiver].start.plus(count)
        state.dict[receiver].finished = count < LibertyTown.config.CHAT_MESSAGES_LIST_COUNT
    }

}