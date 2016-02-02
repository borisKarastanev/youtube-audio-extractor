/**
 * Created by boris on 1/26/16.
 */
/* Global Vars */

var validLink = new RegExp('^(http:\/\/|https:\/\/)(www\.youtube\.com\/)'); // Regular expression for validating user input
var filesContainer = $('#files');
var btn = $('#submit-link'); // Submit btn


function reloadContainer(container) {
    var linkInput = $('#tube-url');
    var loadingAnimation = $('#loading');
    $.get('/files', function (files) {
        container.empty();
        container.append(files);
        linkInput.val('');
        loadingAnimation.removeClass('glyphicon glyphicon-refresh glyphicon-refresh-animate');
    }).error(function (err) {
        console.log(err.responseText);
        container.empty();
        container.append(err.responseText);
        linkInput.val('');
    });
}

function aduioExtractReq(e) {
    e.preventDefault();
    var loadingAnimation = $('#loading');
    var linkInput = $('#tube-url');
    var tubeLink = linkInput.val();
    var postUrl = '/api/v1';

    // Check user input
    if (validLink.test(tubeLink)) {
        loadingAnimation.addClass('glyphicon glyphicon-refresh glyphicon-refresh-animate');
        $.post(postUrl, tubeLink, function (data) {
            console.log(data + '\n');
            reloadContainer(filesContainer);
        });
    } else {
        alert('Please enter a valid youtube link');
        linkInput.val('');
    }
}

function deleteFileReq() {
    var data = $(this).closest('td').prev('td').children('a').attr('href');
    //console.log('delete file ', data);
    var _self = $(this).closest('tr');
    //console.log('Delete table row ', _self);

    $.ajax({
        url: '/delete',
        type: 'DELETE',
        data: data,
        success: function (result) {
            if (result === 'removed') {
                _self.remove();
            }
        },
        error: function (err) {
            if (err) {
                console.log(err);
                alert(err.responseText);
            }
        }
    });

}

$(document).ready(function () {
    btn.click(aduioExtractReq);

    reloadContainer(filesContainer);

    $('#files').on('click', '.del-file', deleteFileReq); // Call Delete Server handler
});