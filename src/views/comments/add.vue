<template>

  <div class="p-3 chat-input-section">
    <div class="row">
      <div class="col">
        <div class="position-relative">
          <textarea class="form-control chat-input" placeholder="Enter Comment..." v-model="content" />
        </div>
      </div>
      <div class="col-auto">
        <loading-button :submit="publishComment" text="Publish" icon="fa fa-paper-plane" class="btn btn-primary btn-rounded chat-send w-md waves-effect waves-light"/>
      </div>
    </div>
  </div>

</template>

<script>
import LoadingButton from "../../components/utils/loading-button";
export default {

  components: {LoadingButton},

  data() {
    return {
      content: "",
    }
  },

  props: {
    thread: {default: ""},
  },

  methods:{

    async publishComment(){

      this.data = null

      const data = JSONParse( MyTextDecode( await LibertyTown.comments.store( JSONStringify({
        content: this.content,
        thread: this.thread,
      }), (data) => this.$store.state.page.validatorModal.showModal(data) ) ))

      if (!data || !data.comment || !data.results) throw "Not found"
      if (data.results.eq(0)) throw "Return result is false"

      this.$store.dispatch('addToast', {type:"success", title:`Comment ${this.query?'updated':'published'}`, text: "Success!" })
      this.content = ""

      this.$emit('submit', data.comment)
    }

  }

}
</script>