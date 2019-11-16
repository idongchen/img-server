// ...
const Koa = require('koa');
const fs = require('fs');
// 解压zip
const unzip = require("unzip");
const path = require('path');
const cors = require('koa2-cors');
const utils = require('./utils');
const rest = require('./middleware/rest');
// 使用koa-body也是一样的
// const bodyParser = require('koa-bodyparser')
const koaBody = require('koa-body');

// 注意require('koa-router')返回的是函数:
const router = require('koa-router')();
// 使用router.get('/path', async fn)来注册一个GET请求。可以在请求路径中使用带变量的/hello/:name，变量可以通过ctx.params.name访问。
const app = new Koa();
// 导入controller middleware:
const controller = require('./controller');


// 解决跨域
app.use(cors())
// /api/ 自定义的restFul中间件
app.use(rest.restify())

// 输出请求路径，每次请求都会输出
app.use(async (ctx, next) => {
    console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
    await next();
});

// 文件上传
app.use(koaBody({
    multipart: true,
    strict  : false,
    formidable: {
        maxFileSize: 200*1024*1024    // 设置上传文件大小最大限制，默认2M
    }
}));

// bodyParser解决了post接收参数的问题，在下面直接使用ctx.request.body得到传入的参数
// 使用koa-body也是一样的
// app.use(bodyParser())

// 写入时会先清空文件, flag : 'a' 追加
function wLine (path, str) {
	fs.readFile(`mobdb/${path}`, 'utf8', function(err, data){
		// 已有文件： err === null，可以读到data，data正常
	    // if (err === null) {
	    	if(typeof str !== 'string'){
	    		str = JSON.stringify(str);
	    	}
	    	// str = '{' + str + '}';
	    	utils.log(`${path}32`, err)
	    	if(err === null){
	    		utils.log(data.toString() !== '')
	    		utils.log(data.toString())
	    	}
	    	if(err === null && data.toString() !== ''){
	    		str = ',\r\n' + str
	    	}
	    	fs.writeFile('mobdb' + path , str, {flag: 'a'}, function (err) {
			    if (err) {
			        throw err;
			    }
			    console.log('Saved：' + path);
			});
	    // } else {
	    	// 需要新建文件
	    // }
	});
}
/**
 * [mkdirSync description]
 * @param  {[type]}   url  [description]
 * @param  {[type]}   mode [description]
 * @param  {Function} cb   [description]
 * @return {[type]}        [description]
 */
function mkdirSync(url,mode,cb){
  var path = require("path"), arr = url.split("/");
  mode = mode || 0755;
  cb = cb || function(){};
  if(arr[0]==="."){//处理 ./aaa
      arr.shift();
  }
  if(arr[0] == ".."){//处理 ../ddd/d
      arr.splice(0,2,arr[0]+"/"+arr[1])
  }
  if(arr[0]==="."){//处理 ./aaa
      arr.shift();
  }
  if(arr.length > 0 && arr[arr.length - 1] === ''){
    arr.pop()
  }
  function inner(cur){
      if(cur !== '' && !fs.existsSync(cur)){//不存在就创建一个
        utils.log('不存在，准备创建一个')
        fs.mkdirSync(cur, mode)
      }
      utils.log(86, arr)
      if(arr.length){
          arguments.callee(cur + "/" + arr.shift());
      }else{
          cb();
      }
  }
  arr.length && inner(arr.shift());
}
/**
 * [create_case description]
 * @param  {[type]} data [description]
 * @param  {[type]} key  [description]
 * @return {[type]}      [description]
 */
function create_case(data, key){
  // 1.往list里增加list
  // 2.根据id往 mobdb/id+ 'bdb' 文件中写detail
  console.log(key, 63)
  if (typeof data.list === 'object') {
  	data.list['key'] = key;
  	wLine('/list.bdb', data.list);
  }
  if (typeof data.detail === 'object') {
  	wLine(`/detail/${key}.bdb`, data.detail);
  }
}
router.post('/createCase', async (ctx, next) => {
  utils.log(73, 'createCase')
  let postData = ctx.request.body;
  // const key = utils.randomStr(8);
  if(typeof postData.list !== 'object' || typeof postData.list.bid !== 'string' || postData.list.bid === ''){
    return ctx.response.body = {code: 'list.bid error',msg:'list.bid错误'};
  }
  const key = postData.list.bid;
  create_case(postData, key);
  ctx.response.body = {code:'success',msg:'这是写入的数据：',data: postData};
});
// 获取图片列表
router.get('/getimglist', async (ctx, next) => {
    const postData = utils.getParams(ctx.request.url);
    console.log(postData, 234)
    let pageSize = 20
    let pageNum = 1
    if (postData.pageSize && Number(postData.pageSize) > 1) {
        pageSize = Number(postData.pageSize)
    }
    if (postData.pageNum && Number(postData.pageNum) > 0) {
        pageNum = Number(postData.pageNum)
    }
    let files = []
    if (process.argv.slice(-1)[0] === '--dev') {
        // 本地开发
        files = fs.readdirSync(path.join(__dirname, 'public/upload/'));
    } else {
        files = fs.readdirSync(utils.publicPath);

    }
    ctx.body = {code: 'success', data: files.slice(pageNum - 1, pageSize).map(el=>{
        return utils.httpPath + el
    })};
  });
// // 文件上传 多个
router.post('/uploadfiles', async (ctx, next) => {
  // 上传多个文件
  const files = ctx.request.files.file; // 获取上传文件
  for (let file of files) {
    // 创建可读流
    const reader = fs.createReadStream(file.path);
    // 获取上传文件扩展名
    let filePath = path.join(__dirname, 'public/upload/') + `/${file.name}`;
    // 创建可写流
    const upStream = fs.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
  }
 return ctx.body = "上传成功！";
});
// 文件上传--单个
router.post('/uploadfile', async (ctx, next) => {
  // 上传单个文件
  const file = ctx.request.files.file; // 获取上传文件
  const postData = ctx.request.body;
  utils.log(145, ctx.request.files)
    // 提醒：
    // 新版本的koa-body通过ctx.request.files获取上传的文件
    // 旧版本的koa-body通过ctx.request.body.files获取上传的文件
  // 创建可读流
  const reader = fs.createReadStream(file.path);
  let filePath = '';
  if(typeof postData.bid === 'string' && postData.bid !== ''){
    // createCase 中的上传
    if (typeof postData.fileType === 'string') {
      if(postData.fileType === 'img'){
        // createCase 中的上传图片 --- 直接放到public/images中
        const arr = file.name.split('.');
        filePath = `/data/vhost/www/mobdata_bms_dc/public/images/${postData.bid + '.' + arr[arr.length - 1]}`;
        // 创建可写流
        if(filePath !== '') {
          const upStream = fs.createWriteStream(filePath);
          // 可读流通过管道写入可写流
          reader.pipe(upStream);
        } else {
          return ctx.body = {code: 'filePath error', msg: '上传失败，filePath为空'};
        }
        return ctx.body = {
          code: 'success', msg: "上传成功！",
          data: 'http://10.18.97.58:3030/public/images/'+ postData.bid + '.' + arr[arr.length - 1]
        };
      } else if (postData.fileType === 'zip') {
        // createCase 中的上传包
        // 压缩包放 download目录中, 解压后的放在htmls目录中
        const arr = file.name.split('.');
        filePath =`/data/vhost/www/mobdata_bms_dc/public/download/${postData.bid + '.' + arr[arr.length - 1]}`;
        if(filePath !== '') {
          const upStream = fs.createWriteStream(filePath);
          // 可读流通过管道写入可写流
          reader.pipe(upStream);

          // 解压后放到htmls下
          const htmlPath = '/data/vhost/www/mobdata_bms_dc/public/htmls/' + postData.bid
          let hasErr = false;
          await mkdirSync(htmlPath, 0755, (e) => {
            if(e){
              hasErr = true;
            } else {
              hasErr = false;
            }
          });
          await setTimeout(()=>{
            utils.log(165, '即将解压')
            fs.createReadStream(filePath).pipe(unzip.Extract({ path: htmlPath }));
          })
          if(hasErr === false){
            return ctx.body = {
              code: 'success', msg: '上传成功！', data: {download: 'http://10.18.97.58:3030/public/download/'+ postData.bid + '.' + arr[arr.length - 1],
              url: 'http://10.18.97.58:3030/public/htmls/'+ postData.bid+ '/'}
            };
          } else {
            return ctx.body = {code: 'unzip error', msg: '解压失败'};
          }
        } else {
          return ctx.body = {code: 'filePath error', msg: '上传失败，filePath为空'};
        }
      } else {
        return ctx.body = {code: 'fileType not support', msg: '上传失败，fileType字段无效'};
      }
    } else {
      return ctx.body = {code: 'fileType not support', msg: '上传失败，fileType字段无效'};
    }
  } else {
    //   utils.log('正常上传')
    // 正常上传 图片管理器的上传 - 2019-6-11 20:50:57
    if (process.argv.slice(-1)[0] === '--dev') {
        filePath = path.join(__dirname, 'public/upload/') + 't' + new Date().valueOf() + '.' + file.name.split('.').slice(-1)[0];
    } else {
        filePath = utils.publicPath + 't' + new Date().valueOf() + '.' + file.name.split('.').slice(-1)[0];
    }
    // 创建可写流
    if(filePath !== '') {
        const upStream = fs.createWriteStream(filePath);
        // 可读流通过管道写入可写流
        reader.pipe(upStream);
      } else {
        return ctx.body = {code: 'filePath error', msg: '上传失败，filePath为空'};
      }
      return ctx.body = {
        code: 'success', msg: "上传成功！",
        data: '上传成功'
      };
  }
});
// add router middleware:
app.use(router.routes());
// log request URL:
// app.use(async (ctx, next) => {
//     console.log(`Process ${ctx.request.method} ${ctx.request.url}...`);
//     await next();
// });

// 使用middleware:
app.use(controller());
// ...

// 在端口3000监听:
app.listen(9007);
utils.log(17, 'app started at port 9007...');
console.log('是否是开发环境：' + process.argv.slice(-1)[0] === '--dev')