const path = require('path');
const fs = require('fs');

module.exports = (req, res) => {
    // Serve index.html for the root route
    const indexPath = path.join(__dirname, '..', 'index.html');
    
    if (fs.existsSync(indexPath)) {
        const html = fs.readFileSync(indexPath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.status(200).send(html);
    } else {
        res.status(404).send('Not Found');
    }
};