#### Mavatar ####

移动端头像上传，支撑头像预览和放大缩小平移。


### 在线预览 ###
[在线预览地址](http://admin.binlive.cn/mavatar "在线预览地址")

###### 二维码预览
![binlive前端开发,web开发,node,vue,react,webpack](http://img.binlive.cn/upload/1525271432704qrcode.png)
### 使用
安装

    npm install mavatar
引入

    import Mavatar from 'mavatar'

创建html的dom标签并定义id名,在dom加载成功的周期里，如 `react`的(componentDidMount), `vue`的(mounted)中进行实例化。也可以在纯js中使用，引入[mavatar.js](http://admin.binlive.cn/lib/mavatar.js "mavatar.js")即可。

#### React中使用示例
```javascript
 import Mavatar from 'mavatar'
 let avatar;

export default class App extends Component {
  componentDidMount() {
    avatar = new Mavatar({
      el: '#avatar',
      backgroundColor: '#ff6633'
    });
  }
  handleClip = (e) => {
    avatar.imageClipper((dataurl) => {
      console.log(dataurl);
    });
  }
  handleReset = (e) => {
    avatar.resetImage();
  }
  render() {
    return (
      <div>
        <div id="avatar" />
        <button onClick={this.handleClip}>裁剪</button>
        <button onClick={this.handleReset}>重置</button>
      </div>
    );
  }
}
```
#### Vue中使用示例
在vue中使用可以直接使用该vue组件[vue-imageClip](https://github.com/Hzy0913/vue-imageClip "vue-imageClip")

#### 普通js中使用示例
下载仓库中`src/lib/mavatar.js`保存到本地并引入
```javascript
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<title>Mavatar</title>
  	<script src="lib/mavatar.js"></script>
</head>
<body>
<body>
	<!-- dom -->
	<div class="avatarbox" >
	  <div id="avatar"></div>
	  <button onclick="clip()">裁剪</button>
	  <button onclick="reset()">重置</button>
	</div>

	<!-- script -->
	<script>
	  var avatar = new Mavatar({el: '#avatar',backgroundColor: '#fff'});
	  function clip() {
	    avatar.imageClipper(function (data) {
	      alert('裁剪成功，生成的图片已覆盖在上传框内');
	      console.log(data);
	    })
	  }
	  function reset() {
	    avatar.resetImage();
	  }
	</script>
</body>
</html>
```

### 方法 ###


**裁剪**: 图片裁剪方法，回调中可以获取裁剪完成base64
```javascript
avatar.imageClipper(function(dataurl) {
	console.log(dataurl);
});
```
**重置**: 重置头像上传方法, 可以清空已上传的图片
```javascript
avatar.resetImage()
```

获取头像上传前的信息(大小，尺寸等)。
```javascript
 const flieInfo = avatar.getfileInfo()
```
获取头像完成裁剪生成的base64(注意！使用时确保图片已完成裁剪，图片裁剪为异步方法)。
```javascript
 const dataUrl = avatar.getDataUrl()
```
### 参数

实例化时传入的配置参数option
` avatar = new Mavatar({option})`

|参数   |值   |描述   |
| ------------ | ------------ | ------------ |
| el  | id(string)，无默认值  | 必传，dom的id  |
| width  |(string)默认200px   | 不传则默认为生成200px宽的头像上传域  |
| height  |(string)默认200px   | 不传则默认为生成200px高的头像上传域  |
|  backgroundColor | (string)默认为空  | 不传则裁剪时空的区域为透明  |
|  hd |  (boolean)默认为true  |  默认为生成两倍大小图片，解决高清屏中图片生成不清晰 |
