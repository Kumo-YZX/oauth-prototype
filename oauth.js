//
var OAuth = require('oauth');
var config = require('./config');
var querystring = require('querystring');
var request = require('request');
const TWITTER_CONSUMER_KEY = config.TWITTER_CONSUMER_KEY;
const TWITTER_CONSUMER_SECRET =  config.TWITTER_CONSUMER_SECRET;
const TWITTER_ACCESS_TOKEN = config.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = config.TWITTER_ACCESS_SECRET;
const GITHUB_CLIENT_ID = config.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = config.GITHUB_CLIENT_SECRET;
const CURRENT_USER = config.CURRENT_USER;


// 从指定的接口使用OAuth验证拿取数据，返回原始的数据String。
// Please pay action to the elements of action parameter.
// 请求用户信息需要带用户名，请求access token需要带verify string.
// async function oauthRequest(action, callback) {
function oauthRequest(action, callback) {
    var requestUrl = '';
    switch (action.name) {
        case 'requestToken':
            requestUrl = 'https://api.twitter.com/oauth/request_token';
            break;
        case 'accessToken':
            requestUrl = 'https://api.twitter.com/oauth/access_token';
            break;
        case 'userInfo':
            requestUrl = 'https://api.twitter.com/1.1/account/verify_credentials.json?screen_name='+
                action.user+
                '&include_email=true';
            break;
        case 'tweet':
            requestUrl = 'https://api.twitter.com/1.1/statuses/update.json?status='+
                'E0SI0-is-my-favourite-Blockchain-looool';
            break;
    }
    var oauth = new OAuth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        TWITTER_CONSUMER_KEY,
        TWITTER_CONSUMER_SECRET,
        '1.0A',
        null,
        'HMAC-SHA1'
    );
    // var dataStr = '';
    if ( action.name === 'accessToken' ){
        oauth.getOAuthAccessToken(
            action.request_token,
            TWITTER_ACCESS_SECRET,
            action.verify_string,
            function (e, oauth_token, oauth_secret, res) {
                if (e) console.error(e);
                var data = {};
                data.access_token = oauth_token;
                data.access_secret = oauth_secret;
                data.name = res.screen_name;
                data.id = res.user_id;
                console.log(' access token data received... ');
                // console.log(res);
                console.log(data);
                callback(data);
            }
        )
    }
    else if (action.name === 'tweet') {
        oauth.post(
            requestUrl,
            action.user_token,
            action.secret_token,
            '',
            '',
            function (e, data, res) {
                if (e) console.log(e);
                console.log(data);
                console.log(res);
                callback(data);
            }
        );
    }
    else {
        oauth.get(
            requestUrl,
            TWITTER_ACCESS_TOKEN,
            TWITTER_ACCESS_SECRET,
            function (e, data, res) {
                if (e) console.error(e);
                console.log('data received...');
                callback(data);
            }
        );
    }
    console.log('ready to return ');

    // i.then((e,data,res) => console.log(data));
    // console.log(i.toString());
    // console.log(dataStr);
    // console.log(i.toString());
    // console.log(i.data);
    // console.log(i);
    // console.log(e);
    // console.log(data);
    // console.log(res);
}

// resStr =  await oauthRequestToken();
// console.log(resStr);
// 整理数据，返回json格式的数据。
module.exports.getToken = function (callback) {
// function getToken(callback) {
    oauthRequest({ name: 'requestToken' }, function (data) {
        console.log('preparing return...');
        console.log(data);
        var jsonToken = querystring.parse(data);
        callback(jsonToken);
    });
};

module.exports.getUserInfo = function (userName, callback) {
    oauthRequest({ name:'userInfo', user:userName }, function (data) {
        var jsonData = JSON.parse(data);
        console.log(jsonData);
        var usefulData = {};
        usefulData.name = jsonData.screen_name;
        usefulData.email = jsonData.email;
        usefulData.avatar_url = jsonData.profile_image_url_https;
        callback(usefulData);
        // userfulData.avatar = jsonData.;
    })
};

module.exports.getAccessToken = function (requestToken, verifyString, callback) {
    oauthRequest({name:'accessToken', request_token:requestToken, verify_string:verifyString},
        function (data) {
        var jsonToken = data;
        console.log('access token data: ');
        console.log(jsonToken);
        callback(jsonToken);
    })
};

module.exports.sendTweet = function (user_token, secret_token, callback) {
    oauthRequest({name:'tweet', user_token, secret_token}, function (data) {
        console.log(data);
        console.log('send tweet done...');
        callback(data);
    })
};

// 返回的是Raw Query String...
module.exports.getPlainToken = function (code, callback) {
    request.post({url:'https://github.com/login/oauth/access_token',
        form: {client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code: code}},
        function (err, resp, body) {
            if (err) console.error(err);
            // console.log(resp);
            console.log(body);
            callback(body);
    })
};


module.exports.getGithubUserInfo = function (token, callback) {
    request.get({url: 'https://api.github.com/user',
            // 实际上并不会审核APP_NAME，只是必须有User-Agent这一项',
            // 所以谁告诉你要这样填写的？
            headers: {'Authorization': 'token ' + token, 'User-Agent': config.GITHUB_APP_NAME}},
            function (err, resp, body) {
                if (err) {
                    console.error(err);
                    // callback(err);
                    // return ;
                }
                console.log(resp);
                console.log(body);
                callback(body);
                // callback(null, body);
    });
};

// function getGithubUserInfoLocal (token, callback) {
//     request.get({
//             url: 'https://api.github.com/user',
//             // 实际上并不会审核APP_NAME，只是必须有User-Agent这一项',
//             // 所以谁告诉你要这样填写的？
//             headers: {'Authorization': 'token ' + token, 'User-Agent': config.GITHUB_APP_NAME}
//         },
//         function (err, resp, body) {
//             if (err) {
//                 // console.error(err);
//                 callback(err);
//                 return ;
//             }
//             console.log(resp);
//             console.log(body);
//             callback(null, body);
//         });
// }

// callback(null, body);
// function test() {
//     getToken(function (jsonToken) {
//         console.log(jsonToken.oauth_token);
//         console.log(jsonToken.oauth_token_secret);
//     });
//     // getUserInfo(CURRENT_USER,function (usefulData) {
//     //     console.log(usefulData);
//     // })
// }
//
// // test();
//     if (err) {
//         console.log(' error occurs... is catched... ');
//         console.log(err);
//         return ;
//     }
//     console.log(body);
// });
