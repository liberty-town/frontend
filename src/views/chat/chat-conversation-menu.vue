<template>
  <div class="text-end">
    <button type="button" class="btn btn-light btn-rounded waves-effect me-2 chatButton" @click="toggleShowMenu" >
      <i class="fas fa-ellipsis-h"/>
    </button>
    <div :class="`dropdown-menu-end dropdown-menu ${showMenu ? 'show show-menu': ''}`">
      <router-link class="dropdown-item" :to="`/accounts/view/${receiver}`">
        <i class="fa fa-shop me-2"/> View Account
      </router-link>
      <button type="button" class="dropdown-item" @click="$emit('showCreateInvoice', false)" >
        <i class="fa fa-file-text me-2"/> Create invoice as Seller
      </button>
      <button type="button" class="dropdown-item" @click="$emit('showCreateInvoice', true)" >
        <i class="fa fa-file-text me-2"/> Create invoice as Buyer
      </button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      showMenu: false,
    }
  },

  props: {
    receiver: {default: null},
  },

  methods: {
    toggleShowMenu() {
      if (!this.showMenu) setTimeout( () => this.showMenu = !this.showMenu, 100)
    },

    closeMenu() {
      this.showMenu = false
    },
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
.show-menu{
  left: auto !important;
  right: 0 !important;
  top: 50px !important;
}
</style>