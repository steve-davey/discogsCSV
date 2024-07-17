export default {
  name: 'DownloadSampleInputFile',
  methods: {
    downloadSampleInputFile() {
      const link = document.createElement('a')
      link.href = '/src/assets/test_5_lines.csv'
      link.target = '_blank'
      link.download = 'test_5_lines.csv'

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }
}
