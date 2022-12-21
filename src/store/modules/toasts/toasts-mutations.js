export default {
    addToast(state, data ) {

        data.id = Math.random()
        state.list.push(data)

        setTimeout(()=>{
            for (let i=0; i < state.list.length; i++)
                if (state.list[i].id === data.id){
                    state.list.splice(i, 1)
                    break
                }
        }, data.timeout || 5000 )
    },
}