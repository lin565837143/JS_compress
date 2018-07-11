/*
 * @Author: MuBei 
 * @Date: 2018-07-11 17:45:46 
 * @Last Modified by: MuBei
 * @Last Modified time: 2018-07-11 18:36:32
 */

// 说明：该文件主要功能为压缩图片，返回图片Bolb对象，纠正在ios下上传的图片方向不对问题（需要引入exif插件）。

/**
 * @param {file} file 图片文件
 * @param {obj} obj 需要压缩到的：宽width，高height，和质量quality。不传时默认为图片自身宽高，质量0.9
 * @param {function} callback 回调
 */
photoCompress = function (file, obj, callback) {
    let orientation;
    EXIF.getData(file, function () {
        orientation = EXIF.getTag(this, 'Orientation');
    });
    let ready = new FileReader();
    /*开始读取指定的Blob对象或File对象中的内容. 当读取操作完成时,readyState属性的值会成为DONE,如果设置了onloadend事件处理程序,则调用之.同时,result属性中将包含一个data: URL格式的字符串以表示所读取文件的内容.*/
    ready.readAsDataURL(file);
    ready.onload = function () {
        let re = this.result;
        canvasDataURL(re, obj, callback, orientation)
    }
}
/**
 * @param {string} path img 图片的base64
 * @param {obj} obj 可传入需要压缩到的图片宽高和质量
 * @param {function} callback 回调
 * @param {number} orientation exif获取的方向信息
 */
canvasDataURL = function (path, obj, callback, orientation) {
    let img = new Image();
    img.src = path;
    img.onload = function () {
        let that = this;
        // 默认按比例压缩
        let degree = 0,
            w = that.width,
            h = that.height,
            scale = w / h;
        w = obj.width || w;
        h = obj.height || (w / scale);
        let quality = 0.9; // 默认图片质量为0.7
        //生成canvas
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        // 定义画布宽高
        canvas.width = width = w;
        canvas.height = height = h;
        //判断图片方向，重置canvas大小，确定旋转角度，iphone默认的是home键在右方的横屏拍摄方式
        switch (orientation) {
            //iphone横屏拍摄，此时home键在左侧
            case 3:
                degree = 180;
                w = -width;
                h = -height;
                break;
                //iphone竖屏拍摄，此时home键在下方(正常拿手机的方向)
            case 6:
                canvas.width = height;
                canvas.height = width;
                degree = 90;
                w = width;
                h = -height;
                break;
                //iphone竖屏拍摄，此时home键在上方
            case 8:
                canvas.width = height;
                canvas.height = width;
                degree = 270;
                w = -width;
                h = height;
                break;
        }

        ctx.rotate(degree * Math.PI / 180);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if (obj.quality && 0 < obj.quality <= 1 ) {
            quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        let base64 = canvas.toDataURL('image/jpeg', quality);
        // 回调函数返回base64的值
        callback(base64);
    }
}

/**
 * 将以base64的图片url数据转换为Blob
 * 用url方式表示的base64图片数据
 */
convertBase64UrlToBlob = function (urlData) {
    let arr = urlData.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {
        type: mime
    });
}
// 压缩图片 end