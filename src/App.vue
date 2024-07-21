<template>
    <div>
        <button id="downloadBasicSample" @click="downloadSampleInputFile">Download basic sample file</button>
    </div>

    <div>
        <button id="downloadRandomSample" @click="createSampleInputFile">Download random sample file</button>
    </div>

    <div>
        <FileUpload @file="setFile" />
    </div>

    <div>
        <p v-for="row of data" :key="row">
            {{ row }}
        </p>
    </div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';
import FileUpload from '@/components/FileUpload.vue';
import { createSampleInputFile } from './components/CreateSampleInputFile';
import { downloadSampleInputFile } from './components/DownloadSampleInputFile';
import { fetchRelease, parseCsvToArray } from '@/parser';
import { prepareDownload } from './components/PrepareDownload';

export default defineComponent({
    name: 'App',
    components: {
        FileUpload
    },
    data() {
        return {
            data: null as null | string[],
            createSampleInputFile,
            downloadSampleInputFile
        }
    },
    methods: {
        async setFile(file: File) {
            this.data = await parseCsvToArray(file)
            console.log(this.data)
        },
        async fetchReleases(idList: string[]) {
            try {
                const data = await fetchRelease(idList)
                console.log('Fetched data from Discogs', data)
                return data
            } catch (err) {
                console.log('Failed fetching releases', err)
            }
        },
        async downloadCSV(data: any[]) {
            prepareDownload(data)
        },
    },
    watch: {
        data(data) {
            this.fetchReleases(data)
            this.downloadCSV(data)
        }
    },
});
</script>