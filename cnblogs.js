var myhttp = require('./myhttp');
var db = require('./db');
var cheerio = require('cheerio');
var http = require('http');

db.init();

var successCallback = function(body){
    var $ = cheerio.load(body);
    $('div.post_item_body .article_view a').each((i,e)=>{
        var link = $(e).attr('href');
        var text = $(e).text();
        var sIndex = text.indexOf('(');
        var eIndex = text.indexOf(')');
        var viewCount = text.substr(sIndex+1,eIndex-sIndex-1);
         

        var intViewCount = parseInt(viewCount);
        if(intViewCount>1000){
            console.log(link+' '+viewCount);   
            trySendMail(link);
        }
    });
}

var trySendMail = function(url){
    db.find('cnblogsnotice',{url:url},function(row){
        if(row.length == 0){
            //send mail
            var mail = {
                body :url,
                subject:'博客园推送'
            };

            var bodyHmtl = JSON.stringify(mail);
            console.log(bodyHmtl);
            myhttp.post('http://localhost:3200/cnblogsnotice', bodyHmtl,false, (res) => {
                console.log(res.body);

                db.insert('cnblogsnotice',{url:url});

            }, (err) => {
                console.log(err);
            });
        }
    })
}

var filterPage = function(startIndex,endIndex,success){
    if(startIndex>endIndex) return;

    var url = 'https://www.cnblogs.com/mvc/AggSite/PostList.aspx';
    var postBody = {"CategoryType":"SiteHome","ParentCategoryId":0,"CategoryId":808,"PageIndex":startIndex,"TotalPostCount":4000,"ItemListActionName":"PostList"};

    myhttp.post(url,postBody,true,(res)=>{
        success(res.body);
        if(startIndex<=endIndex){
            var nextIndex = startIndex+1;   
            filterPage(nextIndex,endIndex,success);
        }
    },(err)=>{
        console.log(err);
    },3);

}

exports.filter = function(start,end){
    filterPage(start,end,successCallback);
}
