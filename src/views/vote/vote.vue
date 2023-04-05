<template>
  <div class="vote-area">

      <div :class="`vote-div ${voted === 1 ? 'voted':'vote'}`"  @click="vote(1)">
        <loading-spinner v-if="voting === 1" class="fs-4 "/>
        <i v-else class="fas fa-chevron-up fs-4" />
      </div>

      <div class="vote-text">
        {{ score }}
      </div>

    <div :class="`vote-div ${voted === -1 ? 'voted':'vote'}`"  @click="vote(-1)">
        <loading-spinner v-if="voting === -1" class="fs-4"/>
        <i v-else class="fas fa-chevron-down fs-4 "/>
      </div>

  </div>
</template>

<script>
import LoadingSpinner from "../../components/utils/loading-spinner";
export default {

  components: {LoadingSpinner},

  props:{
    identity: {default: ""},
    poll: {default: null},
  },

  data(){
    return {
      voting: 0,
      voted: 0,
    }
  },

  computed:{
    score(){
      if (!this.poll) return Decimal_0

      let score = new Decimal(0)
      for (const vote of this.poll.list){
        score = score.plus(vote.up)
        score = score.minus(vote.down)
      }

      return score
    },
  },

  methods: {
    async vote(vote){

      if (this.voting !== 0 || this.voted === vote ) return

      try {
        this.voting = vote

        this.data = null

        const data = JSONParse(MyTextDecode(await LibertyTown.polls.vote(JSONStringify({
          identity: this.identity,
          vote,
        }), (data) => this.$store.state.page.validatorModal.showModal(data))))

        if (!data || !data.poll || !data.results) throw "Not found"
        if (data.results.eq(0)) throw "Return result is false"

        this.$store.dispatch('addToast', {type: "success", title: `Vote has been successful`, text: "Success!"})

        if (vote > 0)
          this.poll.list[0].up = this.poll.list[0].up.plus(vote)
        else
          this.poll.list[0].down = this.poll.list[0].down.plus(-vote)

        if (localStorage)
          localStorage.setItem('vote:'+this.identity, vote )

        this.voted = vote

        this.$emit('submit', { poll: data.poll, vote } )

      }catch(e){
        this.$store.dispatch('addToast', {type: "error", title: `Error submitting vote`, text: e.toString()})
      }finally{
        this.voting = 0
      }
    },

    loadVote(identity = this.identity){
      try{

        const str = localStorage.getItem('vote:'+identity)
        if (str.length){
          const v = Number.parseInt(str)
          if (!Number.isNaN(v))
            this.voted = v
        }

      }catch(e){
        console.error("error loading vote")
      }
    },

  },

  watch: {

    identity: {
      immediate: true,
      handler: async function (newVal, oldVal) {
        if (newVal !== oldVal) this.voted = 0
        this.loadVote(newVal)
      }
    },

  },

  mounted(){
    this.loadVote()
  },

}
</script>

<style scoped>
.vote-area{
  top: 10px;
  left: -40px;
  width: 40px;
  text-align: center;
}

.vote-div.vote:hover{
  color: red;
  cursor: pointer;
}
.vote-div.voted{
  color: darkblue;
}
.vote-text{
}
</style>