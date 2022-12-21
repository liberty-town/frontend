<template>
  <span :class="valueClass">{{ sign }}{{amount}}</span>
</template>

<script>
export default {

  props: {
    asset: {default: ""},
    value: {default: () => Decimal_0},
    sign: {default: ""},
    showAsset: {default: true},
    decimalSeparator: {default: null},
    valueClass: {default: ""},
    assetClass: {default: ""}
  },

  computed: {
    assetInfo() {
      if (this.decimalSeparator !== null) return null
      return this.$store.state.assets.all[this.asset];
    },
    usedDecimalSeparator(){
      if (this.decimalSeparator !== null) return this.decimalSeparator
      if (this.assetInfo) return this.assetInfo.decimalSeparator
      return Decimal_1
    },
    amount() {
      const value = this.value || Decimal_0
      return this.$strings.formatMoney(value.div( Decimal_10.pow(this.usedDecimalSeparator)).toString(), this.usedDecimalSeparator.toNumber() )
    },
  },

}
</script>
