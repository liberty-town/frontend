import {createRouter, createWebHistory} from "vue-router"

import ListingsAdd from "src/views/listings/add"
import ListingsView from "src/views/listings/view"
import ListingsSearch from "src/views/listings/search"
import AccountsAdd from "src/views/accounts/add"
import AccountsView from "src/views/accounts/view"
import ReviewsAdd from "src/views/reviews/add"
import Chat from "src/views/chat/chat"
import Settings from "src/views/settings/view"
import FAQs from "../views/faqs";

// 之路由篇
const routes = [
    {path: '/listings/add', component: ListingsAdd },
    {path: '/listings/update/:query', component: ListingsAdd },
    {path: '/listings/view/:query', component: ListingsView },
    {path: '/', component: ListingsSearch },
    {path: '/listings/search', component: ListingsSearch },
    {path: '/listings/search/:query', component: ListingsSearch },
    {path: '/accounts/add', component: AccountsAdd },
    {path: '/accounts/view/:query', component: AccountsView },
    {path: '/reviews/add', component: ReviewsAdd },
    {path: '/chat', component: Chat },
    {path: '/chat/conversation/:receiver', component: Chat },
    {path: '/settings', component: Settings },
    {path: '/faqs', component: FAQs},
];

export default createRouter({
    base: '/',
    history: createWebHistory(),
    scrollBehavior(to, from, savedPosition) {
        if (to.hash && to.hash.length) return { selector: to.hash }
        if (savedPosition) return savedPosition;
        return { x: 0, y: 0 }
    },
    routes
});

