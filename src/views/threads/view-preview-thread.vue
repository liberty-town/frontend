<template>
  <div class="card">
    <div class="card-body">

      <div class="row">
        <div class="d-flex">

          <vote :identity="thread.identity" :poll="threadPoll" />

          <div class="col-12 col-sm-3 image-card" v-if="$store.state.settings.ui.showListingsImages && thread.type.eq(2) && thread.links.length">
            <router-link :to="`/listings/view/${thread.identity}`" class="w-100 h-100">
              <div class="img-fluid"
                   :style="`background-image: url('${thread.links[0]}');`"/>
            </router-link>
          </div>

          <div :class="`${$store.state.settings.ui.showListingsImages && thread.type.eq(2) && thread.links.length  ? 'col-12 col-sm-9 mt-4 mt-sm-0' : '' }`">

            <router-link :to="`/forum/view/${ thread.identity}`" class="text-dark">
              <h5>{{ thread.title }}</h5>
            </router-link>

            <div class="row">

              <div class="col-12">
                <div class="d-flex" >

                  <router-link class="badge bg-light font-size-12 me-2 h-100"
                               v-for="(keyword, key) in thread.keywords" :key="`keyword-${key}`"
                               :to="{path: `/forum/search/${keyword}`, query: { queryType: 'keyword' }  }">
                    {{keyword}}
                  </router-link>

                  <p class="text-muted pe-2">
                    <i class="fas fa-clock"></i>
                    {{$strings.timeSince(new Decimal( thread.validation.timestamp*1000)) }}
                  </p>

                  <div>
                    <account-identicon :address="thread.publisher.address" class="me-3" :size="$store.state.page.width > 480 ? 25 : 20" />
                  </div>

                </div>
              </div>

            </div>

          </div>


        </div>
      </div>

    </div>

  </div>
</template>

<script>
import AccountIdenticon from "../../components/utils/account-identicon";
import InputAmount from "../../components/input-amount";
import Amount from "../../components/amount";
import Vote from "../vote/vote";

export default {

  components: {Vote, AccountIdenticon, InputAmount, Amount},

  props: {
    thread: {default: null},
    threadPoll: {default: null},
    threadSummary: {default: null},
  },

  data(){
    return {
    }
  },

  methods:{


  },

}
</script>

<style scoped>
.image-card img{
  max-height: 240px!important;
  left: 0!important;
  margin-left: 0 !important;
}

@media screen and (max-width: 576px){
  .image-card img{
    max-height: 100%!important;
  }
}
.card {
  margin-bottom: 0;
}
</style>