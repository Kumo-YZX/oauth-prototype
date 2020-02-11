# OAuth Prototype
**Prototype Application to use OAuth service of some platforms.**
... under construction

## Twitter
1.用户点击“Login with twitter”按钮（/login/twitter），先向twitter申请一个一次性的token，依此将用户重定向至twitter的授权登录页面
2.用户在授权页面进行授权
3.授权成功后，twitter将用户重定向回callback url，带着用户的token。
4.后端验证用户的token向twitter验证，确认登陆成功。
5.用户的token可用于调用其他api