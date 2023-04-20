<template>
  <layout>

    <div class="card">
      <div class="card-header">
        <h4 class="card-title">Create a new review</h4>
      </div>
      <div class="card-body">

        <div class="row">
          <label class="col-sm-4 col-form-label">Listing</label>
          <div class="col-sm-8">{{listing}}</div>
        </div>

        <div class="row mt-3 mt-sm-0">
          <label class="col-sm-4 col-form-label">Account</label>
          <div class="col-sm-8 d-flex">
            <account-identicon :address="account" :size="25" />
            {{account}}
          </div>
        </div>

      </div>
    </div>

    <add-review-form :account="account" :listing="listing" :update-type="updateType" ref="addForm" @success="success"/>
  </layout>
</template>

<script>
import Layout from "../layout/layout";
import AddReviewForm from "./add-review-form";
import AccountIdenticon from "src/components/utils/account-identicon";

export default {

  components: {AddReviewForm, Layout, AccountIdenticon },

  computed:{
    account(){
      return this.$route.query.account||''
    },

    listing(){
      return this.$route.query.listing||''
    },

    updateType(){
      return this.$route.query.type||'purchase'
    },
  },

  methods:{

    success(){
      if (this.listing) this.$router.push('/listings/view/'+this.listing)
      else this.$router.push('/accounts/view/'+this.account)
    }

  },

  watch:{
    "$route":{
      immediate: true,
      handler(to, old) {
        if (to === old) return
        if (this.$refs.addForm)
          return this.$refs.addForm.load()
      }
    },
  },

  mounted() {
    return this.$refs.addForm.load()
  }

}
</script>