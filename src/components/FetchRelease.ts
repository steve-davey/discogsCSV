import { processReleaseData } from './ProcessReleaseData'

export default {
  name: 'FetchRelease',
  methods: {
    fetchRelease
  }
}

export async function fetchRelease(
  releaseIds: string[],
  rowsToProcess: string[][],
  onProgress: (loaded: number, total: number) => void
): Promise<(string | number)[][]> {
  const total = releaseIds.length
  let loaded = 0
  const processedData = []

  const DELAY_MS = 1100; // ~54 requests per minute to stay safely under 60/min

  for (let i = 0; i < releaseIds.length; i++) {
    const id = releaseIds[i]
    const fullRow = rowsToProcess[i]

    try {
      console.log(`Fetching release ${id}...`)
      const response = await fetch(`/api/getRelease?releaseId=${id}`)
      console.log(`Response status: ${response.status}`)
      
      const result = await response.json()
      console.log(`Result:`, result)
      
      if (result.success) {
        const apiData = processReleaseData(id, result.data)
        // Combine: [releaseId, other input columns, API data (excluding releaseId)]
        const combinedRow = [id, ...fullRow.slice(1), ...apiData.slice(1)]
        processedData.push(combinedRow)
      } else {
        console.error(`Failed for ${id}:`, result)
        processedData.push([...fullRow, result.error])
      }
      
      loaded++
      onProgress(loaded, total)

      if (loaded < total) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
      
    } catch (err) {
      console.error('API error for', id, ':', err)
      processedData.push([...fullRow, `Release with ID ${id} does not exist`])
      loaded++
      onProgress(loaded, total)
    }
  }

  return processedData
}