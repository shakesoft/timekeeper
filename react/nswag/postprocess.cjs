const fs = require('fs');
const path = require('path');

const target = path.resolve(__dirname, '..', 'src', 'api', 'generated', 'service-proxies.ts');
const header = '/* eslint-disable @typescript-eslint/ban-ts-comment */\n// @ts-nocheck\n';

try {
    if (!fs.existsSync(target)) {
        process.exit(0);
    }
    
    let content = fs.readFileSync(target, 'utf8');
    
    if (content.startsWith(header)) {
        process.exit(0);
    }
        
    content = header + content;
    
    fs.writeFileSync(target, content, 'utf8');
    process.exit(0);
} catch (err) {
    process.exit(1);
}

