<script setup lang="ts">

import { ref, watch } from 'vue'
import FileUpload from '@/components/FileUpload.vue';
import { fetchRelease, parseCsvToArray } from '@/parser';
import { prepareDownload } from './components/PrepareDownload';
import { downloadSampleInputFile } from './components/DownloadSampleInputFile';
import { createSampleInputFile } from './components/CreateSampleInputFile';

const inputData = ref<string[]>([])
const outputData = ref<null | any[]>(null)

async function setFile(file: File) {
    inputData.value = await parseCsvToArray(file)
    console.log(inputData.value)
}

async function fetchReleases(idList: string[]) {
    try {
        const data = await fetchRelease(idList)
        console.log('Fetched data from Discogs', data)
        outputData.value = data
        return data
    } catch (err) {
        console.log('Failed fetching releases', err)
    }
}

async function downloadCSV(data: any[]) {
    prepareDownload(data)
}

watch(inputData, newValue => {
    fetchReleases(newValue)
})

watch(outputData, newValue => {
    if (newValue) {
        downloadCSV(newValue)
    }
})

</script>

<template>
    <div>
        <button @click="downloadSampleInputFile">Download basic sample file</button>
    </div>

    <div>
        <button @click="createSampleInputFile">Download random sample file</button>
    </div>

    <div>
        <FileUpload @file="setFile" />
    </div>

    <div>
        <p v-for="row of outputData" :key="row">
            {{ row }}
        </p>
    </div>
</template>