
require('src/assets/theme.css')

import * as Vue from 'vue'
import App from './app'
import router from "../router/router"

import store from "../store/store";
import VueClipboard from 'vue-clipboard2'
import VueTooltip from "v-tooltip"
import VueTooltipCss from "v-tooltip/dist/v-tooltip.css"
import StringHelper from "../utils/strings-utils"
import ValidatorHelper from "../utils/validator-helper";
import Decimal from "decimal.js"
import JSONParse from "../utils/custom-json/json-parse";
import JSONStringify from "../utils/custom-json/json-stringify";
import UtilsHelper from "src/utils/utils-helper"
import CountriesHelper from "../utils/countries-helper";

export default async (options) => {

    const app = Vue.createApp({
        render () {
            return Vue.h(App, {
                props: {
                    options,
                }
            });
        }
    });


    app.config.globalProperties.$strings = StringHelper
    app.config.globalProperties.$validator = ValidatorHelper
    app.config.globalProperties.$utils = UtilsHelper
    app.config.globalProperties.$countries = CountriesHelper

    app.config.globalProperties.Decimal = Decimal
    app.config.globalProperties.Decimal_0 = new Decimal(0)
    app.config.globalProperties.Decimal_1 = new Decimal(1)
    app.config.globalProperties.Decimal_2 = new Decimal(2)
    app.config.globalProperties.Decimal_10 = new Decimal(10)

    app.config.globalProperties.Buffer = Buffer

    app.config.globalProperties.JSONStringify = JSONStringify
    app.config.globalProperties.JSONParse = JSONParse

    app.config.globalProperties.LibertyTown = LibertyTown

    store.commit('readLocalStorage')
    window.addEventListener('resize', function(event) {
        store.commit('setScreenInformation')
    })
    store.commit('setScreenInformation')

    app.use(store)
    app.use(router);
    app.use(VueClipboard)
    app.use(VueTooltip)
    app.mount(options.app.appId)

};
