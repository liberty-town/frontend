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
        <p class="text-muted">
          {{it.comment.content}}
        </p>
      </div>
    </div>

  </div>
</template>

<script>
import AccountIdenticon from "../../components/utils/account-identicon";
export default {

  components: {AccountIdenticon},

  props:  {
    list: {default: null }
  }
}
</script>