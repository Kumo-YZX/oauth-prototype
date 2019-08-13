//

var http = require('http');
var url = require('url');
var querystring = require('querystring');
var oauth = require('./oauth.js');
var token = require('./token.js');
var config = require('./config');

var server = http.createServer(function (req, res) {
    const pureURL = url.parse(req.url);
    console.log(pureURL.pathname);
    var queryData = {};
    if ('/' === pureURL.pathname){
        res.statusCode = 200;
        res.write('<p><a href="/login/twitter">Login with Twitter</a></p>' +
                  '<p><a href="/login/github">Login with GitHub</a></p>');
        return res.end();
    }
    else if ('/login/twitter' === pureURL.pathname) {
        oauth.getToken(function (jsonToken) {
            res.writeHead(301, {'Location': 'https://api.twitter.com/oauth/authenticate?oauth_token='+jsonToken.oauth_token});
            // res.statusCode = 200;
            // res.write(jsonToken.oauth_token);
            return res.end();
        })
    }
    else if ('/login/github' === pureURL.pathname) {
        token.generateRandomString(function (scope) {
            res.writeHead(301, {'Location':
                    'https://github.com/login/oauth/authorize?client_id=' + config.GITHUB_CLIENT_ID +
                    '&scope=read:public_repo,read:user,user:email' +
                    '&state=' + scope});
            return res.end();
        })

    }
    else if ('/complete/twitter' === pureURL.pathname) {
        queryData = querystring.parse(pureURL.query);
        console.log(queryData);
        oauth.getAccessToken(queryData.oauth_token, queryData.oauth_verifier, function(jsonToken) {
            console.log(jsonToken);
            res.statusCode = 200;
            token.saveUserToken(jsonToken, function (name) {
                console.log(name);
                res.write('<p>User Name: ' + jsonToken.name + '</p>' +
                    '<p>User Id: ' + jsonToken.id.substring(0,4) + '******</p>' +
                    '<p>Access Token: ' + '******' + '</p>' +
                    '<p>Access Secret: ' + '******' + '</p>' +
                    '<p><a href="/twitter/send?user=' + jsonToken.name  + '">Click here to Send a Tweet!</a></p>');
                return res.end();
            })
        })
    }
    else if ('/twitter/send' === pureURL.pathname) {
        queryData = querystring.parse(pureURL.query);
        console.log(queryData);
        token.getUserToken(queryData.user, function (token) {
            console.log(token.username);
            oauth.sendTweet(token.user_token, token.secret_token, function (data) {
                console.log(data);
                res.write('<p><a href="https://twitter.com/' + token.username + '">View the Tweet</a></p>');
                return res.end();
            })
        })
    }
    else if ('/complete/github' === pureURL.pathname) {
        queryData = querystring.parse(pureURL.query);
        console.log(queryData);
        token.verifyToken(queryData.state, function (result) {
            if (result) {
                oauth.getPlainToken(queryData.code, function (body) {
                    const tokenData = querystring.parse(body);
                    oauth.getGithubUserInfo(tokenData.access_token, function (body) {
                        const replyJson = JSON.parse(body);
                        res.write('<p>Page: 0z2530Q</p>' +
                                  '<p>User: ' + replyJson.login + '</p>' +
                                  '<p>Id: ' + replyJson.id + '</p>' +
                                  // '<p>Access Token: ' + tokenData.access_token + '</p>' +
                                  // '<p>Token Type: ' + tokenData.token_type + '</p>');
                                  '<p>Access Token: ' + '******' + '</p>' +
                                  '<p>Token Type: ' + '******' + '</p>');
                        return res.end();
                    });
                });
            }
            else {
                res.write('<h1>Token Broken...</h1>');
                return res.end();
            }
        });
    }
    else if ('/test' === pureURL.pathname) {
        // const result = pureURL.searchParams('key');
        queryData = querystring.parse(pureURL.query);
        console.log(queryData);
        res.statusCode = 200;
        res.write('<p>Key Value: '+ queryData.key +'</p>');
        return res.end();
    }
    else {
        res.write('<p>Bad location</p>');
        return res.end();
    }
});

server.listen(8000);
