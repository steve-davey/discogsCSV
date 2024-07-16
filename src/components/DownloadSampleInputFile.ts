  export default {
    name: 'DownloadSampleInputFile',
    props: {
      sampleFileUrl: {
        type: String,
        required: true
      },
      sampleInputFileName: {
        type: String,
        required: true
      }
    },
    methods: {
      downloadSampleInputFile() {
        // create element <a> for download SampleFile"
        const link = document.createElement('a');
        link.href = '/src/assets/test_5_lines.csv';
        link.target = '_blank';
        link.download = 'test_5_lines.csv';
  
        // Simulate a click on the element <a>
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  }