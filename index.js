'use strict';
var hammerjs = require('hammerjs');
var html2canvas = require('html2canvas');
var EXIF = require('exif-js');

(function(global) {
  var Mavatar = function(option) {
    this.el = document.querySelector(option.el);
    this.hd = typeof option.hd === 'boolean' ? option.hd : true;
    this.backgroundColor = option.backgroundColor || '';
    this.dataUrl = null;
    this.file = null;
    this.width = option.width || '200px';
    this.height = option.height || '200px';
    this.imgWidth = null;
    this.imgHeight = null;
    this.orientation;
    this.fileOnchange = option.fileOnchange || null;
    this._init();
  };
  Mavatar.prototype = {
    _init: function(option) {
      var self = this;
      var width = this.width;
      var height = this.height;
      var el = this.el;
      var hd = this.hd;
      var MavatarContainer = document.createElement("div");
      var MavatarWraper = document.createElement("div");
      var canvasBox = document.createElement("div");
      var uploadImages = document.createElement("img");
      var renderImages = document.createElement("img");
      var uploadImagesInput = document.createElement("input");

      MavatarWraper.id = 'Mavatar-wrapper';
      MavatarWraper.style.width = width;
      MavatarWraper.style.height = height;
      MavatarWraper.style.backgroundColor = '#f0f0f0';
      MavatarWraper.style.position = 'relative';

      uploadImagesInput.type = 'file';
      uploadImagesInput.id = 'Mavatar-file';
      uploadImagesInput.accept = 'image/*';
      uploadImagesInput.style.width = width;
      uploadImagesInput.style.height = height;
      uploadImagesInput.style.position = 'absolute';
      uploadImagesInput.style.left = 0;
      uploadImagesInput.style.top = 0;
      uploadImagesInput.style.opacity = 0;

      canvasBox.id = 'Mavatar-canvasWrapper';
      canvasBox.style.width = width;
      canvasBox.style.height = height;
      canvasBox.style.display = 'none';
      canvasBox.style.Zindex = 2;
      canvasBox.style.overflow = 'hidden';

      renderImages.id = 'Mavatar-render';
      renderImages.style.display = 'none';
      renderImages.style.position = 'absolute';
      renderImages.style.left = 0;
      renderImages.style.top = 0;
      renderImages.style.width = width;

      uploadImages.id = 'Mavatar-img';
      canvasBox.appendChild(uploadImages);
      MavatarWraper.appendChild(uploadImagesInput);
      MavatarWraper.appendChild(canvasBox);
      MavatarWraper.appendChild(renderImages);
      el.style.width = width;
      el.appendChild(MavatarWraper);
      document.getElementById('Mavatar-file').addEventListener("change", function (files) {
        self.uploadImages(files)
      }, false);
      var reqAnimationFrame = (function () {
        return window[Hammer.prefixed(window, 'requestAnimationFrame')] || function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();
      var dragEl = document.querySelector("#Mavatar-img");
      this.START_X = 0;
      this.START_Y = 0;
      var initScale = 1;
      var ticking = false;
      this.transform;
      var mc = new Hammer.Manager(dragEl);
      mc.add(new Hammer.Pan({ threshold: 0, pointers: 0 }));
      mc.add(new Hammer.Swipe()).recognizeWith(mc.get('pan'));
      mc.add(new Hammer.Rotate({ threshold: 0 })).recognizeWith(mc.get('pan'));
      mc.add(new Hammer.Pinch({ threshold: 0 })).recognizeWith([mc.get('pan'), mc.get('rotate')]);
      mc.on("panmove", onPan);
      mc.on("pinchmove", onPinch);
      mc.on("panend", function(e) {
        self.START_X = self.transform.translate.x;
        self.START_Y = self.transform.translate.y;
      });
      mc.on("pinchend", function(e) {
        initScale = self.transform.scale;
      });
      function resetElement() {
        self.transform = {
          translate: { x: self.START_X, y: self.START_Y },
          scale: 1,
          angle: 0,
          rx: 0,
          ry: 0,
          rz: 0
        };
        requestElementUpdate();
      };
      function updateElementTransform() {
        var value = [
          'translate3d(' + self.transform.translate.x + 'px, ' + self.transform.translate.y + 'px, 0)',
          'scale(' + self.transform.scale + ', ' + self.transform.scale + ')',
          'rotate3d('+ self.transform.rx +','+ self.transform.ry +','+ self.transform.rz +','+  self.transform.angle + 'deg)'
        ];
        value = value.join(" ");
        dragEl.style.WebkitTransform = value;
        dragEl.style.MozTransform = value;
        dragEl.style.transform = value;
        ticking = false;
      };
      function requestElementUpdate() {
        if(!ticking) {
          reqAnimationFrame(updateElementTransform);
          ticking = true;
        }
      };
      function onPan(ev) {
        self.transform.translate = {
          x: self.START_X + ev.deltaX,
          y: self.START_Y + ev.deltaY
        };
        requestElementUpdate();
      };
      function onPinch(ev) {
        if (ev.scale > 1) {
          self.transform.scale = initScale + ((ev.scale - 1)/2)
        } else {
          self.transform.scale = initScale - ((1 - ev.scale)/2)
        }
        requestElementUpdate();
      }
      resetElement();
    },
    imageClipper: function(getDataUrl) {
      var self = this;
      var wrapperDom = document.getElementById('Mavatar-canvasWrapper')
      var width = this.width.replace(/[^0-9]/ig,"");
      var height = this.height.replace(/[^0-9]/ig,"");
      var scaleBy = this.hd ? 2 : 1;
      var canvas = document.createElement("canvas");
      // 获取元素相对于视窗的偏移量
      var rect = wrapperDom.getBoundingClientRect();
      canvas.width = width * scaleBy;
      canvas.height = height * scaleBy;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      var context = canvas.getContext("2d");
      context.scale(scaleBy, scaleBy);
      // 设置context位置, 值为相对于视窗的偏移量的负值, 实现图片复位
      context.translate(-rect.left, -rect.top);
      document.getElementById('Mavatar-canvasWrapper').style.backgroundColor = this.backgroundColor ? this.backgroundColor : '';
      html2canvas(document.querySelector("#Mavatar-canvasWrapper"), {
        canvas:canvas,
        logging: false,
        backgroundColor: null,
        scale:scaleBy,
      }).then(function(canvas) {
        var dataUrl = canvas.toDataURL("image/png");
        self.dataUrl = dataUrl;
        typeof getDataUrl === 'function' ? getDataUrl(dataUrl) : null
        var MavatarRender = document.getElementById('Mavatar-render');
        MavatarRender.style.display = 'block';
        MavatarRender.src = dataUrl;
      });
    },
    getfileInfo: function () {
      var file = this.file;
      file.width = this.imgWidth;
      file.height = this.imgHeight;
      return file;
    },
    getformData: function (name, dataurl) {
      var timestamp = Date.parse(new Date());
      var filename = timestamp+'.png';
      var arr = dataurl.split(',');
      var mime = arr[0].match(/:(.*?);/)[1];
      var bstr = atob(arr[1]);
      var n = bstr.length;
      var u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      var file = new File([u8arr], filename, {type: mime});
      var formData = new FormData();
      formData.append(name, file, timestamp+'.png');
      return formData;
    },
    getDataUrl: function (dataUrl) {
      return this.dataUrl;
    },
    resetImage: function(width, height) {
      var self = this;
      this.START_X = 0;
      this.START_Y = 0;
      this.transform = {
        translate: { x: 0, y: 0 },
        scale: 1,
        angle: 0,
        rx: 0,
        ry: 0,
        rz: 0
      };
      var MavatarRender = document.getElementById('Mavatar-render');
      MavatarRender.style.display = 'none';
      MavatarRender.src = ''
      document.getElementById('Mavatar-canvasWrapper').style.backgroundColor = '';
      var newUploadImagesInput = document.createElement("input");
      var oldUploadImagesInput = document.getElementById('Mavatar-file');
      newUploadImagesInput.type = 'file';
      newUploadImagesInput.accept = 'image/*';
      newUploadImagesInput.id = 'Mavatar-file';
      newUploadImagesInput.style.width = this.width;
      newUploadImagesInput.style.height = this.height;
      newUploadImagesInput.style.position = 'absolute';
      newUploadImagesInput.style.left = 0;
      newUploadImagesInput.style.top = 0;
      newUploadImagesInput.style.opacity = 0;
      document.getElementById('Mavatar-wrapper').replaceChild(newUploadImagesInput, oldUploadImagesInput);
      document.getElementById('Mavatar-file').addEventListener("change", function (files) {
        self.uploadImages(files)
      }, false);
      document.getElementById('Mavatar-img').src = '';
      document.getElementById('Mavatar-canvasWrapper').style.display = 'none';
    },
    upload: function(option) {
      var option = option || {};
      var url = option.url;
      var name = option.name;
      var imgName = (this.file || {}).name || Date.parse(new Date());
      var success = option.success || null;
      var error = option.error || null;
      var data = option.data || null;

      var dataURLtoFile = function(dataurl, filename) {
        var arr = dataurl.split(',');
        var mime = arr[0].match(/:(.*?);/)[1];
        var bstr = atob(arr[1]);
        var n = bstr.length;
        var u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, {type: mime});
      };

      var file = dataURLtoFile(this.dataUrl, imgName);
      var formData = new FormData();
      formData.append(name, file, imgName);
      if (data) {
        for (name in data) {
          formData.append(name, data[name]);
        }
      }

      var xhr = null;
      if(window.XMLHttpRequest){
        xhr = new XMLHttpRequest();
      } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP')
      }
      xhr.open('POST', url, true);
      xhr.send(formData);
      xhr.onreadystatechange = function(){
        if(xhr.readyState == 4){
          if(xhr.status == 200 && success){
            success(xhr.responseText);
          } else if(error){
            error(xhr);
          }
        }
      };
    },
    uploadImages: function(files) {
      this.fileOnchange && this.fileOnchange(files);
      var self = this;
      var _files = files || event.target.files;
      var _index = 0;
      var Orientation;
      var reader = new FileReader();
      this.file = files.target.files[_index];
      EXIF.getData(files.target.files[_index], function () {
        EXIF.getAllTags(this);
        Orientation = EXIF.getTag(this, 'Orientation');
      });
      reader.readAsDataURL(files.target.files[_index]);
      reader.onload = function(event) {
        var image = new Image();
        image.src = event.target.result;
        image.onload = function() {
          self.imgWidth = image.offsetWidth;
          self.imgHeight = image.offsetHeight;
          var canvas = document.createElement("canvas");
          var ctx = canvas.getContext("2d");
          var rotateBase64;
          var isRotate;
          var width = this.naturalWidth;
          var height = this.naturalHeight;
          switch (Orientation) {
            case 1 :
              canvas.width = width;
              canvas.height = height;
              ctx.drawImage(this, 0, 0, width, height);
              isRotate = true;
              break;
            case 6:
              canvas.width = height;
              canvas.height = width;
              ctx.rotate(90 * Math.PI / 180);
              ctx.drawImage(this, 0, -height);
              isRotate = true;
              break;
            case 8:
              canvas.width = height;
              canvas.height = width;
              ctx.rotate(-90 * Math.PI / 180);
              ctx.drawImage(this, -width, 0);
              isRotate = true;
              break;
            case 3:
              ctx.rotate(180 * Math.PI / 180);
              ctx.drawImage(this, -width, -height);
              isRotate = true;
              break;
            default:
              rotateBase64 = event.target.result;
          }
          if (isRotate) {
            rotateBase64 = canvas.toDataURL("image/png", 1);
          }
          document.getElementById('Mavatar-img').src = rotateBase64;
          var wrapperWidth = self.width.replace(/[^0-9]/ig,"");
          var wrapperHeight = self.height.replace(/[^0-9]/ig,"");
          var isRotate6 = Orientation === 6;
          if (height > width) {
            document.getElementById('Mavatar-img').style.height = self.height;
            document.getElementById('Mavatar-img').style.width = 'auto';
            var translatex = (wrapperWidth - (width/(height/wrapperHeight)))/2;
            self.START_X = translatex;
            document.getElementById('Mavatar-img').style.transform = 'translate('+translatex+'px,0px)';
          } else {
            document.getElementById('Mavatar-img').style.width = self.width;
            document.getElementById('Mavatar-img').style.height = 'auto';
            var translatey = (wrapperHeight-(height/(width/wrapperWidth)))/2;
            self.START_Y = translatey;
            document.getElementById('Mavatar-img').style.transform = 'translate(0px,'+translatey+'px)';
          }
          if (isRotate6) {
            self.START_Y = 0;
            document.getElementById('Mavatar-img').style.transform = 'translate(0px, 0px)';
          }
          document.getElementById('Mavatar-canvasWrapper').style.display = 'block';
          document.getElementById('Mavatar-file').style.display = 'none';
        }
      }
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = Mavatar;
  if (typeof define === 'function') define(function() { return Mavatar; });
  global.Mavatar = Mavatar;
})(this);
