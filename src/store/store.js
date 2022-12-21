//Vuex状态管理

import { createStore } from 'vuex';
import PageStore from "./modules/page/page-store"
import ToastsStore from "./modules/toasts/toasts-store"
import SettingsStore from "./modules/settings/settings-store"
import FederationsStore from "./modules/federations/federations-store"
import ChatStore from "./modules/chat/chat/chat-store"
import ConversationsStore from "./modules/chat/conversations/conversations-store";
import MessagesStore from "./modules/chat/messages/messages-store";
import AssetsStore from "./modules/assets/assets-store";

//创建并暴露store
export default createStore({

    modules: {

        assets: AssetsStore,
        page: PageStore,
        settings: SettingsStore,
        toasts: ToastsStore,
        federations: FederationsStore,
        chat: ChatStore,
        conversations: ConversationsStore,
        messages: MessagesStore,

    },

})