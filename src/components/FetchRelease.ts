import { DiscogsClient } from '@lionralfs/discogs-client';
import { processReleaseData } from './ProcessReleaseData';

export default  {
  name: 'FetchRelease',
  methods: {
    fetchRelease
  }
}

const db = new DiscogsClient().database();

async function fetchRelease(releaseId: string): Promise<any[] | { error: string }> {
  try {
    const { data } = await db.getRelease(releaseId);
    return processReleaseData(releaseId, data);
  } catch (error) {
    return {
      error: `Release with ID ${releaseId} does not exist`
    };
  }
}