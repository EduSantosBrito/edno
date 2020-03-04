import { readdirSync, readFileSync } from 'fs';
import http from 'http';
import httpProxy from 'http-proxy';

const ip = '192.168.10.84';
const port = 5000;
const rootFolder = './applications';

const getDirectories = source =>
    readdirSync(source, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

const applicationsUrl = getDirectories(rootFolder);
const apiProxy = httpProxy.createProxyServer();

const server = http.createServer((req, res) => {
    const [host] = req.headers.host.split(':');
    applicationsUrl.forEach(applicationUrl => {
        if (host === applicationUrl) {
            const rawData = readFileSync(`${rootFolder}/${applicationUrl}/config.json`);
            const jsonData = JSON.parse(rawData);
            apiProxy.web(req, res, { target: `http://${host}:${jsonData.port}` });
        }
    });
});

server.listen(port, ip, () => {
    console.log(`Server listening in http://${ip}:${port}`);
});
