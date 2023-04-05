<template>
  <layout>
    <div class="card">
      <div class="card-body">

        <alert-box v-if="error">{{error}}</alert-box>
        <div v-else-if="loading" class="text-center">
          <loading-spinner class="fa-2x"/>
        </div>
        <template v-else>

          <div class="row">
            <label class="col-sm-4 col-form-label">Thread type </label>
            <div class="col-sm-8">
              <div class="form-check form-check-inline">
                <input type="radio" class="form-check-input cursor-pointer" id="thread-text" value="text" v-model="type">
                <label class="form-check-label cursor-pointer" for="thread-text">Text</label>
              </div>
              <div class="form-check form-check-inline">
                <input type="radio" class="form-check-input cursor-pointer" id="thread-image" value="image" v-model="type">
                <label class="form-check-label cursor-pointer" for="thread-image">Image</label>
              </div>
              <div class="form-check form-check-inline">
                <input type="radio" class="form-check-input cursor-pointer" id="thread-link" value="link" v-model="type">
                <label class="form-check-label cursor-pointer" for="thread-link">Link</label>
              </div>
            </div>
          </div>

          <div class="row">
            <label class="col-sm-4 col-form-label">Title</label>
            <div class="col-sm-8">
              <input type="text" :class="`form-control ${title.length < LibertyTown.config.THREAD_TITLE_MIN_LENGTH || title.length > LibertyTown.config.THREAD_TITLE_MAX_LENGTH ? 'is-invalid': ''}`" placeholder="these words are being used by the decentralized search" v-model="title">
              <div v-if="title.length < LibertyTown.config.THREAD_TITLE_MIN_LENGTH" class="invalid-feedback">It must contain at least {{LibertyTown.config.THREAD_TITLE_MIN_LENGTH}} chars.</div>
              <div v-if="title.length > LibertyTown.config.THREAD_TITLE_MAX_LENGTH" class="invalid-feedback">It should not exceed {{LibertyTown.config.THREAD_TITLE_MAX_LENGTH}} chars.</div>
            </div>
          </div>

          <template v-if="type === 'text'">
            <div class="row mt-3">
              <label class="col-sm-4 form-label">Content</label>
              <div class="col-sm-8">
                <textarea class="form-control char-textarea active" rows="3" placeholder="Counter"  v-model="content"></textarea>
              </div>
            </div>
          </template>

          <div class="row mt-3">
            <label class="col-sm-4 form-label">Keywords</label>
            <div class="col-sm-8">
              <multiselect :selected="keywords" @add="it => keywords.push(it)" text="keyword"
                           :options="[]"
                           :create-options="true"
                           @remove="it => keywords.splice(keywords.indexOf(it), 1)"
                           :max="LibertyTown.config.THREAD_KEYWORDS_MAX_COUNT"/>
            </div>
          </div>


          <template v-if="type === 'image' || type === 'link'">
            <div class="row mt-3" v-for="(link, i) in links" :key="`link-${i}`">
              <label class="col-sm-4 form-label">Link {{i}}</label>
              <div class="col-md-12">
                <input type="text" class="form-control" placeholder="link url must start with https://" v-model="links[i]">
              </div>
            </div>

            <div class="row mt-3" v-if="links.length < LibertyTown.config.THREAD_LINKS_MAX_COUNT || links.length > 1">
              <div class="col-12 d-flex justify-content-end">
                <loading-button :submit="newImage" text="Add Image" icon="fa fa-image" class-custom="btn btn-outline-primary waves-effect"/>
                <button v-if="links.length" @click="links.splice(links.length-1, 1)" type="button" class="btn btn-outline-primary waves-effect ms-2"><i class="fas fa-times text-danger me-2"/>Remove Last Link</button>
              </div>
            </div>
          </template>


          <div class="col-12 d-flex justify-content-center mt-4">
            <loading-button :submit="submit" text="Publish Thread" icon="fa fa-share"/>
          </div>

        </template>

      </div>
    </div>
  </layout>
</template>

<script>
import Layout from "src/views/layout/layout"
import LoadingButton from "../../components/utils/loading-button";
import Multiselect from "../../components/utils/multiselect";
import LoadingSpinner from "src/components/utils/loading-spinner";
import InputAmount from "../../components/input-amount";
import CountriesHelper from "../../utils/countries-helper";
import AlertBox from "src/components/utils/alert-box";

export default {

  components: {LoadingButton, Layout, Multiselect, LoadingSpinner, InputAmount, AlertBox},

  computed: {
    query(){
      return this.$route.params.query||'';
    },
  },

  data(){
    return {
      error: "",
      title: "Title Thread",
      content: "content",
      type: "text",
      links: [],
      keywords: [],
      federation: "",
      loading: true,
    }
  },

  methods: {

    async load(){

      try{

        Object.assign(this.$data, this.$options.data())

        this.$store.commit('setPage', {
          title: "Add a new thread",
        })

      }catch(e){
        console.error(e)
        this.error = e
      }finally{
        this.loading = false
      }

    },

    async submit(){

      this.data = null

      let type
      if (this.type === "text") type = Decimal_0
      else if (this.type === "link") type = Decimal_1
      else if (this.type === "image") type = Decimal_2

      const data = JSONParse( MyTextDecode( await LibertyTown.threads.store( JSONStringify({
        type,
        title: this.title,
        content: type.gte(1) ? "" : this.content,
        keywords: this.keywords.map( it => it ),
        links : this.links,
      }), (data) => this.$store.state.page.validatorModal.showModal(data) ) ))

      if (!data || !data.thread || !data.results) throw "Not found"
      if (data.results.eq(0)) throw "Return result is false"

      this.$store.dispatch('addToast', {type:"success", title:`Thread was ${this.query?'update':'created'}`, text: "Success!" })

      this.$router.push('/forum/view/'+data.thread.identity )

    },

    newImage(){
      this.links.push("")
    },

    newOffer(){
      this.offers.push({amount: "", price: { amount: Decimal_1,  amountValidationError: "" }, priceInit: Decimal_1, })
    },
    newShipping(){
      this.shipping.push({option: "", price: { amount: Decimal_1,  amountValidationError: "" }, priceInit: Decimal_0, })
    },

  },


  mounted(){
    this.load()
  },

}
</script>

