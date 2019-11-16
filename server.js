const utils = require('./utils')
const cors = require('koa2-cors');
// 导入koa，和koa 1.x不同，在koa2中，我们导入的是一个class，因此用大写的Koa表示:
const Koa = require('koa');

// 创建一个Koa对象表示web app本身:
const app = new Koa();

// 对于任何请求，app将调用该异步函数处理请求：
app.use(async (ctx, next) => {
    await next();
    // ctx.response.type = 'text/html';
    // 设置Content-Type:
    ctx.response.header = ''
    ctx.response.type = 'application/json';
    // ctx.response.body = JSON.stringify({abc: 666});
    ctx.body = JSON.stringify({abc: 666, arr: [6,5,4,9]});
});
// 解决跨域
app.use(cors())
// 在端口3000监听:
app.listen(9007);
utils.log(17, 'app started at port 9007...');