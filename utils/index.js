'use strict';
const utils = {
    httpPath: 'http://www.7moa.com/files/photos/',
    publicPath: '/home/idongchen/linkwww/files/photos/',
	log(line, e){
		console.log(`Line: ${line} --------------------- Line: ${line}`);
		for(let i = 1; i < arguments.length; i++){
			console.log(arguments[i]);
		}
	},
	randomNum (min, max) {
		return Math.round(min + (max - min) * Math.random())
	},
	randomStr (num) {
		var str = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz'
		var n = '23456789'
		var target = ''
		for (var i = 0; i < num; i++ ) {
			if (i > 0 && Math.random() > 0.7) {
				target += n[this.randomNum(0, n.length - 1)]
			} else {
				target += str[this.randomNum(0, str.length - 1)]
			}
		}
		return target
    },
    getParams (url) {
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
};
module.exports = utils;
