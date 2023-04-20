<template>
  <modal ref="modal" title="Are you human?" class="modal-validator" style="z-index: 1060 !important;">
    <template v-slot:body >
      <div class="" :style="`min-height: ${height}px; min-width: ${width}px; `">
        <iframe :src="uri" id="challengeIframe" title="Solve Challenge" sandbox="allow-scripts" frameborder="0"  :style="`min-height: ${height}px; min-width: ${width}px; `" ></iframe>
      </div>
    </template>
  </modal>
</template>
<script>
import Modal from "../../components/utils/modal";
import HttpHelper from "../../utils/http-helper";

export default {
  components: {Modal},

  data(){
    return {
      uri: "",
      solution: null,
      width: 100,
      height: 100,
      final: null,
    }
  },

  methods:{
    async showModal(data){

      Object.assign(this.$data, this.$options.data())

      const out = JSONParse( data )

      const {origin, type, challengeUri} = out
      let init

      if (type.eq( LibertyTown.enums.validators.validations.VALIDATOR_CHALLENGE_HCAPTCHA) ){
        init = {sitekey: out.data}
      }else if (type.eq( LibertyTown.enums.validators.validations.VALIDATOR_CHALLENGE_CUSTOM) ){
        init = {origin, proof: JSON.stringify(out.proof) }
      }else throw "invalid type"

      if (!origin || typeof origin !== "string") throw "Invalid validator origin"
      if (!challengeUri || typeof challengeUri !== "string") throw "Invalid validator challengeUri"

      let uri = origin
      if (uri && uri[uri.length-1] !== '/') uri += '/'
      uri += challengeUri

      const handler = (event) => {

        //if (event.origin !== origin) return
        if (typeof event.data !== "object") return

        const object = event.data
        if (typeof object !== "object") return
        if (object.type === "solution") {
          this.solution = object.solution
          this.submit()
        }
        if (object.type === "resizeWidth") this.width = object.width
        if (object.type === "resizeHeight") this.height = object.height

        // 调试信息
        //if (object.type === "resizeWidth" || object.type === "resizeHeight") console.log(object)

        if (object.type === "ready")
          document.getElementById("challengeIframe").contentWindow.postMessage({type: "init", init}, '*')
      }

      window.addEventListener("message", handler, false);

      this.$nextTick(()=>{
        this.uri = uri
      })

      await this.$refs.modal.showModal()

      window.removeEventListener("message", handler, false);

      this.uri = ""

      return this.final
    },
    closeModal(){
      this.final = null
      this.$refs.modal.closeModal()
    },
    submit(){
      this.final = this.solution
      this.$refs.modal.closeModal()
    },

  },
}
</script>

<style scoped>
iframe{
  width: 100%
}
</style>