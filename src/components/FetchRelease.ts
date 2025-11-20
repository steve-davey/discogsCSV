import { processReleaseData } from './ProcessReleaseData'

export default {
  name: 'FetchRelease',
  methods: {
    fetchRelease
  }
}

export async function fetchRelease(
  releaseIds: string[],
  onProgress: (loaded: number, total: number) => void
): Promise<any[]> {
  const total = releaseIds.length
  let loaded = 0
  const processedData = []

  for (const id of releaseIds) {
    try {
      console.log(`Fetching release ${id}...`)
      const response = await fetch(`/api/getRelease?releaseId=${id}`)
      console.log(`Response status: ${response.status}`)
      
      const result = await response.json()
      console.log(`Result:`, result)
      
      if (result.success) {
        processedData.push(processReleaseData(id, result.data))
      } else {
        console.error(`Failed for ${id}:`, result)
        processedData.push([result.error])
      }
      
      loaded++
      onProgress(loaded, total)
      
    } catch (err) {
      console.error('API error for', id, ':', err)
      processedData.push([`Release with ID ${id} does not exist`])
      loaded++
      onProgress(loaded, total)
    }
  }

  return processedData
}