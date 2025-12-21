import Papa from 'papaparse'

export async function parseCsvToArray(file: File): Promise<string[][]> {
  return new Promise((resolve) => {
    Papa.parse<string[][]>(file, {
      header: false,
      complete: (results: Papa.ParseResult<any>) => {
        console.log('Parsed: ', results.data)
        resolve(results.data)
      }
    })
  })
}
