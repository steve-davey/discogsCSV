<script setup lang="ts">

import { ref, watch } from 'vue'
import FileUpload from '@/components/FileUpload.vue';
import { parseCsvToArray } from '@/parser';
import { prepareDownload } from './components/PrepareDownload';
import { fetchRelease } from './components/FetchRelease';
import { createSampleInputFile } from './components/CreateSampleInputFile';
import { ROW_NAMES } from './components/RowNames';

const inputData = ref<string[][]>([])
const outputData = ref<null | any[]>(null)
const progress = ref<number>(0)
const hasHeaders = ref<boolean>(false)

async function setFile(file: File) {
    inputData.value = await parseCsvToArray(file)
    console.log(inputData.value)
}

async function fetchReleases(rows: string[][]) {
    try {
        progress.value = 0
        
        // Extract release IDs (first column) and other data
        let startIndex = 0
        let headerRow: string[] | null = null
        
        if (hasHeaders.value && rows.length > 0) {
            headerRow = rows[0]
            startIndex = 1
        }
        
        const rowsToProcess = rows.slice(startIndex)
        const releaseIds = rowsToProcess.map(row => row[0])
        
        const data = await fetchRelease(releaseIds, rowsToProcess, (loaded, total) => {
            progress.value = Math.round((loaded / total) * 100)
        })
        
        console.log('Fetched data from Discogs', data)
        
        // Build a header and prepend it to the output so PrepareDownload can simply write rows.
        const apiHeaders = ROW_NAMES.slice(1); // Skip 'release_id'
        if (headerRow) {
            // Replace first cell with 'release_id', keep rest of input headers, then append API headers.
            const modifiedHeader = ['release_id', ...headerRow.slice(1), ...apiHeaders];
            outputData.value = [modifiedHeader, ...data];
        } else {
            // No headers in input: create header with empty placeholders for input columns
            const numInputColumns = rowsToProcess.length > 0 ? rowsToProcess[0].length : 1;
            const emptyInputHeaders = new Array(Math.max(0, numInputColumns - 1)).fill('');
            const fullHeader = ['release_id', ...emptyInputHeaders, ...apiHeaders];
            outputData.value = [fullHeader, ...data];
        }
        
        return data
    } catch (err) {
        console.log('Failed fetching releases', err)
    }
}

async function downloadCSV(data: any[]) {
    prepareDownload(data)
}

watch(inputData, newValue => {
    if (newValue.length > 0) {
        fetchReleases(newValue)
    }
})

watch(outputData, newValue => {
    if (newValue) {
        downloadCSV(newValue)
    }
})

</script>

<template>
    <div>
        <button @click="createSampleInputFile">Download sample input file</button>
    </div>

    <div style="margin: 10px 0;">
        <input type="checkbox" id="hasHeaders" v-model="hasHeaders" />
        <label for="hasHeaders" style="margin-left: 8px;">First line contains headings</label>
    </div>

    <div>
        <FileUpload @file="setFile" />
    </div>

    <div style="margin: 10px 0;">
        <div style="width: 100%; background-color: #e0e0e0; border-radius: 4px; height: 20px;">
            <div 
                :style="{
                    width: progress + '%',
                    backgroundColor: '#4CAF50',
                    height: '100%',
                    borderRadius: '4px',
                    transition: 'width 0.3s'
                }"
            ></div>
        </div>
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