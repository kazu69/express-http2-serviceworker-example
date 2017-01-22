import express from 'express';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';

const router = express.Router();

// when index.js execute app/index.js
const appDir = path.join(__dirname, '/..');
const viewPath = path.join(appDir, '/views');
const publicPath = path.join(appDir, '/public');

const stremOption = {
        method: 'GET',
        request: {
            accept: '*/*'
        },
        response: {
            'content-type': ''
        }
    }

const resourceScript = (line) => {
    if(/<script/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
}

const resourceStyleseet = (line) => {
    if(/<link/.test(line) && /stylesheet/.test(line) && /href=/.test(line)) {
        return line.match(/href="([^"]*)"/)[1];
    }

    return false;
}

const resourceImage = (line) => {
    if(/<img/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
}

const resourceFileList = (filePath, option) => {
    const result = [];
    const regFile = /\/.*?([\/\w\.]+)[\s\?]?.*/;
    const regExt = /\.(.*)/;

    fs.readFileSync(filePath, option)
    .split(/\n/)
    .filter(line => {
        let file;
        if(resourceScript(line)) {
            file = resourceScript(line)
        }

        else if(resourceStyleseet(line)) {
            file = resourceStyleseet(line)
        }

        else if(resourceImage(line)) {
            file = resourceImage(line)
        }

        else {
            return false;
        }

        const fileExtention = file.split(regExt)[1];
        let path = file;
        if(file.indexOf('/') > 0) {
            path = `/${file}`;
        }

        result.push(
            {
                path: path,
                mime: mime.lookup(fileExtention)
            }
        );
    });
    return result;
}

const createResourcefileMap = path => {
    let result = {}
    const viewFile = `${viewPath}${path}`;
    return new Promise((resolve, reject) => {
        if(!fs.lstatSync(viewFile).isFile()) {
            reject('file not exist');
        }

        const option = { encoding: 'utf8' };
        result[`${path}`] = resourceFileList(viewFile, option);
        resolve(result);
    });
}

// using server push middlewear
router.get('/*', function (req, res, next) {
    if(!/text\/html/.test(req.headers.accept)) {
        next();
    }

    // browser support push
    if (!res.push) {
        next();
    }

    let path = `${req.url}`;
    if(req.url.slice(-1) === '/') {
        path = `${path}index.html`;
    }

    createResourcefileMap(path)
    .then(resorceFileMap => {
        const pushFiles = resorceFileMap[path];
        Promise.all(
            pushFiles.map(file => {
                const option = Object.assign(stremOption, {'response': {'content-type': file.mime}});
                // create push stream
                const stream = res.push(file.path, option);

                stream.on('error', error => {
                    console.error(error);
                });

                stream.end(fs.readFileSync(`${publicPath}${file.path}`));
                return file;
            })
        ).then(files => {
            next();
        });
    })
});

// server send files and service worker
router.get('/', (req, res) => {
    const html = fs.readFileSync(`${viewPath}/index.html`);
    res.end(html);
});

// server send files (server push)
router.get('/push', (req, res) => {
    const html = fs.readFileSync(`${viewPath}/push/index.html`);
    res.end(html);
});

module.exports = router;
