/**
 * Created by yun on 2017/1/5.
 */
var http = require('http');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');

var i = 0;
var url = 'http://www.ss.pku.edu.cn/index.php/newscenter/news/2391';

function fetchPage(x){
    startRequest(x);
}

function startRequest(x){
    //get
    http.get(x, function(res){
        var html = '';
        var titile = [];
        res.setEncoding('utf-8'); //in case Chinese messy code

        //listen data
        res.on('data', function(chunk){
            html += chunk;
        });

        //listen 'end', which means fetched the whole page
        res.on('end', function(){

            var $ = cheerio.load(html);             //using cheerio

            var time = $('.article-ndo a:first-child').next().text().trim();

            //get article content
            var news_item = {
                title: $('div.article-title a').text().trim(),
                time,
                link:'http://www.ss.pku.edu.cn'+ $('div.article-title a').attr('href'),
                author: $('[title=供稿]').text().trim(),
                i: i+i,
            };

            console.log(news_item);
            var news_title = $('div.article-title a').text().trim();

            savedContent($, news_title);

            savedImg($, news_title)


            //next article
            var nextLink = 'http://www.ss.pku.edu.cn' + $('li.next a').attr('href');
            var strTmp = nextLink.split('-');    //remove the chinese at the end of url
            var str = encodeURI(strTmp[0]);

            //control the amount of article
            if(i <= 500){
                fetchPage(str);
            }
        });
    }).on('error', function(err){
        console.log(err);
    });
}


//save article at local disk
function savedContent($, news_title){
    $('.article-content p').each(function(index, item){
        var x = $(this).text();

        var y = x.substring(0, 2).trim();

        if(y == ''){
            x=x+'\r\n';
            fs.appendFile('./data/' + news_title + '.txt', x, 'utf-8', function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    })
}

function savedImg($, news_title){
    $('.article-content img').each(function(index, item){
        var img_title = $(this).parent().next().text().trim(); //get img title
        if(img_title.length > 35 || img_title == ''){
            img_title = 'Null';
        }
        var img_filename = img_title + '.jpg';

        var img_src = 'http://www.ss.pku.edu.cn' + $(this).attr('src');

        //fetch img data
        request.head(img_src, function(err, res, body){ // ?? head
            if(err){
                console.log(err);
            }
        })

        //save img by stream
        request(img_src).pipe(fs.createWriteStream('./image/' + news_title + '---' + img_filename));

    })
}

fetchPage(url);