<template>
    <div>
      <div class="centerFlex " v-if="!initialized">
        <loading-spinner class="fs-1"/>
        <label class="ms-1">Loading...</label>
      </div>
      <router-view v-else></router-view>
    </div>
</template>

<script>
import LoadingSpinner from "src/components/utils/loading-spinner";
import config from "src/config"

export default {

  components: {LoadingSpinner},

  props: {
    options: {default: null},
  },

  data(){
    return {
      initialized: false,
    }
  },

  methods:{


    async start() {

      LibertyTown.events.listenEvents(async (name, data) => {

        if (data instanceof ArrayBuffer) data = new Uint8Array(data)
        if (data instanceof Uint8Array) data = MyTextDecode(data)

        if (name === "main" && data === "initialized"){

          await LibertyTown.events.listenNetworkNotifications((subscriptionType, key, data, extraInfo) => {

            if (extraInfo) extraInfo = MyTextDecode(extraInfo)
            if (data) data = MyTextDecode(data)

            if (subscriptionType === LibertyTown.enums.api.websockets.subscriptionType.SUBSCRIPTION_CHAT_ACCOUNT )
              return this.$store.dispatch('chatMessageNotification', JSONParse(data) )

          })

          this.$store.dispatch('GetSettings')
          await this.$store.dispatch('GetFederations')
          await this.$store.dispatch('GetAssets')

          this.$store.dispatch('LoadChat')

          if (typeof DEV_SERVER !== "undefined" && config.localhostValidator )
            try{
              const result = await LibertyTown.app.federationReplaceValidatorContactAddresses("LIBERTY16mmFxwUZ7chDm5GBnFvyZDLRFoy5WgBEDNdG3S7jVcaTUYkpzh", "LIBERTY16vqfAtQNmaFSRfggyGkVuLn5rbeGQyiSNHsML9MkZYTurAu2KY", "http://127.0.0.1:4005")
              console.log("result", result)
            }catch(e){
              console.error(e)
            }

          this.initialized = true
        }

        if (this.initialized){
          if (name === "settings" && data === "changed") {
            await this.$store.dispatch('GetSettings')
            this.$store.dispatch('LoadChat')
          }
          if (name === "federations" && data === "changed") await this.$store.dispatch('GetFederations')
          if (name === "assets" && data === "changed") await this.$store.dispatch('GetAssets')
        }

      })

      LibertyTown.helpers.start()

    },


  },

  mounted(){
    return this.start()
  },

}
</script>

<style>
.centerFlex {
  position: absolute;
  top: 50%;
  left: 50%;
  -ms-transform: translateX(-50%) translateY(-50%);
  -webkit-transform: translate(-50%,-50%);
  transform: translate(-50%,-50%);
}
</style>