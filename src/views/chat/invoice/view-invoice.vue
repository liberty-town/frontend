<template>
  <div>

    <!-- Invoice Description starts -->
    <div class="table-responsive" v-if="items !== null">
      <table class="table">
        <thead>
        <tr>
          <th class="py-1">Item</th>
          <th class="py-1">Unit Price</th>
          <th class="py-1">Quantity</th>
          <th class="py-1">Price</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(it, key) in items" :key="`view-invoice-item-${key}`">
          <td class="py-1 d-flex">
            <p class="card-text text-nowrap">{{it.name}}</p>
            <router-link v-if="it.address" :to="`/listings/view/${it.address}`" class="ms-2">
              <i class="fas fa-chain"/>
            </router-link>
          </td>
          <td class="py-1">
            <span class="fw-bolder">
              <amount asset="currency-DOLLAR" :value="it.price" sign="$" />
            </span>
          </td>
          <td class="py-1">
            <span class="fw-bolder">
              <amount :decimal-separator="Decimal_0" :value="it.quantity"  />
            </span>
          </td>
          <td class="py-1">
            <span class="fw-bolder">
              <amount asset="currency-DOLLAR" :value="it.price.mul(it.quantity)" sign="$" />
            </span>
          </td>
        </tr>
        <tr>
          <td class="py-1">
            <p class="card-text text-nowrap">Shipping</p>
          </td>
          <td class="py-1"> <span class="fw-bolder"> - </span> </td>
          <td class="py-1"> <span class="fw-bolder"> - </span> </td>
          <td class="py-1">
            <span class="fw-bolder">
              <amount asset="currency-DOLLAR" :value="shipping" sign="$" />
            </span>
          </td>
        </tr>
        <tr>
          <td class="py-1 total-text">
            <p class="card-text text-nowrap">
              Total
            </p>
          </td>
          <td class="py-1 total-text">
          </td>
          <td class="py-1 total-text">
          </td>
          <td class="py-1 total-text">
            <span class="fw-bolder">
                <amount :decimal-separator="Decimal_2" :value="total" sign="$" />
              </span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>

    <div class="card-body" v-if="delivery !== null || notes !== null" >
      <div class="row" >
        <div :class="`col-12 ${notes !== null ? 'pb-1' : ''}`" v-if="delivery !== null">
          <span class="fw-bolder me-1">Delivery:</span>
          <span>{{delivery}}</span>
        </div>
        <div class="col-12" v-if="notes !== null">
          <span class="fw-bolder me-1">Notes:</span>
          <span>{{notes}}</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import InvoiceUtils from "src/utils/invoice-utils";
import Amount from "src/components/amount";

export default {

  components: {Amount},

  props: {
    items: {default: ()=> null},
    shipping: {default: ()=>null},
    notes: {default: ()=>null},
    delivery: {default: ()=>null},
  },

  computed:{
    total(){
      if (!this.items) return
      return InvoiceUtils.calculateInvoiceTotal(this.items, this.shipping)
    },
  },

}
</script>

<style scoped>
.shipping-price{
  text-align:right;
}

table{
  background-color: #f9f9f9!important;
  color:#000!important;
  margin: 10px 0
}

.total-text{
  background: #f0f0f0!important;
}

[data-layout-mode="dark"] .total-text{
  background: #e1e1e1 !important;
}
</style>