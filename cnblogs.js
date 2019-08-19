var myhttp = require('./myhttp');
var db = require('./db');
var cheerio = require('cheerio');
var http = require('http');

db.init();

var successCallback = function (body, mailAddress) {
    var $ = cheerio.load(body);
    $('div.post_item_body').each((index, postBody) => {
        var name = $(postBody).find('a.titlelnk').text();
        $(postBody).find('span.article_view a').each((i, e) => {
            var link = $(e).attr('href');
            var text = $(e).text();
            var sIndex = text.indexOf('(');
            var eIndex = text.indexOf(')');
            var viewCount = text.substr(sIndex + 1, eIndex - sIndex - 1);
            var intViewCount = parseInt(viewCount);
            console.log(link + ' ' + viewCount + ' ' + name);
            if (intViewCount > 1000) {
                // console.log(link + ' ' + viewCount+' '+name);
                trySendMail(link, name,mailAddress);
            }
        });

    });
}

var trySendMail = function (url, name,address) {
    console.log('try send mail , '+url);
    db.find('cnblogsnotice', { url: url }, function (row) {
        if (row.length == 0) {
            //send mail
            var mail = {
                body: url,
                subject: '博客园推送 -' + name,
                address:address
            };

            var bodyHmtl = JSON.stringify(mail);
            console.log(bodyHmtl);
            myhttp.post('http://mail_service:3200/cnblogsnotice', bodyHmtl, false, (res) => {
                console.log(res.body);

                db.insert('cnblogsnotice', { url: url });

            }, (err) => {
                console.log(err);
            });
        }
    })
}

var filterPage = function (startIndex, endIndex, success,address) {
    if (startIndex > endIndex) return;

    var url = 'https://www.cnblogs.com/aggsite/topviews#p';

    myhttp.get(url+startIndex, (res) => {
        console.log(url+startIndex);
        success(res.body,address);
        if (startIndex <= endIndex) {
            var nextIndex = startIndex + 1;
            filterPage(nextIndex, endIndex, success,address);
        }
    }, (err) => {
        console.log(err);
    }, 3);

}
function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }
var findMailAddress = function (callback) {
    var mailAddress = [];
    var fun = (i) => {
        var url = "https://www.cnblogs.com/kklldog/ajax/GetComments.aspx?postId=7337667&anchorCommentId=0&pageIndex=";
        myhttp.get(url + i, (res) => {
            var body = res.body;
            console.info(url+i);
            //console.info(body);
            //var bodyObj = JSON.parse(body);
            var $ = cheerio.load(body);
            var comments = $('div.blog_comment_body');
            if (comments.length > 0) {
                comments.each((i, e) => {
                    var comment = $(e).text();
                    comment = comment.replace(/\n/g,"");
                    comment = comment.replace(/\s/g,"");
                    if(validateEmail(comment)){
                        mailAddress.push(comment);
                        console.info(comment);
                    }
                });
                fun(i + 1);
            } else {
                callback(mailAddress);
            }
        }, (err) => { }, 3);
    };
    fun(1);
}

exports.filter = function (start, end) {
    findMailAddress((address) => {
        filterPage(start, end, successCallback,address);
    });
}
