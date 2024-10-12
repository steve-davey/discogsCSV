import { DiscogsClient } from '@lionralfs/discogs-client'
import { processReleaseData } from './ProcessReleaseData'

export default {
  name: 'FetchRelease',
  methods: {
    fetchRelease
  }
}

const db = new DiscogsClient().database()

export async function fetchRelease(
  releaseIds: string[],
  onProgress: (loaded: number, total: number) => void
): Promise<any[]> {
  const total = releaseIds.length
  let loaded = 0
  const processedData = []
  for (const id of releaseIds) {
    try {
      const { data } = await db.getRelease(id)
      processedData.push(processReleaseData(id, data))
      loaded++
      onProgress(loaded, total)
    } catch (err) {
      console.error('Discogs error', err)
      const releaseNotFound: string[] = [`Release with ID ${id} does not exist`]
      processedData.push(releaseNotFound)
    }
  }

  return processedData
}
