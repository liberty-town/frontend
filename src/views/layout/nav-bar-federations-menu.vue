<template>
  <div :class="`dropdown-menu dropdown-menu-end ${showMenu ? 'show': ''}`">
    <loading-button v-for="(fed, key) in $store.state.federations.dict" :key="`fed:${key}`" :submit="()=>selectFed(key)" :text="fed.name" icon="fas fa-globe" :tooltip="fed.description" component="span" :class-custom="`dropdown-item cursor-pointer d-block ${$store.state.federations.selected === fed.ownership.address ? 'text-primary' : ''}`" />
  </div>
</template>

<script>
import LoadingButton from "src/components/utils/loading-button"
export default {
  components: {LoadingButton},

  data(){
    return {
      showMenu: false,
    }
  },

  methods: {
    toggleShowMenu() {
      if (!this.showMenu) setTimeout( () => this.showMenu = !this.showMenu, 100)
    },
    closeMenu() {
      this.showMenu = false
    },
    selectFed(fedKey){
      return this.$store.dispatch('SetSelectedFederation', fedKey)
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  }

}
</script>

<style scoped>
.dropdown-menu{
  right: 120px;
}
@media screen and (max-width: 1200px) {
  .dropdown-menu{
    right: 60px;
  }
}
@media screen and (max-width: 992px) {
  .dropdown-menu{
    right: 30px;
  }
}
@media screen and (max-width: 768px) {
  .dropdown-menu{
    right: 10px;
  }
}
</style>