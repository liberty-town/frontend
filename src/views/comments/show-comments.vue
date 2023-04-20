<template>
  <div>
    <div v-for="(it, key) in list" :key="`comment-${key}`"
         :class="`d-flex py-3 ${key > 0 ? 'border-top' : ''}`" >
      <div class="flex-shrink-0 me-3">
        <div class="avatar-xs">
          <div class="avatar-title rounded-circle bg-light text-primary">
            <account-identicon :address="it.comment.publisher.address" class="d-inline-block" :size="28" route="" />
          </div>
        </div>
      </div>
      <div class="flex-grow-1">
        <span class="font-size-14 mb-1">
          <small class="text-muted float-end">{{$strings.timeSince(new Decimal( it.comment.validation.timestamp.mul(1000) ))}} ago</small>
        </span>
        <div class="text-muted">
          <vue-markdown :source="it.comment.content"/>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import AccountIdenticon from "../../components/utils/account-identicon";
import VueMarkdown from 'vue-markdown-render'

export default {

  components: {AccountIdenticon, VueMarkdown},

  props:  {
    list: {default: null }
  }
}
</script>