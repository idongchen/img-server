##mobdata-visual-dashboard接口文档：


新增1个接口 - 2019-6-11 21:32:00

/getimglist

修改一个接口 -2019-6-11 21:32:37
/uploadfile

IP地址：
http://10.18.97.58:9007
未指定参数类型时，默认为json

###1.获取列表：
`/getList`
method: get
不需要参数
返回结构：
[{bid: '',,,},{}]

###2.获取详情
`/getDetail`
method: get
需要参数：
{bid: '由/getList中下发'}

###3.创建bid
说明：新建case之前调用
`/createBid`
method: get
无需参数。


###4.新建一个case
新建之前调用3./createBid以获得bid
放入参数list下
`/createCase`
method: post
参数示例：

```javascript
let params = {
    list: {
        // 3中获取的bid
        // 上传后下发的：
        img: require('assets/images/bmap_throw.jpg'),
        // 上传后下发的：
        download: ''
        bid: 'abcdexxxxx',
        key: 'throw',
        name: 'BMap 区域画圈',
        path: '/bmap/throw',
        updateTime: '2018-12-09',
    },
    // 以上部分作为case 列表中的一个展示用，字段保持一致
    // 以下是详情中的内容，可以相对定制化，自由组合
    detail: {
        api: {
            props: [
                {name: '', desc: '', type: '', default: ''}
            ],
            events: [],
            slot: [],
            methods: [],
        },
        chartsType: '',
        chartsData: []
    }
}
```
###5.文件上传
/uploadfile
参数类型：FormData
####a.图片上传
参数如下：
    params.append('fileType', 'img');
    params.append('bid', 'abctestbid');
    params.append('file', el.files[0]);
####b.包 上传（仅限zip）
>注意：zip中第一级需要包含入口index.html！
zip中不能出现中文目录或文件名！

参数如下：

```javascript
    let params = new FormData();
    params.append('fileType', 'zip');
    params.append('bid', 'abctestbid');
    params.append('file', el.files[0]);
```
