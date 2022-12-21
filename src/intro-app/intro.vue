<template>
  <div class="">
    <div class="content-wrapper">
      <div class="content-header row">
      </div>
      <div class="content-body center">
        <div class="misc-wrapper">
          <div class="misc-inner">
            <div class="w-100 text-center">

              <img :src="`/assets/liberty-town-logo-s${theme === 'dark' ? '-invert':''}.png`" alt="LibertyTown"/>

              <p class="mt-4 mb-2">
                <i v-if="isDownloading" class="fas fa-spinner fa-spin"></i>
                Please wait. {{progressStatus}}
              </p>

              <blockquote class="blockquote text-end border-end-primary border-end-3">
                <p>
                  I think that the Internet is going to be one of the major forces for reducing the role of government.
                  The one thing that's missing, but that will soon be developed, is a reliable e-cash - a method
                  whereby on the Internet you can transfer funds from A to B without A knowing B or B knowing A.
                </p>
                <footer class="blockquote-footer">
                  Milton Friedman
                  <cite title="Source Title">Economist and Nobel laureate</cite>
                </footer>
              </blockquote>

              <alert-box v-if="error">{{error}}</alert-box>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import WasmWebworkerIntegration from './wasm-webworker-integration'
import AlertBox from "../components/utils/alert-box";
import config from "../config"

export default {
  components: {AlertBox},
  data(){
    return {
      progressStatus: "Initialized",
      isDownloading: false,
      error: "",
      theme: "light",
    }
  },

  props: {
    options: {default: null },
  },

  mounted() {

    if (typeof window === "undefined") return;

    this.theme = ( localStorage.getItem('theme') || 'light' )

    document.getElementsByTagName("body")[0].setAttribute("data-layout-mode", this.theme )
    document.getElementsByTagName("body")[0].setAttribute("data-sidebar", this.theme )

    if (this.options.intro.startAutomatically) return this.start()

  },

  methods:{

    async start(){

      try{

        this.isDownloading = true;

        const wasmMainSri = global.SRI_WASM_MAIN || ''
        const wasmMainFileSize = global.SIZE_WASM_MAIN || 0

        const argv = ['js', '--node-consensus=app', '--tcp-max-clients="5"' ]
        if (config.debug) argv.push('--network=devnet')

        const integration = new WasmWebworkerIntegration( "LibertyTown", LibertyTownUIOptions.resPrefix + "wasm/LibertyTown-main.wasm?"+wasmMainSri, wasmMainSri, wasmMainFileSize, argv, this.options.resPrefix + "workers/LibertyTown-webworker-wasm.js", (status)=>{
          console.log("Main status:", status)
          this.progressStatus = status
        }, async ()=>{

          await LibertyTown.helpers.test()
          this.progressStatus = "WASM is working!"

          await LibertyTownUI.loadApp()

        })

        const data = await integration.downloadWasm(status => this.progressStatus = status )

        this.progressStatus = "Web Worker created"
        await integration.createWorker()

        this.progressStatus = "WASM instantiating..."
        integration.initialize( data )

      }catch(err){
        this.error = err.toString()
      }

    }
  },

}
</script>

<style scoped>
@media screen and (max-width: 576px) {
  .content-body {
    width: 100%;
  }
  p{
    font-size: 0.812rem !important;
  }
}

p{
  font-size: 1rem
}

</style>