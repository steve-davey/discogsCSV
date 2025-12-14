/* eslint-env node */
import { DiscogsClient } from '@lionralfs/discogs-client';

class RateLimiter {
    constructor(maxRequests = 55, windowMs = 60000) {
        this.maxRequests = maxRequests;
        this.windowMs = windowMs;
        this.requests = [];
    }
    
    async waitIfNeeded() {
        const now = Date.now();
        
        // Remove requests outside the current window
        this.requests = this.requests.filter(time => now - time < this.windowMs);
        
        if (this.requests.length >= this.maxRequests) {
            const oldestRequest = this.requests[0];
            const waitTime = this.windowMs - (now - oldestRequest) + 100; // +100ms buffer
            console.log(`Rate limit reached (${this.requests.length}/${this.maxRequests}). Waiting ${Math.ceil(waitTime/1000)}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            
            // Clear the window after waiting
            this.requests = [];
        }
        
        this.requests.push(Date.now());
    }
}

const rateLimiter = new RateLimiter(55, 60000); // 55 requests per minute

export default async function (context, req) {
    const releaseId = req.query.releaseId;
    
    if (!releaseId) {
        context.res = {
            status: 400,
            body: { error: "Please provide a releaseId" }
        };
        return;
    }

    await rateLimiter.waitIfNeeded(); 

    // Resolve token safely across environments (Node/Azure Functions or tests)
    const token =
        (typeof process !== 'undefined' && process.env && process.env.DISCOGS_TOKEN) ||
        // allow passing token in request header for testing: 'x-discogs-token'
        (req.headers && req.headers['x-discogs-token']);

    // For debugging deployments: log only presence, never the token value
    console.log('DISCOGS_TOKEN present:', !!token);
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