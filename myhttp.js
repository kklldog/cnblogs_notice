var request = require('request');

var get = function (url, callback, errCallback, trytimes) {
    req({ url: url, timeout: 30000 }, callback, errCallback, trytimes);
}

var post = function(url,body,isJson,callback,errCallback,trytimes){
    req({ url: url, timeout: 30000,body:body,method:'POST',json:isJson }, callback, errCallback, trytimes);    
}

var req = function (option, callback, errCallback, trytimes) {
    if (trytimes === undefined) {
        trytimes = 5;
    }
    request(option, function (err, res) {
        if (err) {
            console.error('request ' + option.url + ' error .');
            console.error(err);
            if (trytimes > 0) {
                req(option, callback, errCallback, trytimes - 1);
            }
            else {
                if (errCallback) {
                    errCallback(err);
                }
            }
        }
        else {
             callback(res);
        }

    });
}

exports.get = get;
exports.post = post;
exports.req = req;