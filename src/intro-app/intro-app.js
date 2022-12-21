import * as Vue from 'vue'
import Loading from './intro';

export default (options) => {

    const app = window.LibertyTownIntro = Vue.createApp({
        render () {
            return Vue.h( Loading, {
                options,
            });
        }
    });

    app.mount( options.intro.appId )

    return app
}
