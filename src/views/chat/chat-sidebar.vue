<template>
  <div :class="`${showChatSidebar ? 'd-flex' : 'd-none'} d-md-flex col-12 col-md-5 col-lg-4 chat-leftsidebar card h-100 app-layout mb-0 p-0 border`">

    <!-- Chat Sidebar area -->
    <div class="py-2 px-2 d-flex chat-left-header">

      <button type="button" class="d-flex d-md-none btn btn-dark btn-rounded waves-effect me-2"
              @click="$emit('toggleChatSidebar', false)" v-tooltip.bottom="'Show messages'">
        <i class="fas fa-arrow-right fa-2x px-2"/>
      </button>

      <button type="button" class="btn btn-light btn-rounded waves-effect" @click="()=>$emit('startConversation')">
        <i class="fas fa-plus"/>
      </button>

    </div>

    <div class="chat-leftsidebar-nav chat-left mx-2 chat-left-content">

      <div v-if="$store.state.chat.loading" class="text-center pt-2">
        <loading-spinner class="fa-lg"/>
      </div>
      <div v-else>
        <ul class="list-unstyled chat-list">

          <li v-for="(conv, key) in sortedConversations"
              :key="`conv_${key}`" :class="`${conv.receiver === receiver ? 'active' : ''} `">
            <chat-mini-conversation :conv="conv"/>
          </li>
        </ul>
        <div v-if="!$store.state.conversations.finished" class="text-center">
          <loading-button :submit="loadMoreConversations" text="Load more" icon="fa fa-download" class="btn-secondary mt-3"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import LoadingButton from "src/components/utils/loading-button";
import LoadingSpinner from "src/components/utils/loading-spinner";
import AccountIdenticon from "src/components/utils/account-identicon";
import ChatLastMessage from "./chat-last-message";
import ChatMiniConversation from "./chat-mini-conversation";
export default {

  components: {ChatMiniConversation, AccountIdenticon, LoadingButton, LoadingSpinner, ChatLastMessage},

  props: {
    receiver: {default: null},
    showChatSidebar: {default: false},
  },

  computed:{
    sortedConversations(){
      const conversations = Object.values(this.$store.state.conversations.dict)
      return conversations.sort( (a,b) => b.message.validation.timestamp.minus(a.message.validation.timestamp))
    }

  },

  methods:{
    loadMoreConversations(){
      return this.$store.dispatch('loadConversations')
    },
  },

}
</script>

<style scoped>


.chat-list li a{
  padding: 1px 10px;
}

[data-layout-mode="dark"] .chat-left-header{
  border-bottom: solid 1px #31384d;
}

.chat-left-content{
  padding-top: 10px
}

.chat-left{
  height: calc(100vh - 145px) !important;
  overflow-y: scroll;
}
.chat-list li.active a{
  background-color: rgb(237, 240, 253);
}
[data-layout-mode="dark"] .chat-list li.active a{
  background-color: rgb(50, 57, 78);
}

.chat-list li a:hover{
  background-color: rgb(211, 214, 219);
}
[data-layout-mode="dark"] .chat-list li a:hover{
  background-color: rgb(31, 36, 49);
}
</style>