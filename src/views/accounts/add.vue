<template>
  <layout>
    <div class="card">
      <div class="card-body" style="min-height: 400px">

        <div v-if="loading" class="text-center">
          <loading-spinner class="fa-2x"/>
        </div>
        <template v-else>

          <div class="row">
            <label class="col-md-2 col-form-label">Account Description</label>
            <div class="col-md-10">
              <textarea class="form-control char-textarea active" rows="3" placeholder="My Account Description. You can leave it empty." v-model="description"></textarea>
            </div>
          </div>

          <div class="row mt-2">
            <label class="col-md-2 col-form-label">Country</label>
            <div class="col-md-10">

              <multiselect :selected="country" :max="1" :options="$countries.sorted.map( it => ({text: it.name, value: it.index}) )"
                           @add="it => country = it" :show-badges="false" :text="country ? country.text : 'optional'" />

            </div>
          </div>

        </template>

        <div class="col-12 d-flex justify-content-end mt-4">
          <loading-button :submit="submit" :text="`${$store.state.page.accountRegistered ? 'Update' : 'Register'} account`" icon="fas fa-right-to-bracket"/>
        </div>

      </div>
    </div>
  </layout>
</template>

<script>
import Layout from "src/views/layout/layout"
import LoadingButton from "../../components/utils/loading-button";
import Multiselect from "../../components/utils/multiselect";
import LoadingSpinner from "../../components/utils/loading-spinner";
import CountriesHelper from "../../utils/countries-helper";
export default {

  components: {Layout, LoadingButton, Multiselect, LoadingSpinner},

  data(){
    return {
      account: null,
      description: "",
      loading: true,
      country: CountriesHelper.getMultiset(0),
    }
  },

  computed:{
  },

  methods: {
    async load(){

      try{

        Object.assign(this.$data, this.$options.data())

        this.$store.commit('setPage', {
          title: this.$store.state.page.accountRegistered ? `Update your account` : `Register account to federation`,
        })

        let data = JSONParse(MyTextDecode(await LibertyTown.accounts.get(JSONStringify({ }))))

        if (data){
          this.description = data.description
          this.country = this.$countries.getMultiset(data.country )
        }

      }catch(e){
        console.error(e)
        this.$store.dispatch('addToast', {type:"error", title:`Error creating listing`, text: `There was an error creating listing ${e.toString()}` })
      }finally{
        this.loading = false
      }


    },

    async submit(){

      this.account = null

      const data = JSONParse( MyTextDecode( await LibertyTown.accounts.store( JSONStringify({
        description: this.description,
        country: this.country.value,
      }), (data) => this.$store.state.page.validatorModal.showModal(data) ) ))

      if (!data) throw "Account was not registered"

      this.account = data.account

      await this.$store.dispatch('AccountCheckRegistered')

      this.$store.dispatch('addToast', {type:"success", title:"Account was registered", text: "Success!" })

      this.$router.push(`/accounts/view/${this.account.ownership.address}`)

    }
  },

  watch:{
    "$route": {
      immediate: true,
      handler(to, oldVal){
        return this.load()
      },
    },
  },

}
</script>