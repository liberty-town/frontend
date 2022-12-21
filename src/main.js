import JSONParse from 'src/utils/custom-json/json-parse'
import  JSONStringify from 'src/utils/custom-json/json-stringify'
const Decimal = require('decimal.js')

class Main {

    constructor(){

        const decoder = new TextDecoder("utf-8")
        const encoder = new TextEncoder("utf-8")

        global.MyTextDecode = a => a ? decoder.decode(a) : null
        global.MyTextEncode = a => a ? Buffer.from( encoder.encode(a) ) : null

        global.JSONStringify = JSONStringify
        global.JSONParse = JSONParse

        global.Buffer = Buffer
        global.Decimal = Decimal
        global.Decimal_0 = new Decimal(0)
        global.Decimal_1 = new Decimal(1)
        global.Decimal_2 = new Decimal(2)
        global.Decimal_10 = new Decimal(10)

        window.addEventListener("load", () => {
            if (global._LibertyTownLoaded) return
            global._LibertyTownLoaded = true
            this.initialize()
        } );

    }

    initialize(){

        if (typeof LibertyTownUIOptions === "undefined") global.LibertyTownUIOptions = {}

        global.FILES_VERSIONING = FILES_VERSIONING
        global.SRI_WEB_WORKER_WASM = SRI_WEB_WORKER_WASM
        global.SRI_WASM_MAIN = SRI_WASM_MAIN
        global.SIZE_WASM_MAIN = SIZE_WASM_MAIN

        const options = LibertyTownUIOptions

        if (!options.router) options.router = {}
        if (typeof options.resPrefix === "undefined") options.resPrefix = '/'

        options.app = {
            appId: '#liberty-net-app',
            defaultTheme: 'false',
            startAutomatically: true,
            ...(options.app||{}),
        }

        options.intro = {
            appId: '#liberty-net-intro',
            startAutomatically: true,
            ...(options.intro||{}),
        }

        this.options = options

        /**
         * On Window Load
         */

        this.start()

    }

    async start(){
        const introAppVue = require('./intro-app/intro-app').default;
        this.introAppVue = await introAppVue(this.options);
    }

    async loadApp(){

        if (this.introAppVue) {
            this.introAppVue.unmount()
            const element = document.getElementById(this.options.intro.appId.slice(1))
            if (element) element.remove()
        }

        const mainVue = require('./app/main').default;
        this.appVue = await mainVue(this.options);
    }

}

const main = new Main();

if ( typeof window !== 'undefined')
    window.LibertyTownUI = main;

export default main;
