<!--警报-->
<template>
    <div :class="`alert alert-${getBackground}`" role="alert">
      <div class="alert-body d-flex align-items-center">
        <div :class="`me-3 icon-item`">
          <span :class="`fas fa-${getIcon}-circle fs-1`"></span>
        </div>
        <span class="mb-0"><slot/></span>
      </div>
    </div>
</template>

<script>
export default {

    props: {
        type: {default: "error"},
        dismissibleTimeout: {default: 0},
        dismissibleText: {default: false}
    },

    computed:{

        getIcon(){
            if (this.type === "warning") return "exclamation"
            if (this.type === "error") return "times"
            if (this.type === "info") return "info"
            if (this.type === "success") return "check"
            return ""
        },

        getBackground(){
            if (this.type === "warning") return "warning"
            if (this.type === "error") return "danger"
            if (this.type === "info") return "info"
            if (this.type === "success") return "success"
            return ""
        }
    },

    watch:{
        dismissibleText: {
            immediate: true,
            handler: function (to, from) {
                if (to === from) return
                setTimeout(()=> this.$emit('onDismissible'), this.dismissibleTimeout )
            }
        }
    }

}
</script>
