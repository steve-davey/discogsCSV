import { ROW_NAMES } from './RowNames'

export default {
  name: 'PrepareDownload',
  methods: {
    prepareDownload
  }
}

function escapeCSV(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // If the value contains comma, quote, or newline, wrap it in quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    // Escape any existing quotes by doubling them
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

export function prepareDownload(data: any[][]) {
  // Escape header row
  const header = ROW_NAMES.map(name => escapeCSV(name)).join(',');
  
  // Escape data rows
  const rows = data.map(row => 
    row.map(cell => escapeCSV(cell)).join(',')
  ).join('\n');
  
  const csvContent = 'data:text/csv;charset=utf-8,' + header + '\n' + rows;
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'my_data.csv');
  document.body.appendChild(link); // Required for Firefox
  link.click();
  document.body.removeChild(link); // Clean up
}