'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var router = _express2.default.Router();

// when index.js execute app/index.js
var appDir = _path2.default.join(__dirname, '/..');
var viewPath = _path2.default.join(appDir, '/views');
var publicPath = _path2.default.join(appDir, '/public');

var stremOption = {
    method: 'GET',
    request: {
        accept: '*/*'
    },
    response: {
        'content-type': ''
    }
};

var resourceScript = function resourceScript(line) {
    if (/<script/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
};

var resourceStyleseet = function resourceStyleseet(line) {
    if (/<link/.test(line) && /stylesheet/.test(line) && /href=/.test(line)) {
        return line.match(/href="([^"]*)"/)[1];
    }

    return false;
};

var resourceImage = function resourceImage(line) {
    if (/<img/.test(line) && /src=/.test(line)) {
        return line.match(/src="([^"]*)"/)[1];
    }

    return false;
};

var resourceFileList = function resourceFileList(filePath, option) {
    var result = [];
    var regFile = /\/.*?([\/\w\.]+)[\s\?]?.*/;
    var regExt = /\.(.*)/;

    _fs2.default.readFileSync(filePath, option).split(/\n/).filter(function (line) {
        var file = void 0;
        if (resourceScript(line)) {
            file = resourceScript(line);
        } else if (resourceStyleseet(line)) {
            file = resourceStyleseet(line);
        } else if (resourceImage(line)) {
            file = resourceImage(line);
        } else {
            return false;
        }

        var fileExtention = file.split(regExt)[1];
        var path = file;
        if (file.indexOf('/') > 0) {
            path = '/' + file;
        }

        result.push({
            path: path,
            mime: _mimeTypes2.default.lookup(fileExtention)
        });
    });
    return result;
};

var createResourcefileMap = function createResourcefileMap(path) {
    var result = {};
    var viewFile = '' + viewPath + path;
    return new Promise(function (resolve, reject) {
        if (!_fs2.default.lstatSync(viewFile).isFile()) {
            reject('file not exist');
        }

        var option = { encoding: 'utf8' };
        result['' + path] = resourceFileList(viewFile, option);
        resolve(result);
    });
};

// using server push middlewear
router.get('/*', function (req, res, next) {
    if (!/text\/html/.test(req.headers.accept)) {
        next();
    }

    // browser support push
    if (!res.push) {
        next();
    }

    var path = '' + req.url;
    if (req.url.slice(-1) === '/') {
        path = path + 'index.html';
    }

    createResourcefileMap(path).then(function (resorceFileMap) {
        var pushFiles = resorceFileMap[path];
        Promise.all(pushFiles.map(function (file) {
            var option = Object.assign(stremOption, { 'response': { 'content-type': file.mime } });
            // create push stream
            var stream = res.push(file.path, option);

            stream.on('error', function (error) {
                console.error(error);
            });

            stream.end(_fs2.default.readFileSync('' + publicPath + file.path));
            return file;
        })).then(function (files) {
            next();
        });
    });
});

// server send files and service worker
router.get('/', function (req, res) {
    var html = _fs2.default.readFileSync(viewPath + '/index.html');
    res.end(html);
});

// server send files (server push)
router.get('/push', function (req, res) {
    var html = _fs2.default.readFileSync(viewPath + '/push/index.html');
    res.end(html);
});

module.exports = router;