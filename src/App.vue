<template>
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
        }
    },
    watch: {
        data(data) {
            this.fetchReleases(data)
        }
    },
});
</script>