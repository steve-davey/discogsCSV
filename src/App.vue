<template>
    <div>
        <button @click="downloadSampleInputFile">Download sample file</button>
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
import { fetchRelease, parseCsvToArray } from "@/parser";
import { prepareDownload } from './components/PrepareDownload';

export default defineComponent({
    name: 'App',
    components: {
        FileUpload,
    },
    data() {
        return {
            data: null as null | string[],
        }
    },
    methods: {
        async setFile(file: File) {
            this.data = await parseCsvToArray(file)
            console.log(this.data)
        },
        async fetchReleases(idList: string[]) {
            try {
                const releases = await fetchRelease(idList)
                console.log('Fetched releases from Discogs', releases)
                return releases
            } catch (err) {
                console.log('Failed fetching releases', err)
            }
        },
        async downloadCSV(releases: any[]) {
            prepareDownload(releases)
        },
        async downloadSampleInputFile() {
            const link = document.createElement('a');
            link.href = '/src/assets/test_5_lines.csv';
            link.target = '_blank';
            link.download = 'test_5_lines.csv';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    },
    watch: {
        data(data) {
            this.fetchReleases(data)
        }
    },
});
</script>