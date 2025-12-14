/* eslint-env node */
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

    // Resolve token safely across environments (Node/Azure Functions or tests)
    const token =
        (typeof process !== 'undefined' && process.env && process.env.DISCOGS_TOKEN) ||
        // allow passing token in request header for testing: 'x-discogs-token'
        (req.headers && req.headers['x-discogs-token']);

    if (!token) {
        context.res = {
            status: 500,
            body: { success: false, error: 'DISCOGS_TOKEN not set in environment or request header' }
        };
        return;
    }

    // Authenticate with your Discogs token to get 60 req/min instead of 25
    const client = new DiscogsClient({
        auth: {
            userToken: token
        }
    });
    const db = client.database();
    
    const maxRetries = 3;
    let lastError;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const { data, rateLimit } = await db.getRelease(releaseId);
            
            console.log(`Release ${releaseId}: ${rateLimit?.remaining || '?'}/${rateLimit?.limit || '?'} requests remaining`);
            
            context.res = {
                status: 200,
                body: { success: true, data }
            };
            return;
            
        } catch (err) {
            lastError = err;
            
            console.error(`Error fetching ${releaseId} (attempt ${attempt + 1}):`, {
                status: err.response?.status,
                message: err.message
            });
            
            if (err.response?.status === 429) {
                const waitTime = Math.pow(2, attempt) * 1000;
                console.log(`⚠️ Rate limited on ${releaseId}, waiting ${waitTime}ms...`);
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
}