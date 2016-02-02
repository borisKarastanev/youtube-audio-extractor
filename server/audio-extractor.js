/**
 * Created by boris on 1/26/16.
 */
/*Core modules */
var fs = require('fs');
var path = require("path");
var url = require("url");
var exec = require('child_process').exec;
var ytdl = require('youtube-dl');

/*Global vars*/
var outputPath = __dirname.replace('server', 'audio');
var testUrl = 'https://www.youtube.com/watch?v=FWOsbGP5Ox4';
var audioExtractor = {};

console.log(outputPath);

audioExtractor.extractAudio = function (url, cb) {
    if (typeof url !== 'string') {
        throw new Error('Url must be of type string');
    }

    this._getFolderSize(cb);

    var options = [
        '-x', '--audio-format', 'mp3', '--audio-quality',
        '320', '--output', './audio/%(title)s.%(ext)s'
    ];
    ytdl.exec(url, options, function (err, result) {
        if (err) {
            console.log('Youtube downloader error', err);
            cb(new Error('Something went wrong'));
        } else {
            cb(null, result);
        }
    });

};

audioExtractor.fileList = function (filePath, cb) {
    if (typeof filePath !== 'string') {
        throw new Error('Path must be of type string');
    } else if (!filePath) {
        cb(null, 'Folder Empty');
    }
    var _self = this;
    var folderDetails = {};
    var dataArr = [];

    /*fs.readdir(filePath, function (err, files) {
     var dataArr = [];


     if (err) {
     cb(new Error('Error reading files in directory', err));
     return;
     }
     for (var i = 0; i < files.length; i++){
     var fileStat = fs.statSync(path.join(filePath, files[i]));
     fileStat = fileStat.size;
     fileStat = (fileStat / 1048576).toFixed(1);
     dataArr.push('<a href="/' + files[i] + '" download>' +
     files[i] + '</a><span type="button" class="del-file">delete</span>' +
     '<span class="file-size">' + fileStat + ' MB</span></br>');
     }
     //console.log('Data array', dataArr);
     cb(null, dataArr);
     });*/
    try {
        var audioFiles = fs.readdirSync(filePath);
        for (var i = 0; i < audioFiles.length; i++) {
            var fileStat = fs.statSync(path.join(filePath, audioFiles[i]));
            fileStat = fileStat.size;
            fileStat = (fileStat / 1048576).toFixed(1);
            dataArr.push('<tr><td class="file-name"><a href="/' + audioFiles[i] + '" download>' +
                    audioFiles[i] + '</a></td><td><span type="button" class="btn btn-danger del-file">delete</span></td>' +
                    '<td class="text-center"><span class="file-size">' + fileStat + ' MB</span></br></td></tr>');
        }
        cb(null, dataArr);
    } catch (err) {
        console.error('Error reading dir', err);
        cb(new Error('Error reading dir'))
    }

};

audioExtractor.downloadFiles = function (req, cb) {
    var urlPath = url.parse(req.url);
    urlPath.pathname = urlPath.pathname.replace(/%20/g, ' ');
    console.log('Url pathname replaced???', urlPath.pathname);
    var dir = __dirname.replace('server', 'audio');
    fs.stat(path.join(dir, urlPath.pathname), function (err, stat) {
        if (err) {
            new Error('File does not exist');
        } else {
            var file = fs.readFileSync(path.join(dir, urlPath.pathname));
            var fileObj = {
                file_size: stat.size,
                download_file: file
            };
            cb(null, fileObj);
        }
    });
};

audioExtractor.clearDownloadDir = function (path, cb) {
    if (typeof path !== 'string') {
        throw new Error('Path must be of type string');
    }
    var command = 'rm -R ' + outputPath;
    exec(command, function (err, stdout, stderr) {
        if (err) {
            cb(new Error('Something went wrong', err));
        }
        if (stderr.length !== 0) {
            cb(new Error(stderr));
        }

        cb(null, stdout);
    });
};

audioExtractor.deleteFile = function (filePath, cb) {
    if (typeof filePath !== 'string') {
        throw new Error('Path must be of type string');
    }
    var dir = __dirname.replace('server', 'audio');
    console.log('check path for delete', filePath);

    fs.unlink(path.join(dir, filePath), function (err) {
        if (err) {
            cb(new Error('Error occured while trying to delete the file'));
        } else {
            cb(null, 'removed');
        }
    });
};

audioExtractor._getFolderSize = function (cb) {
    var command = 'du -sh ' + outputPath;
    var maxFolderSize = 250; //mb
    var _self = this;
    var folderInfo = {};

    exec(command, function (err, stdout, stderr) {
        if (err) {
            cb(new Error(err));
        }
        if (stderr.length !== 0) {
            cb(new Error(stderr));
            throw new Error(stderr);
        }

        var result = stdout.toString().replace('M', '');
        result = parseInt(result);
        console.log('Current folder size in mb ', result);

        if (result > maxFolderSize) {
            cb(null, 'No free space for download');
            return;
        }
        /*else {
         var freeSpace = maxFolderSize - result + ' MB';
         folderInfo.used_space = result;
         folderInfo.free_space = freeSpace;
         folderInfo = JSON.stringify(folderInfo);
         cb(null, folderInfo);
         }*/
    });
};

audioExtractor.logFile = function (req, data) {
    var time = new Date().getTime();
    var date = new Date(time);
    var ip = req.connection.remoteAddress;
    var userData = data;
    var fileData = '[Date] ' + date + ' [ip_address] ' + ip + ' [user_data] ' + userData + ' \n';

    fs.appendFile(path.join(__dirname.replace('server', ''), 'userLog.log'), fileData, function (err) {
        if (err) {
            new Error('Error writting into log file ')
        } else {
            console.log('Succes writting into log file');
        }

    });
};

module.exports = audioExtractor;


/*audioExtractor.downloadFiles('Alan Fitzpatrick - Skeksis.mp3', function (err, data) {
 if (err) throw err;
 console.log(data);
 })*/

/*fs.readFile(path.join(__dirname.replace('server', 'audio'), 'Alan Fitzpatrick - Skeksis.mp3'), function(err, data){
 console.log(data);
 });*/