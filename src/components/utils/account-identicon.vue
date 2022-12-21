<template>
  <identicon :hash="identiconHash" :size="size" :uri="`${route && finalAddress  ? route+finalAddress: ''}`"
             :tooltip="showTooltip ? $strings.truncateText(this.finalAddress, 4, 10) : ''"/>
</template>

<script>

import Identicon from "src/components/utils/identicon"

export default {

  components: {Identicon},

  props: {
    size: {default: 40},

    address: {default: null},

    route: {default: "/accounts/view/"},
    showTooltip: {default: true},
  },

  data() {
    return {
      identiconHash: "",
      finalAddress: "",
    }
  },

  watch: {

    address: {
      immediate: true,
      handler: async function (newVal, oldVal) {

        if (!newVal) return

        try {
          const addressData = await LibertyTown.addresses.decodeAddress(newVal)
          const address = JSONParse(MyTextDecode(addressData))
          this.identiconHash = address.publicKey
          this.finalAddress = newVal
        } catch (err) {
          this.finalAddress = ""
          this.identiconHash = ""
        }

      }
    }
  },

  computed: {

  }


}
</script>
