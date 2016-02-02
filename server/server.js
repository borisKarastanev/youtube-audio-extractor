/*Core Modules*/
var http = require("http");

/*Libs*/
var audioExt = require('./audio-extractor');
var reqHandler = require('./rest-api');

function httpReqHandler (req, res) {
    if(req.method === 'GET') {
        reqHandler.handleGet(req, res);
    } else if (req.method === 'POST' && req.url === '/api/v1') {
        reqHandler.handlePost(req, res);
    } else if(req.method === 'DELETE' && req.url === '/delete') {
        reqHandler.handleDel(req, res);
    }
    else {
        res.statusCode = 400;  // not found
        res.writeHead(400);
        res.end('Bad request \n');
    }
}

var httpServer = http.createServer();

httpServer.on('request', httpReqHandler);

var port = 8080;
var host = '0.0.0.0';

httpServer.listen(port, host);

console.log('App is running on ', host, ':', port);