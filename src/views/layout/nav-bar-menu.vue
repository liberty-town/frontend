//导航栏
<template>
  <header id="page-topbar">
    <div class="navbar-header">
      <div class="d-flex">

        <button type="button" class="d-block d-lg-none  btn btn-sm ps-3 font-size-16 header-item waves-effect header-navbar" @click="() => $emit('toggleMainMenu')">
          <i class="fa fa-fw fa-bars"></i>
        </button>

        <div class="menuLogo">

          <router-link to="/" class="logo logo-dark">
            <span class="d-block d-md-none">
              <img src="/assets/liberty-town-logo-small.png" alt="" >
            </span>
            <span class="d-none d-md-block">
              <img src="/assets/liberty-town-logo.png" alt=""  >
            </span>
          </router-link>

          <router-link to="/" class="logo logo-light">
            <span class="d-block d-md-none">
              <img src="/assets/liberty-town-logo-small-invert.png" alt=""  >
            </span>
            <span class="d-none d-md-block">
              <img src="/assets/liberty-town-logo-invert.png" alt="" >
            </span>
          </router-link>

        </div>

      </div>
      <div class="d-flex">

        <nav-bar-search/>

        <div class="dropdown d-inline-block" @click="() => $refs.navBarAccountMenu.toggleShowMenu()">
          <button type="button" class="btn header-item waves-effect" >
            <account-identicon route="" :address="$store.state.page.settings.account.address" :size="24" class="me-2" />
            <span class="d-none d-xl-inline-block me-2 " >{{ $store.state.page.settings.name }}</span>
            <i class="fas fa-chevron-down d-none d-xl-inline-block"/>
          </button>
        </div>

        <div class="dropdown d-none d-lg-inline-block" v-if="$store.getters.isFederationModerator" >
          <button type="button" class="btn header-item noti-icon waves-effect">
            <i class="fa fa-star text-warning"/>
          </button>
        </div>

      </div>

      <nav-bar-account-menu ref="navBarAccountMenu"/>
      <nav-bar-federations-menu ref="navBarFederationsMenu"/>

    </div>
  </header>

</template>

<script>
import NavBarSearch from "./nav-bar-search"
import NavBarAccountMenu from "./nav-bar-account-menu";
import NavBarFederationsMenu from "./nav-bar-federations-menu";
import AccountIdenticon from "../../components/utils/account-identicon";
export default {
  components: {AccountIdenticon, NavBarFederationsMenu, NavBarSearch, NavBarAccountMenu},

  computed:{

  },

  methods:{

  },

}
</script>


<style scoped>
.dropdown button{
  padding: 5px;
}

.header-navbar{
  width: 70px;
}

@media screen and (max-width: 480px) {
  .header-navbar {
    width: 40px;
  }
}

[data-layout-mode="dark"] .header-navbar{
  border-right: solid 2px #292f41;
}

.menuLogo{
  padding:0;
}

.menuLogo img{
  height: 60px;
  padding: 5px;
  vertical-align: top;
}

button{
  border: none;
}

</style>