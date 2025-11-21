import { DiscogsClient } from '@lionralfs/discogs-client';

export default async function (context, req) {
    const releaseId = req.query.releaseId;
    
    if (!releaseId) {
        context.res = {
            status: 400,
            body: { error: "Please provide a releaseId" }
        };
        return;
    }

    const db = new DiscogsClient().database();
    
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { data } = await db.getRelease(releaseId);
            
            context.res = {
                status: 200,
                body: { success: true, data }
            };
            return;
            
        } catch (err) {
            lastError = err;
            
            if (err.response?.status === 429) {
                const waitTime = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }
            
            if (err.response?.status === 404) {
                break;
            }
        }
    }
    
    context.res = {
        status: lastError?.response?.status || 500,
        body: { 
            success: false, 
            error: `Release with ID ${releaseId} does not exist or could not be fetched`,
            details: lastError?.message 
        }
    };
};