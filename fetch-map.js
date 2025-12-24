
import fs from 'fs';
import https from 'https';
import path from 'path';

const url = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
const dest = path.join(process.cwd(), 'src/data/world-topology.json');

console.log(`Downloading ${url} to ${dest}...`);

const file = fs.createWriteStream(dest);
https.get(url, (response) => {
    response.pipe(file);
    file.on('finish', () => {
        file.close();
        console.log('Download completed.');
    });
}).on('error', (err) => {
    fs.unlink(dest, () => { }); // Delete the file async. (But we don't check for this)
    console.error('Error downloading file:', err.message);
    process.exit(1);
});
