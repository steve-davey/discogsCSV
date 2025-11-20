import { app } from '@azure/functions';
import { DiscogsClient } from '@lionralfs/discogs-client';

app.http('getRelease', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request) => {
        const releaseId = request.query.get('releaseId'); 
        
        if (!releaseId) {
            return {
                status: 400,
                jsonBody: { error: "Please provide a releaseId" }
            };
        }

        const db = new DiscogsClient().database();
        
        // Retry logic with exponential backoff
        const maxRetries = 3;
        let lastError;
        
        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const { data } = await db.getRelease(releaseId);
                
                return {
                    status: 200,
                    jsonBody: { success: true, data }
                };
                
            } catch (err) {
                lastError = err;
                
                // If rate limited (status 429), wait and retry
                if (err.response?.status === 429) {
                    const waitTime = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    continue;
                }
                
                // If it's a 404, don't retry
                if (err.response?.status === 404) {
                    break;
                }
            }
        }
        
        // All retries failed
        return {
            status: lastError?.response?.status || 500,
            jsonBody: { 
                success: false, 
                error: `Release with ID ${releaseId} does not exist or could not be fetched`,
                details: lastError?.message 
            }
        };
    }
});