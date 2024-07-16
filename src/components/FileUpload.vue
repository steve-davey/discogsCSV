<template>

  <input type="file" @change="chooseFiles">

</template>

<script lang="ts">

import { defineComponent } from 'vue'

export default defineComponent({
  name: 'FileUpload',
  data() {
    return {
      file: ""
    }
  },
  methods: {
    chooseFiles(event: any) {
      const file = event.target.files[0];
      this.$emit("file", file);
    },
  },
  mounted() {
  },
});

</script>

<style></style>