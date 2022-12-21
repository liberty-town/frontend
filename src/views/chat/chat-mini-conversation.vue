<template>
  <router-link :to="`/chat/conversation/${conv.receiver}`" @click="$emit('toggleChatSidebar', false)">
    <div class="chat-row py-2">
      <div>
        <account-identicon :address="conv.receiver" :size="28" route=""  />
      </div>
      <div class="flex-grow-1 overflow-hidden">
        <h5 class="text-truncate font-size-14 mb-1 text-truncate">{{conv.receiver}}</h5>
        <chat-last-message v-if="conv.message" :message="conv.message" :receiver="conv.receiver" />
      </div>
      <div class="text-end chat-info">
        <div class="font-size-11">{{ $strings.timeSince( conv.message.validation.timestamp.mul(1000), false)  }}</div>
      </div>
    </div>
  </router-link>
</template>

<script>
import AccountIdenticon from "../../components/utils/account-identicon";
import ChatLastMessage from "./chat-last-message";

export default {

  components: {AccountIdenticon, ChatLastMessage},

  props: {
    conv: {default: null},
  },

  computed:{

  },

}
</script>

<style scoped>
.chat-row{
  display: grid;
  grid-template-columns: 40px 1fr 35px;
}
</style>