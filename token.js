// Random Token String Generator & Holder
const crypto = require('crypto');
const hash = crypto.createHash('sha256');

var config = require('./config');
const TOKEN_SALT = config.TOKEN_SALT;

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: config.MYSQL_HOST,
    user: config.MYSQL_USER,
    password: config.MYSQL_PASSWORD,
    database: config.MYSQL_DATABASE
});
// 注意connect的流控。。
connection.connect();

// 会生成一个token，然后储存到数据库的token_list表里面。
module.exports.generateRandomString = function(callback) {
    const salt = TOKEN_SALT;
    hash.update(salt + 'time');
    const timestamp = new Date().getTime();
    console.log(timestamp);
    hash.update(salt + timestamp);
    const tokenString = hash.digest('hex');
    console.log(tokenString);
    // connection.connect();
    connection.query(
        'INSERT INTO login_token (token_str, token_type, token_status) VALUES (?, ?, ?);',
        [tokenString, 'github', 0],
        function (err, result) {
            if (err) console.log(err);
            console.log(result);
            // connection.end();
            console.log('ending...');
            callback(tokenString);
    });
};

// 判断如果该token存在且status为0，即存在并没有被使用过，设置其为1,即使用过。
// 如果成功改动了，返回值，即影响的行数会是1的。
module.exports.verifyToken = function (token, callback) {
    // connection.connect();
    connection.query(
        'UPDATE login_token SET token_status = ? WHERE (token_str = ? AND token_status = 0);',
        [1, token],
        function (err, result) {
            if (err) console.log(err);
            console.log(result);
            // connection.end();
            console.log('ending...');
            callback(result.affectedRows);
        }
    );
    // connection.end();
};


module.exports.saveUserToken = function (token, callback) {
    connection.query(
        'INSERT INTO user_token (username, user_token, secret_token) VALUES (?, ?, ?);',
        [token.name, token.access_token, token.access_secret],
        function (err, result) {
            if (err) console.log(err);
            console.log(result);
            console.log('User token added...');
            callback(token.name);
        }
    )
};

module.exports.getUserToken = function (username, callback) {
    connection.query(
        'SELECT * FROM user_token WHERE username = ? ORDER BY id DESC LIMIT 1;',
        [username],
        function (err, result) {
            if (err) console.log(err);
            console.log(result);
            console.log('query done...');
            callback(result[0]);
        }
    )
};
// generateRandomString(TOKEN_SALT, function (tokenString) {
//     console.log('...');
//     console.log(tokenString);
// });
//
//     console.log('test result: ');
//     console.log(result);
// });
