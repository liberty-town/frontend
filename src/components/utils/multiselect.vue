<template>
  <div>
    <div class="d-flex flex-wrap">
      <span v-if="showBadges" v-for="(it, i) in selected" class="badge bg-light me-2 py-1 my-2" :key="`multi-${i}`">
        {{ typeof it === "string" ? it : it.name || it.text }}
        <i class="fas fa-times text-danger ms-2 me-2 cursor-pointer" @click="()=>removeOption(it) "/>
      </span>
      <template v-if="max === -1 || max === 1 || ( Array.isArray(selected) && selected.length < max )">

        <div v-if="createOptions" class="d-flex">
          <input type="text" :class="`form-control ${inputClass}`" :placeholder="text" v-model="selection" v-on:keyup.enter="inputChanged">
          <button class="btn btn-outline-primary waves-effect d-flex ms-2" @click="inputChanged">
            <i class="fa fa-plus mt-1 me-2"/>
            <span class="me-2">Add</span>
          </button>
        </div>
        <template v-else>

          <div @click="toggle" class="d-flex">
            <i v-if="icon" :class="icon" style="position: absolute; padding-left: 15px; top: 29px;"/>
            <input type="text" :class="`form-control ${inputClass}`" :placeholder="text" v-model="selection" v-on:keyup.enter="inputChanged" />
            <i v-if="showChevron" class="fas fa-chevron-down"></i>
            <div v-if="filteredOptions.length" :class="`dropdown-menu dropdown-menu-end ${showMenu ? 'show': ''}`">
              <button v-for="(it, key) in filteredOptions" :key="`multiselect-option-${key}`"
                      type="button" class="dropdown-item m-0" @click="()=>selectChanged(it)" >
                <label :style="`${it.left ? 'padding-left: '+it.left+'px !important' : ''}`">{{it.text}}</label>
              </button>
            </div>
          </div>

        </template>
      </template>
    </div>

    <div v-if="showBadges && selected && selected.length < min" class="invalid-feedback d-block">You need to select at least {{min}} options.</div>

  </div>
</template>

<script>
export default {

  props:{
    text: {default: "select"},
    options: {default: ()=>[] },
    min: {default: 0},
    max: {default: -1},
    selected: {default: ()=>[]},
    showBadges: {default: true},
    createOptions: {default: false},
    showChevron: {default: true},
    icon : {default: ""},
    inputClass: {default: ""}
  },

  data(){
    return {
      selection: "",
      showMenu: false,
    }
  },

  computed:{
    filteredOptions(){

      const included = {}

      if (this.selected){
        if (Array.isArray(this.selected))
          for (const it of this.selected)
            included[it.value] = true
        else
          included[this.selected.value] = true
      }

      const final = []
      for (const it of this.options)
        if (!included[it.value] && (!this.selection || it.text.toLowerCase().indexOf(this.selection.toLowerCase()) >= 0))
          final.push(it)

      return final
    }
  },

  methods: {
    removeOption(it){
      this.$emit('remove', it)
    },
    inputChanged(){

      for (const it of this.filteredOptions)
        if (it.text === this.selection ){
          this.$emit('add', it)
          this.selection = ""
          return
        }

      if (this.createOptions){
        this.$emit('add', this.selection)
        this.selection = ""
        this.closeMenu()
      }

    },
    selectChanged(it){
      this.$emit('add',it)
      this.selection = ""
    },
    closeMenu(){
      this.showMenu = false
    },
    toggle(){
      if (!this.showMenu) setTimeout( () => this.showMenu = !this.showMenu, 100)
    }
  },

  mounted() {
    document.addEventListener('click', this.closeMenu)
  },

  beforeUnmount() {
    document.removeEventListener('click', this.closeMenu)
  }

}
</script>

<style scoped>
input{
  width: 200px;
}
.dropdown-menu{
  max-height: 200px;
  overflow: auto;
}
.fa-chevron-down{
  margin-top: 8px;
  margin-bottom: 8px;
  margin-left: -20px;
  padding-left: 5px;
}
[data-layout-mode="dark"] .fa-chevron-down{
  background-color: #2a3042
}
</style>