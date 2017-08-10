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
            myhttp.post('http://localhost:3200/cnblogsnotice', bodyHmtl, false, (res) => {
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

    var url = 'https://www.cnblogs.com/mvc/AggSite/PostList.aspx';
    var postBody = { "CategoryType": "SiteHome", "ParentCategoryId": 0, "CategoryId": 808, "PageIndex": startIndex, "TotalPostCount": 4000, "ItemListActionName": "PostList" };

    myhttp.post(url, postBody, true, (res) => {
        success(res.body,address);
        if (startIndex <= endIndex) {
            var nextIndex = startIndex + 1;
            filterPage(nextIndex, endIndex, success,address);
        }
    }, (err) => {
        console.log(err);
    }, 3);

}

var findMailAddress = function (callback) {
    var mailAddress = [];
    var fun = (i) => {
        var url = "http://www.cnblogs.com/mvc/blog/GetComments.aspx?postId=7337667&blogApp=kklldog&anchorCommentId=0&pageIndex=";
        myhttp.get(url + i, (res) => {
            var body = res.body;
            var bodyObj = JSON.parse(body);
            var $ = cheerio.load(bodyObj.commentsHtml);
            var comments = $('div.blog_comment_body');
            if (comments.length > 0) {
                comments.each((i, e) => {
                    var comment = $(e).text();
                    var MAIL_REGEXP = /^(\w)+(\.\w+)*@(\w)+((\.\w{2,3}){1,3})$/;
                    if(MAIL_REGEXP.test(comment)){
                        mailAddress.push(comment);
                        console.log(comment);
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
