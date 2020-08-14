<template lang="pug">
v-container(
  style='maxWidth: 1000px; minWidth: 250px;',
)
  v-list
    v-list-item
      v-list-item-content.text-center.mt-4
        span.display-3 🤔
        .text-center.mt-4
          span.headline {{ $t("notLogginedBody") }}
          a(href='https://todorant.com')
            span.headline todorant.com
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component({
  components: {},
})
export default class NotLoggined extends Vue {}
</script>
