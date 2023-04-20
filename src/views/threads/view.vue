<!--查看产品详情-->
<template>
  <layout>
    <div class="row">
      <div class="col-lg-12">
        <div class="card">
          <div class="card-body">

            <div class="row justify-content-center">
              <div class="col-xl-8">
                <div>
                  <div v-if="threadLoading" style="text-align: center">
                    <loading-spinner class="fa-lg"/>
                  </div>
                  <template v-else-if="thread">

                    <div class="d-flex mb-2">

                      <div class="text-muted" style="float: right">
                        <account-identicon :address="thread.publisher.address" class="me-3" :size="$store.state.page.width > 480 ? 25 : 25" />
                      </div>

                      <p class="text-muted pe-2">
                        <i class="fas fa-clock"></i> {{$strings.timeSince(new Decimal( thread.validation.timestamp*1000)) }}
                      </p>

                      <div class="me-2">
                        <router-link class="badge bg-light font-size-12"
                                     v-for="(keyword, key) in thread.keywords" :key="key"
                                     :to="{path: `/forum/search/${keyword}`, query: { queryType: 'keyword' }}">
                          {{keyword}}
                        </router-link>
                      </div>


                    </div>

                    <div>

                      <a :href="thread.links[0]" v-if="thread.type.eq(1)" target="_blank">
                        <h3>{{thread.title}}</h3>
                      </a>
                      <h3 v-else>{{thread.title}}</h3>

                      <div class="my-5" v-if="thread.type.eq(2)">
                        <img :src="thread.links[0]" :alt="thread.title" class="img-thumbnail mx-auto d-block">
                      </div>

                    </div>

                    <div class="mt-4" v-if="thread.type.eq(0)">
                      <div class="text-muted font-size-14">
                        <vue-markdown :source="thread.content"/>
                      </div>
                    </div>

                  </template>

                </div>

                <div v-if="thread" class="mt-5">

                  <comment-add :thread="query" @submit="addComment" />

                  <hr>

                  <div class="mt-2">
                    <h5 class="font-size-15">Comments :</h5>
                    <div>
                      <loading-spinner v-if="commentsLoading && !this.comments.length"/>
                      <template v-else>
                        <show-comments :list="comments"/>
                        <loading-spinner v-if="commentsLoading"/>
                      </template>
                    </div>
                  </div>

                  <comment-add v-if="comments.length > 10" :thread="query" @submit="addComment" />

                </div>

                <alert-box v-if="error">{{error}}</alert-box>

              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  </layout>
</template>

<script>

import Layout from "src/views/layout/layout"
import ShowReviews from "src/views/reviews/show-reviews"
import Stars from "../reviews/stars";
import AlertBox from "src/components/utils/alert-box";
import LoadingSpinner from "src/components/utils/loading-spinner";
import AccountIdenticon from "../../components/utils/account-identicon";
import InputAmount from "../../components/input-amount";
import Amount from "../../components/amount";
import LoadingButton from "src/components/utils/loading-button";
import CommentAdd from "src/views/comments/add"
import ShowComments from "../comments/show-comments";
import VueMarkdown from 'vue-markdown-render'

export default {

  components: {
    ShowComments, VueMarkdown,
    Amount, AccountIdenticon, Stars, Layout, ShowReviews, AlertBox, LoadingSpinner, InputAmount, CommentAdd,
    LoadingButton},

  data(){
    return {
      threadLoading: true,
      thread: null,
      threadSummaryLoading: true,
      threadSummary: null,
      commentsLoading: true,
      comments: [],
      commentsStart: Decimal_0,
      commentsFinished: false,
      error: "",
    }
  },

  computed: {

    query(){
      return this.$route.params.query||'';
    },

  },

  methods: {
    async load(){
      try{

        this.$store.commit('setPage',{
          title: "View Thread",
        })

        Object.assign(this.$data, this.$options.data())

        let data = JSONParse( MyTextDecode( await LibertyTown.threads.get( JSONStringify({
          thread: this.query,
        })) ))

        if (!data) throw "Thread was not found"

        if (!this.$store.state.federations.dict[data.federation])
          throw "Thread federation is invalid"

        this.thread = data
        this.threadLoading = false

        let count = await LibertyTown.comments.get(JSONStringify({
          identity: this.query,
          type: 0,
          start: 0,
        }), data =>{
          const it = JSONParse( MyTextDecode(data) )
          this.comments.push(it)
        })

        this.commentsStart = this.commentsStart.plus(count)
        this.commentsFinished = count < LibertyTown.config.COMMENTS_LIST_COUNT

      }catch(e){
        this.error = e.toString()
      }finally{
        this.threadLoading = false
        this.commentsLoading = false
      }
    },

    addComment(comment){
      this.comments.push({
        comment,
        key: comment.identity,
        score: comment.validation.timestamp.neg()
      })
    },

    async loadMoreComments(){

      if (!this.thread || this.commentsLoading || this.commentsFinished) return

      try{
        this.commentsLoading = true

        const count = await LibertyTown.comments.get( JSONStringify({
          identity: this.query,
          type: 0,
          start: this.commentsStart,
        }), (data)=>{
          const it = JSONParse( MyTextDecode(data))
          this.comments.push(it)
        })

        this.commentsStart = this.commentsStart.plus(count)
        this.commentsFinished = count < LibertyTown.config.COMMENTS_LIST_COUNT

      }finally {
        this.commentsLoading = false
      }

    },

    infiniteScroll(){
      const y = window.pageYOffset || window.scrollTop
      const height = document.body.offsetHeight - window.innerHeight
      if ( y > height - 600) return this.loadMoreComments()
    },

  },

  async mounted(){
    await this.load()
    window.addEventListener("scroll", this.infiniteScroll )
  },

  beforeUnmount() {
    window.removeEventListener("scroll", this.infiniteScroll)
  }

}
</script>

<style scoped>
.img-fluid{
  height: 360px;
}
</style>