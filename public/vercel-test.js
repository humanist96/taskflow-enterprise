// Vercel Deployment Test Script
// Run this to validate the deployment configuration

const fs = require('fs');
const path = require('path');

console.log('🔍 Vercel Deployment Configuration Test\n');

// Check vercel.json
console.log('1. Checking vercel.json configuration...');
try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    console.log('✅ vercel.json found and valid');
    console.log('   - Functions configuration:', vercelConfig.functions ? '✓' : '✗');
    console.log('   - Rewrites configuration:', vercelConfig.rewrites ? '✓' : '✗');
} catch (error) {
    console.log('❌ Error reading vercel.json:', error.message);
}

// Check API structure
console.log('\n2. Checking API structure...');
const apiDir = path.join(__dirname, 'api');
const apiFiles = [
    'tasks.js',
    'task.js',
    'stats.js',
    'search.js',
    'auth/register.js',
    'auth/login.js',
    'auth/logout.js'
];

apiFiles.forEach(file => {
    const filePath = path.join(apiDir, file);
    if (fs.existsSync(filePath)) {
        console.log(`✅ /api/${file} exists`);
    } else {
        console.log(`❌ /api/${file} missing`);
    }
});

// Check static files
console.log('\n3. Checking static files...');
const staticFiles = [
    'index.html',
    'styles.css',
    'script.js',
    'dashboard.html',
    'dashboard.css',
    'dashboard.js',
    'api-client.js'
];

staticFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file} exists`);
    } else {
        console.log(`❌ ${file} missing`);
    }
});

// Check for problematic configurations
console.log('\n4. Checking for common issues...');
if (fs.existsSync('server.js')) {
    console.log('⚠️  server.js exists - Not needed for Vercel serverless deployment');
}

if (fs.existsSync('public') && fs.statSync('public').isDirectory()) {
    console.log('⚠️  public directory exists - Consider moving files to root for simpler configuration');
}

console.log('\n✨ Test complete! Deploy with: vercel --prod');