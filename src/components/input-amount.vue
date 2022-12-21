<template>
  <div>
    <label v-if="text !== null" class="form-label" v-tooltip.bottom="tooltip">{{ text }} Amount</label>
    <input :class="`form-control ${validationError ? 'is-invalid' :''} ${spinner ? '': 'no-spinner'}`" type="number" v-model="amount"
           :disabled="initAmountDisable && !(initAmount === undefined || $store.state.settings.expert)" >
    <div v-if="validationError" class="invalid-feedback d-block">{{ validationError }}</div>
  </div>
</template>

<script>
export default {
  data(){
    return {
      amountBase: Decimal_0,
    }
  },

  props: {
    text: {default: ''},
    tooltip: {default: ''},
    asset: {default: ""},
    allowZero: {default: false,},
    decimalSeparator: {default: null},
    initAmount: {default: undefined},
    initAmountDisable: {default: true},
    spinner: {default: true},
  },

  computed: {

    assetInfo() {
      if (this.decimalSeparator !== null) return null
      return this.$store.state.assets.all[this.asset];
    },

    validationError() {
      const amount = new Decimal(this.amount)
      if (!this.allowZero && amount.isZero() ) return "Amount needs to be greater than 0"
      if (amount.isNaN() || amount.lt(0) ) return "Amount can not be negative"
    },

    usedDecimalSeparator(){
      if (this.decimalSeparator !== null) return this.decimalSeparator
      if (this.assetInfo) return this.assetInfo.decimalSeparator
      return Decimal_1
    },

    amount: {

      get() {
        return this.amountBase.div( Decimal_10.pow( this.usedDecimalSeparator )).toString()
      },
      set(to, from) {
        this.calculateAmount(to)
      },

    },

  },

  methods:{
    calculateAmount(to){
      to = new Decimal(to || 0)

      if (!this.assetInfo && this.decimalSeparator == null) {
        this.lastTo = to
        this.amountBase = Decimal_0
        return
      }

      this.amountBase = to.mul( Decimal_10.pow( this.usedDecimalSeparator )).round()
      return this.$emit('changed', { amount: this.amountBase, });
    },
  },

  watch: {

    assetInfo:{
      immediate: true,
      handler: function (to){
        if (to && this.lastTo) {
          const lastTo = this.lastTo
          this.lastTo = null
          this.calculateAmount(lastTo)
        }
      },
    },

    initAmount: {
      immediate: true,
      handler: function (to, from) {
        if (to && from && to.eq(from) ) return
        if (to) return this.calculateAmount( to.div(  Decimal_10.pow( this.usedDecimalSeparator )) )
      }
    },

    validationError: {
      immediate: true,
      handler: function (to, from) {
        if (to === from) return
        return this.$emit('changed', { amountValidationError: to, })
      }
    },
  }
}
</script>