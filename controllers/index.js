const fs = require('fs');
const utils = require('../utils');
// 工具方法：
function parsePostData(ctx) {
    // return new Promise((resolve, reject) => {
        try {
            console.log('try', 5)
            let postData = '';
            ctx.req.addListener('data', (data) => { // 有数据传入的时候
                postData += data;
                console.log(data.toString(), 8000)
            });
            ctx.req.addListener('end', () => {
                let parseData = parseQueryStr(postData);
                console.log(parseData, 777)
                return (parseData);
            });
        } catch (e) {
            console.log(e, ' error')
            return (e);
        }
    // })
}

// 处理 string => json
function parseQueryStr(queryStr) {
  let queryData = {}
  let queryStrList = queryStr.split('&')
  console.log( queryStrList )
  for ( let [ index, queryStr ] of queryStrList.entries() ) {
    let itemList = queryStr.split('=')
    queryData[ itemList[0] ] = decodeURIComponent(itemList[1])
  }
  console.log(queryData)
  return queryData
}
// doSomething函数
function readFile (path) {
    return new Promise((resolve) => {
        // fs.readFile(`mobdb\\${path}`, 'utf8', function(err, data){
        fs.readFile(`mobdb/${path}`, 'utf8', function(err, data){
            if(err){
                // throw err
                resolve({code: 'failed', msg: '读取失败，请检查参数'})
            } else {
                resolve(data.toString())
            }
        })
    })
}
function getFile (path, ctx) {
    readFile(path).then((res)=>{
        console.log(res, 49)
        ctx.body = {code: 'success', data: `[${res}]`};
    })
}
// 路由处理函数 ----------------- ------------------------- -------------------------------- 
var fn_index = async (ctx, next) => {
    ctx.response.body = `
        <h1>NodeJs服务已启动！此端口别关谢谢~</h1>
        <h2>Index</h2>
        <form action="/signin" method="post">
            <p>Name: <input name="name" value="koa"></p>
            <p>Password: <input name="password" type="password"></p>
            <p><input type="submit" value="Submit"></p>
        </form>`;
};

var fn_signin = async (ctx, next) => {
    var
        name = ctx.request.body.name || '',
        password = ctx.request.body.password || '';
    console.log(`signin with name: ${name}, password: ${password}`);
    if (name === 'koa' && password === '12345') {
        ctx.response.body = `<h1>Welcome, ${name}!</h1>`;
    } else {
        ctx.response.body = `<h1>Login failed!</h1>
        <p><a href="/">Try again</a></p>`;
    }
};
var get_list = async (ctx, next) => {
    await readFile('list.bdb').then((res)=>{
        console.log(res, 49)
        try {
            data = JSON.parse(`[${res}]`)
        } catch (err) {
            console.log(err)
            console.log(res,82)
            data = `[${res}]`
        }
        ctx.body = {code: 'success', data: data};
    })
    // ctx.body = {code: 'success', data: `[${res}]`};
    // var
    //     name = ctx.request.body.name || '',
    //     password = ctx.request.body.password || '';
};
function get_params (url) {
    let arr = url.split('?');
    let params = {};
    if(arr.length > 1){
        arr = arr[1].split('&');
        arr.forEach((el, i)=>{
            if(el.split('=').length > 1){
                params[el.split('=')[0]] = el.split('=')[1]
            }
        })
    }
    return params;
}
var get_detail = async (ctx, next) => {
    // var
    //     name = ctx.request.body.name || '',
    //     password = ctx.request.body.password || '';
    const postData = get_params(ctx.request.url);
    utils.log(99, postData)
    if(typeof postData.bid !== 'string' || postData.bid === ''){
        return ctx.body = {code: 'params error', msg: '参数不合法'};
    }
    const bid = postData.bid;
    await readFile('/detail/' + bid + '.bdb').then((res)=>{
        console.log(res, 49)
        if(typeof res === 'object'){
            utils.log(121, res)
            return ctx.body = res;
        }
        let data = {};
        try {
            data = JSON.parse(res)
        } catch (err) {
            console.log(err)
            console.log(res, 82)
            data = res
        }
        ctx.body = {code: 'success', data: data};
    })
};
var create_bid = async (ctx, next) => {
    ctx.body = JSON.stringify({code: 'success', data: utils.randomStr(10)})
};
var upload = async (ctx, next) => {
    const postData = get_params(ctx.request.url);
    utils.log(143, postData)
    // await readFile('list.bdb').then((res) => {
    //     console.log(res, 49)
    //     try {
    //         data = JSON.parse(`[${res}]`)
    //     } catch (err) {
    //         console.log(err)
    //         console.log(res,82)
    //         data = `[${res}]`
    //     }
    //     ctx.body = {code: 'success', data: data};
    // })
    // ctx.body = {code: 'success', data: `[${res}]`};
    // var
    //     name = ctx.request.body.name || '',
    //     password = ctx.request.body.password || '';
};
module.exports = {
    'GET /': fn_index,
    'POST /signin': fn_signin,
    'GET /getList': get_list,
    'GET /getDetail': get_detail,
    'GET /createBid': create_bid,

    // 图片上传
    'POST /upload': upload,

    // 'POST /api/createCase': create_case,
};