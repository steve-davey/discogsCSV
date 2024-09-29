export default {
  name: 'DownloadSampleInputFile',
  methods: {
    downloadSampleInputFile
  }
}

export function downloadSampleInputFile() {
  fetch('/test_5_lines.csv')
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.blob();
  })
  .then(blob => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'test_5_lines.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}
