<template>
  <div>
    <p v-for="row of parsedData" v-bind:key="row.id">
      {{ row }}
    </p>
  </div>
</template>

<script lang="ts">

import { defineComponent } from 'vue'
import Papa from 'papaparse';

export default defineComponent({
  name: 'ParseCsvToArray',
  props: {
    file: File
  },
  data() {
    return {
      parsedData: [] as any[]
    }
  },
  methods: {
    parseCsvToArray(file: File) {
      Papa.parse(file, {
        header: false,
        complete: (results: Papa.ParseResult<any>) => {
          console.log('Parsed: ', results.data);
          this.parsedData = results.data;
        }
      });
    }
  },
  mounted() {
    if (this.file) {
      this.parseCsvToArray(this.file);
    }
  },
});

</script>

<style></style>