/*Core modules*/
var fs = require('fs');
var path = require('path');
var url = require('url');

/*Libs*/
var audioExt = require("./audio-extractor.js");

/*Global Vars*/
var restApi = {};
var resourceDir = __dirname.replace('server', 'client') + '/'; // Serve static files from the client directory
var maxDataSize = 100 * 1024; //100kb
var mimeTypes = {
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.xml': 'application/xml',
    '.html': 'text/html',
    '.jpg': 'image/jpeg',
    '.png': 'image/png'
};

restApi.handlePost = function (req, res) {
    var data = '';
    console.log(req.connection.remoteAddres); // Check user IP Address
    req.on('data', function(d){
        data += d;
        console.log('Data from client', data);
        console.log('Data size', data.length);
        if(data.length > maxDataSize) {
            res.writeHead(413);
            res.end('Error, data too large');
            req.connection.destroy();
        }
        audioExt.logFile(req, data);
    });

    req.on('end', function() {
        audioExt.extractAudio(data, function (err, result) {
            if (err) {
                console.log(err);
                res.writeHead(500);
                res.end(err.toString());
            }
            res.writeHead(200);
            res.end(result);
        });
    });
};

restApi.handleGet = function (req, res) {
    var lookup = url.parse(decodeURI(req.url)).pathname;
    lookup = path.normalize(lookup);
    lookup = (lookup === '/') ? 'index.html': lookup; //router
    //console.log('Searching for file details', lookup);
    var audioFolder = __dirname.replace('server', 'audio');

    // Get Downloaded Files from folder
    if (lookup === '/files') {
        audioExt.fileList(audioFolder, function (err, data) {
            if (err) {
                res.writeHead(404);
                res.end('Resource not found');
                console.log(err);
            } else {
                res.writeHead(200);
                res.end(data.toString());
            }
        });
    }

    if(lookup.indexOf('.mp3') > -1){
        console.log('Download request', lookup);
        audioExt.downloadFiles(req, function(err, file) {
            //console.log('file name ', path.basename(lookup));
            console.log('File size for download ', file.file_size);
            if(err) {
                res.writeHead(400);
                res.end('File not found');
                console.log(err);
            } else {
                res.writeHead(200, {
                    'Content-Lenght': file.file_size,
                    'Content-Type': 'audio/mpeg',
                    'Content-disposition': 'attachment; filename="' + path.basename(lookup) + '"'
                });
                res.end(file.download_file);
            }
        });

    }

    // Get Static resourses from folder
    var staticFiles = resourceDir + lookup
    staticFiles = path.normalize(staticFiles);

    fs.readFile(staticFiles, function (err, content) {
        if (err) {
            res.writeHead(404);
            res.end('Resource not found\n');
        } else {
            var headers = {
                "Content-Type": mimeTypes[path.extname(req.url)],
                "Content-Length": content.length
            };
            res.writeHead(200, headers);
            res.end(content);
        }
    });
};

restApi.handlePut = function (req, res) {

};

restApi.handleDel = function (req, res) {
    var data = '';

    req.on('data', function(d) {
        data += d;
        console.log('File for delete ', data);
    });

    req.on('end', function() {
        audioExt.deleteFile(data, function (err, result) {
            if (err) {
                res.writeHead(500);
                res.end('Cannot delete file, please try again');
            } else {
                res.writeHead(200);
                res.end(result);
            }
        });
    });
};

module.exports = restApi;