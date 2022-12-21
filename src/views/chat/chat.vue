<!--加密聊天-->
<template>
  <layout>

    <div class="row">

      <chat-sidebar :show-chat-sidebar="showChatSidebar" :receiver="receiver" @startConversation="startConversation"
                    @toggleChatSidebar="v => this.showChatSidebar = v "/>

      <chat-conversation :show-chat-sidebar="showChatSidebar" :receiver="receiver"
                         @startConversation="startConversation"
                         @toggleChatSidebar="v => this.showChatSidebar = v "/>
    </div>

    <chat-new-conversation-modal ref="chatNewConversationModal"/>
    <chat-warning-modal ref="chatWarningModal"/>

  </layout>
</template>

<script>
import Layout from "../layout/layout";
import ChatNewConversationModal from "./chat-new-conversation-modal";
import ChatSidebar from "./chat-sidebar";
import ChatConversation from "./chat-conversation";
import AccountIdenticon from "../../components/utils/account-identicon";
import ChatWarningModal from "./chat-warning-modal";

export default {

  components: {
    AccountIdenticon, ChatConversation, ChatNewConversationModal, ChatSidebar, Layout, ChatWarningModal,
  },

  data() {
    return {
      showChatSidebar: true,
    }
  },

  computed: {
    receiver() {
      return this.$route.params.receiver || '';
    },

  },

  methods: {

    async load() {

      this.$store.commit('setPage', {
        title: "End-to-End Encrypted Chat",
      })

    },

    async startConversation() {

      try {
        const receiver = await this.$refs.chatNewConversationModal.showModal()
        if (!receiver) return false

        const address = this.$store.state.page.settings.account.address
        this.$router.push(`/chat/conversation/${receiver}`)
      } catch (e) {
        this.$store.dispatch('addToast', {
          type: "error",
          title: `Error starting a conversation`,
          text: `There was an error starting a new conversation ${e.toString()}`
        })
      }

    },


  },

  mounted() {

    if (this.receiver)
      this.showChatSidebar = false

    this.$store.state.chat.loadingPromise.then(()=>{
      if (!Object.values(this.$store.state.conversations.dict).length)
        this.$refs.chatWarningModal.showModal()

    })

    this.load()
  },

  beforeUnmount() {
  }

}
</script>

<style scoped>


</style>