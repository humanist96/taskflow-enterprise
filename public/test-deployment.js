const http = require('http');
const https = require('https');

// Test configuration
const LOCAL_URL = 'http://localhost:3000';
const VERCEL_URL = process.env.VERCEL_URL || 'https://your-app.vercel.app';

// Test endpoints
const endpoints = [
    { path: '/', method: 'GET', expected: 200, description: 'Root route' },
    { path: '/index.html', method: 'GET', expected: 200, description: 'Index HTML' },
    { path: '/index-enterprise.html', method: 'GET', expected: 200, description: 'Enterprise HTML' },
    { path: '/api/health', method: 'GET', expected: 200, description: 'Health check' },
    { path: '/styles.css', method: 'GET', expected: 200, description: 'CSS file' },
    { path: '/script.js', method: 'GET', expected: 200, description: 'JS file' },
    { path: '/manifest.json', method: 'GET', expected: 200, description: 'Manifest file' }
];

// Test function
async function testEndpoint(baseUrl, endpoint) {
    return new Promise((resolve) => {
        const url = new URL(endpoint.path, baseUrl);
        const protocol = url.protocol === 'https:' ? https : http;
        
        const req = protocol.request(url, { method: endpoint.method }, (res) => {
            const success = res.statusCode === endpoint.expected;
            console.log(`${success ? '✅' : '❌'} ${endpoint.description}: ${res.statusCode} (expected ${endpoint.expected})`);
            resolve(success);
        });
        
        req.on('error', (err) => {
            console.log(`❌ ${endpoint.description}: ${err.message}`);
            resolve(false);
        });
        
        req.end();
    });
}

// Run tests
async function runTests() {
    console.log('🧪 Testing deployment...\n');
    
    // Test local if running
    console.log('📍 Testing local server...');
    let localSuccess = 0;
    for (const endpoint of endpoints) {
        const success = await testEndpoint(LOCAL_URL, endpoint);
        if (success) localSuccess++;
    }
    console.log(`\nLocal: ${localSuccess}/${endpoints.length} tests passed\n`);
    
    // Test Vercel if URL provided
    if (process.env.VERCEL_URL) {
        console.log('☁️ Testing Vercel deployment...');
        let vercelSuccess = 0;
        for (const endpoint of endpoints) {
            const success = await testEndpoint(VERCEL_URL, endpoint);
            if (success) vercelSuccess++;
        }
        console.log(`\nVercel: ${vercelSuccess}/${endpoints.length} tests passed`);
    } else {
        console.log('ℹ️ Set VERCEL_URL environment variable to test Vercel deployment');
        console.log('Example: VERCEL_URL=https://your-app.vercel.app node test-deployment.js');
    }
}

// Run the tests
runTests();