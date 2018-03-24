#### Mavatar ####

移动端头像上传，支撑头像预览和放大缩小平移。


### 在线预览 ###
[在线预览地址](http://binlive.cn/mavatar "预览地址")

二维码预览
[![qrcode](http://img.binlive.cn/upload/1521910380734 "qrcode")](http://img.binlive.cn/upload/1521910380734 "qrcode")
### 使用 ###
安装

    $ npm install mavatar
引入

    import Mavatar from 'mavatar'

创建html标签并赋值id,在dom完成装在的周期里，如 `react`的(componentDidMount), `vue`的(mounted)中进行实例化。

    componentDidMount() {
		window.avatar = new Mavatar({
		  el: '#avatar',
		  backgroundColor: '#ff6633'
		});
	}

	// jsx
	<div id = "avatar"/>


### 方法 ###


图片裁剪:
图片裁剪方法，回调中可以获取裁剪完成base64。

    window.avatar.imageClipper(function(dataurl) {
		console.log(dataurl);
	});

重置:
重置头像上传方法。

    window.avatar.resetImage();

获取头像上传前的信息(大小，尺寸等)。

    const flieInfo = window.avatar.getfileInfo();
获取头像完成裁剪生成的base64(注意！使用时确保图片已完成裁剪，图片裁剪为异步方法)。

    const dataUrl = window.avatar.getDataUrl();
### 实例化时传入的参数 ###


    avatar = new Mavatar({option})

|参数   |值   |描述   |
| ------------ | ------------ | ------------ |
| el  | id(string)，无默认值  | 必需dom的id  |
| width  |(string)默认200px   | 不传则默认为生成200px宽的头像上传域  |
| height  |(string)默认200px   | 不传则默认为生成200px高的头像上传域  |
|  backgroundColor | (string)默认为空  | 不传则裁剪时空的区域为透明  |
|  hd |  (boolean)默认为true  |  默认为生成两倍大小图片，解决高清屏中图片生成不清晰 |
