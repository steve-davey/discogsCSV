<script setup lang="ts">

import { ref, watch } from 'vue'
import FileUpload from '@/components/FileUpload.vue';
import { parseCsvToArray } from '@/parser';
import { prepareDownload } from './components/PrepareDownload';
import { fetchRelease } from './components/FetchRelease';
import { createSampleInputFile } from './components/CreateSampleInputFile';
import ProgressBar from 'primevue/progressbar';

const inputData = ref<string[]>([])
const outputData = ref<null | any[]>(null)
const progress = ref<number>(0)

async function setFile(file: File) {
    inputData.value = await parseCsvToArray(file)
    console.log(inputData.value)
}

async function fetchReleases(releaseIds: string[]) {
    try {
        progress.value = 0
        const data = await fetchRelease(releaseIds, (loaded, total) => {
            progress.value = Math.round((loaded / total) * 100)
        })
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
        <button @click="createSampleInputFile">Download randomised sample file</button>
    </div>

    <div>
        <FileUpload @file="setFile" />
    </div>

    <div>
        <ProgressBar :value="progress"></ProgressBar>
    </div>

    <div>
        {{ progress }}%
    </div>

    <div>
        <p v-for="row of outputData" :key="row">
            {{ row }}
        </p>
    </div>
</template>