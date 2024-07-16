import { ROW_NAMES } from './RowNames';

export default  {
  name: 'PrepareDownload',
  methods: {
    prepareDownload
  }
}

export function prepareDownload(releases: any[]) {
    const csvContent = "releases:text/csv;charset=utf-8," + ROW_NAMES.join(",") + "\n" + releases.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "my_data.csv");
    document.body.appendChild(link); // Required for Firefox
    link.click();
  }