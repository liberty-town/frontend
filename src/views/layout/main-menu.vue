<template>
  <!-- BEGIN: Main Menu-->
  <div class="vertical-menu">
    <div class="h-100">
      <div class="simplebar-wrapper">
        <div class="simplebar-mask">
          <div class="simplebar-offset" style="right: 0px; bottom: 0px;">
            <div class="simplebar-content-wrapper h-100 p-0" style="overflow: hidden;">
              <div class="simplebar-content">
                <div id="sidebar-menu" class="mm-active">
                  <ul class="metismenu list-unstyled mm-show">

                    <li>

                      <a href="javascript: void(0);" class="waves-effect" @click="toggleListings" style="cursor: default">
                        <i class="fa fa-shopping-bag"></i>
                        <span key="t-file-manager">Listings</span>
                        <i :class="`d-block d-lg-none fas fa-chevron-${menu.listings ? 'up' : 'down'} fs-5`" style="float: right"/>
                      </a>

                      <ul :class="`sub-menu mm-collapse ${menu.listings ? 'mm-show' : '' }`">

                        <li>
                          <router-link to="/" class="waves-effect">
                            <span key="t-file-manager">View Listings</span>
                          </router-link>
                        </li>
                        <li>
                          <router-link to="/listings/add" class="waves-effect">
                            <span key="t-file-manager">Add new listing</span>
                          </router-link>
                        </li>

                      </ul>
                    </li>

                    <li>

                      <a href="javascript: void(0);" class="waves-effect" @click="toggleForum" style="cursor: default">
                        <i class="fa fa-comments"></i>
                        <span key="t-file-manager">Forum</span>
                        <i :class="`d-block d-lg-none fas fa-chevron-${menu.forum ? 'up' : 'down'} fs-5`" style="float: right"/>
                      </a>

                      <ul :class="`sub-menu mm-collapse ${menu.forum ? 'mm-show' : '' }`">

                        <li>
                          <router-link to="/forum" class="waves-effect">
                            <span key="t-file-manager">View Threads</span>
                          </router-link>
                        </li>
                        <li>
                          <router-link to="/forum/add" class="waves-effect">
                            <span key="t-file-manager">Add new thread</span>
                          </router-link>
                        </li>

                      </ul>

                    </li>

                    <li>
                      <router-link to="/chat" class="waves-effect">
                        <i class="fa fa-message"></i>
                        <span key="t-file-manager">Encrypted Chat</span>
                      </router-link>
                    </li>

                    <li>
                      <router-link to="/settings" class="waves-effect">
                        <i class="fa fa-cogs"></i>
                        <span key="t-file-manager">Settings</span>
                      </router-link>
                    </li>

                    <li>

                      <a href="javascript: void(0);" class="waves-effect" @click="toggleSupport" style="cursor: default">
                        <i class="fa fa-headset"></i>
                        <span key="t-file-manager">Support</span>
                        <i :class="`d-block d-lg-none fas fa-chevron-${menu.support ? 'up' : 'down'} fs-5`" style="float: right"/>
                      </a>

                      <ul :class="`sub-menu mm-collapse ${menu.support ? 'mm-show' : '' }`">

                        <li>
                          <router-link to="/chat/conversation/LIBERTY16rjckf96bsBxFVRWnpgVf9PbEW9dL7JZcYgVwVR5Ff2gegUrjq"
                                       class="waves-effect">
                            <span key="t-file-manager">Contact Support</span>
                          </router-link>
                        </li>

                        <li>
                          <router-link to="/faqs?tab=1" class="waves-effect">
                            <span key="t-file-manager">FAQs</span>
                          </router-link>
                        </li>

                        <li>
                          <router-link to="/faqs?tab=2" class="waves-effect">
                            <span key="t-file-manager">Tutorials</span>
                          </router-link>
                        </li>


                      </ul>
                    </li>

                    <li @click="() => this.$store.state.page.changeFederationModal.showModal()">
                      <a class="waves-effect">
                        <i class="fas fa-network-wired"></i>
                        <span key="t-file-manager">Change Federation</span>
                      </a>
                    </li>

                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
  <!-- END: Main Menu-->
</template>

<script>
export default {
  data(){
    return {
      menu: {
        support: true,
        listings: true,
        forum: true,
      },
    }
  },

  methods:{

    toggleListings(e){
      e.stopPropagation()
      this.menu.listings =  !this.menu.listings
    },

    toggleSupport(e){
      e.stopPropagation()
      this.menu.support =  ! this.menu.support
    },

    toggleForum(e){
      e.stopPropagation()
      this.menu.forum =  ! this.menu.forum
    },

  },

}
</script>

<style scoped>
.vertical-menu{
  position: fixed;
}
</style>