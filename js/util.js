function getStorage(key) {
  let result = localStorage.getItem(key)
  try {
    return JSON.parse(result)
  } catch {
    return result 
  }
}
function setStorage(key, val) {
  if (val || val === 0) localStorage.setItem(key, JSON.stringify(val))
}

function delStorage(key) {
  localStorage.removeItem(key)
}

window.baseToken = ''
window.baseRepo = 'dhjz/f'

window.requestGit = axios.create({
  baseURL: 'https://api.github.com/',
  timeout: 10000,
  headers: {
    'Authorization': 'Bearer ' + baseToken, 
    'Accept': 'application/vnd.github+json', 
    'X-GitHub-Api-Version': '2022-11-28'
  }
})
requestGit.interceptors.request.use(function (config) {
  config.headers['Authorization'] = 'Bearer ' + baseToken
  return config;
}, function (error) {
  return Promise.reject(error);
});
requestGit.interceptors.response.use(function (response) {
  console.log('请求成功', response);
  hideLoading()
  return response;
}, function (error) {
  hideLoading()
  return Promise.reject(error);
});

window.gitUtils = {
  getSha(path) {
    return new Promise((reso, rej) => {
      requestGit.get(`/repos/${baseRepo}/contents/${path}`).then(res => reso(res.data.sha)).catch(() => reso(null))
    })
  },
  getContent(path, isFull) {
    if (isFull) return requestGit.get(`/repos/${baseRepo}/contents/${path}`)

    return new Promise((reso, rej) => {
      requestGit.get(`/repos/${baseRepo}/contents/${path}`).then(res => {
        if (Array.isArray(res.data)) return reso(res.data)
        reso(Base64.decode(res.data.content))
      }).catch(() => {
        console.log('not exit file: ' + path)
        reso(null)
      })
    })
  },
  putContent(path, content) {
    const data = {
      message: now() + ' update ' + path,
      content: Base64.encode(content),
    }

    return this.getSha(path).then(sha => {
      if (sha) data.sha = sha
      return requestGit.put(`/repos/${baseRepo}/contents/${path}`, data)
    })
  }
}

function now(isNumber, date) {
  date = date || new Date()
  if (isNumber) return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().replace(/\D/g, '').substring(0,14)
  return new Date(date.getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0,19)
}

function showLoading(val) {
  document.getElementById('loading').innerHTML = val || '处理中...'
  document.getElementById('loading').className = ''
}

function hideLoading() {
  document.getElementById('loading').className = 'hide'
}

window.dnotifyTimer = null
function dnotify(txt, time) {
  clearTimeout(dnotifyTimer)
  if (document.getElementById('dnotify')) {
    document.getElementById('dnotify').innerHTML = txt
    document.getElementById('dnotify').style.display = 'block';
  } else {
    var notEle = document.createElement('div');
    notEle.id = 'dnotify'
    notEle.innerHTML = txt;
    notEle.style = `display: flex; min-width: 330px;max-width: 40%; padding: 12px 16px 12px 16px; border-radius: 8px; box-sizing: border-box; border: 1px solid #ebeef5; position: fixed; background-color: #fff;top:16px;right:16px;z-index: 9999999;
    box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);  transition: opacity .3s,transform .3s,left .3s,right .3s,top .4s,bottom .3s;  overflow: hidden;font-size: 14px;line-height: 1.4;text-align: center;justify-content: center;color:#333;`
    document.body.append(notEle)
  } 
  dnotifyTimer = setTimeout(function(){ document.getElementById('dnotify').style.display = 'none'; }, time ? time : 1500)
}  

window.linkUtil = {
  put() {
    const str = prompt('请输入短链key|val', '')
    let arr = str.split('|')
    if (arr.length != 2) return alert('格式错误: key|val')
    axios.get(`/t?type=putlink&key=${arr[0].trim()}&val=${encodeURIComponent(arr[1].trim())}`).then(() => {
      alert('添加成功')
    })
  }
}

function showStar2() {
  let speed = 1;
  class StarSky {
    canvas;
    context;
    timer;
    mountainArr = [];
    starArr = [];
    meteorArr = [];
    width = window.innerWidth;
    height = window.innerHeight;
    constructor(id){
      this.canvas = document.getElementById(id);
      this.init();
    }

    init(){
      console.log(this.canvas);
      if (!this.canvas) return;
      this.canvas.width = this.width;
      this.canvas.height = this.height;
      this.canvas.style.display = 'block';
      this.context = this.canvas.getContext('2d');
      
      var drawMountainX = 0;
      while(drawMountainX < this.width){
        if(this.rand(1,2) == 1){
          this.mountainArr.push([drawMountainX,this.rand(this.height-70,this.height-50),drawMountainX-this.rand(15,25),this.height-60]);
        }else{
          this.mountainArr.push([drawMountainX,this.rand(this.height-70,this.height-50)]);
        }
        drawMountainX += this.rand(10,30);
      }
      
      var ladder = 0;
      while(ladder < this.height-300){
        for(var i = 0 ; i < (this.height-ladder)/100 ; i++){
          this.starArr.push([this.rand(0,this.width),this.rand(ladder,ladder+20),this.rand(0,10),0.1]);
        }
        ladder += 20;
      }
      
      this.drawTimer();
    }

    drawSky(){
      if (!this.context) return;
      this.context.beginPath();
      var skyStyle = this.context.createLinearGradient(0,0,0,this.canvas.height);
      skyStyle.addColorStop(0,"#000211");
      skyStyle.addColorStop(0.3,"#080d23");
      skyStyle.addColorStop(0.7,"#18203d");
      skyStyle.addColorStop(1,"#293756");
      this.context.fillStyle = skyStyle;
      this.context.fillRect(0,0,this.width,this.height);
      this.context.closePath();
    }
    drawMountain(){
      this.context.beginPath();
      this.context.fillStyle = '#111';
      this.mountainArr.forEach((v)=>{
        if(v.length == 4){
          this.context.quadraticCurveTo(v[2],v[3],v[0],v[1])
        }else{
          this.context.lineTo(v[0],v[1]);
        }
      });
      this.context.lineTo(this.width,this.height-60);
      this.context.lineTo(this.width,this.height);
      this.context.lineTo(0,this.height);
      this.context.fill();
      this.context.closePath();
    }
    darwStar(){
      this.starArr.forEach((v)=>{
        this.context.beginPath();
        this.context.fillStyle = "rgba(255,255,255,"+v[2]/10+")"; 
        this.context.arc(v[0],v[1],1,0,2*Math.PI);
        this.context.fill();
        this.context.closePath();
      });
    }
    drawMoon(){
      this.context.beginPath();
      var MoonStyle = this.context.createRadialGradient(200,100,28,200,100,40);
      MoonStyle.addColorStop(0,'rgba(255,255,255,1)');
      MoonStyle.addColorStop(1,'rgba(255,255,255,0)');
      this.context.fillStyle = MoonStyle; 
      this.context.arc(300,150,50,0,2*Math.PI);
      this.context.fill();
      this.context.closePath();
    }
    drawMeteor(){
      var meteorNum = this.rand(-14,14);  // 控制数量
      if(meteorNum == 1){
        this.meteorArr.push([this.rand(0,this.width+this.height),0, 0.8 * speed]); //this.rand(1,3)
      }
      this.meteorArr.forEach((v)=>{
        this.context.beginPath();
        this.context.fillStyle = "rgba(255,255,255,1)";
        if(v[0] > this.width){
          this.context.arc(v[0],v[1]+(v[0]-this.width),1,0,2*Math.PI);
        }else{	
          this.context.arc(v[0],v[1],1,0,2*Math.PI);
        }
        this.context.fill();
        if(v[0] > this.width){
          var meteorStyle = this.context.createLinearGradient(v[0],v[1],v[0]+v[2]*20,v[1]+(v[0]-this.width)-v[2]*20);
          meteorStyle.addColorStop(0,"rgba(255,255,255,1)");
          meteorStyle.addColorStop(1,"rgba(255,255,255,0)");
          this.context.strokeStyle = meteorStyle;
          this.context.lineTo(v[0],v[1]+(v[0]-this.width));
          this.context.lineTo(v[0]+v[2]*20,v[1]+(v[0]-this.width)-v[2]*20);
        }else{
          var meteorStyle = this.context.createLinearGradient(v[0],v[1],v[0]+v[2]*20,v[1]-v[2]*20);
          // meteorStyle.addColorStop(0,"rgba(" + this.rand(0,255) + "," + this.rand(0,255) + "," + this.rand(0,255) + ",1)");
          meteorStyle.addColorStop(0,"rgba(255,255,255,1)");
          meteorStyle.addColorStop(1,"rgba(255,255,255,0)");
          this.context.strokeStyle = meteorStyle;
          this.context.lineTo(v[0],v[1]);
          this.context.lineTo(v[0]+v[2]*20,v[1]-v[2]*20);
        }
        this.context.stroke();
        this.context.closePath();
      })
      this.meteorArr.forEach((v,index)=>{
        v[0] -= v[2];
        v[1] += v[2];
        if(v[0] < -20 || v[1] > this.height){
          this.meteorArr.splice(index,1);
        }
      })
    }
    drawTimer(){
      this.starArr.forEach((v)=>{
        if(v[2] + v[3] < 0 || v[2] + v[3] > 10){
          v[3] *= -1;
        }
        v[2] += v[3];
      });
      this.drawSky();
      this.darwStar();
      // this.drawMoon();
      this.drawMeteor();  // 流星
      this.drawMountain();
      window.requestAnimationFrame(this.drawTimer.bind(this));
      // this.timer = setInterval(()=>{
      // 	// this.starArr......
      // 	this.drawSky();
      // 	this.darwStar();
      // 	this.drawMoon();
      // 	this.drawMeteor();
      // 	this.drawMountain();
      // },20)
    }
    rand(min,max){
      var c = max - min + 1;
      return Math.floor(Math.random() * c + min);
    }
  } 
  new StarSky('canvas_star');
}
showStar2()

// js-base64 3.7
;(function(global,factory){typeof exports==='object'&&typeof module!=='undefined'?module.exports=factory():typeof define==='function'&&define.amd?define(factory):(function(){var _Base64=global.Base64;var gBase64=factory();gBase64.noConflict=function(){global.Base64=_Base64;return gBase64};if(global.Meteor){Base64=gBase64}global.Base64=gBase64})()}((typeof self!=='undefined'?self:typeof window!=='undefined'?window:typeof global!=='undefined'?global:this),function(){'use strict';var version='3.7.7';var VERSION=version;var _hasBuffer=typeof Buffer==='function';var _TD=typeof TextDecoder==='function'?new TextDecoder():undefined;var _TE=typeof TextEncoder==='function'?new TextEncoder():undefined;var b64ch='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';var b64chs=Array.prototype.slice.call(b64ch);var b64tab=(function(a){var tab={};a.forEach(function(c,i){return tab[c]=i});return tab})(b64chs);var b64re=/^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;var _fromCC=String.fromCharCode.bind(String);var _U8Afrom=typeof Uint8Array.from==='function'?Uint8Array.from.bind(Uint8Array):function(it){return new Uint8Array(Array.prototype.slice.call(it,0))};var _mkUriSafe=function(src){return src.replace(/=/g,'').replace(/[+\/]/g,function(m0){return m0=='+'?'-':'_'})};var _tidyB64=function(s){return s.replace(/[^A-Za-z0-9\+\/]/g,'')};var btoaPolyfill=function(bin){var u32,c0,c1,c2,asc='';var pad=bin.length%3;for(var i=0;i<bin.length;){if((c0=bin.charCodeAt(i++))>255||(c1=bin.charCodeAt(i++))>255||(c2=bin.charCodeAt(i++))>255)throw new TypeError('invalid character found');u32=(c0<<16)|(c1<<8)|c2;asc+=b64chs[u32>>18&63]+b64chs[u32>>12&63]+b64chs[u32>>6&63]+b64chs[u32&63]}return pad?asc.slice(0,pad-3)+"===".substring(pad):asc};var _btoa=typeof btoa==='function'?function(bin){return btoa(bin)}:_hasBuffer?function(bin){return Buffer.from(bin,'binary').toString('base64')}:btoaPolyfill;var _fromUint8Array=_hasBuffer?function(u8a){return Buffer.from(u8a).toString('base64')}:function(u8a){var maxargs=0x1000;var strs=[];for(var i=0,l=u8a.length;i<l;i+=maxargs){strs.push(_fromCC.apply(null,u8a.subarray(i,i+maxargs)))}return _btoa(strs.join(''))};var fromUint8Array=function(u8a,urlsafe){if(urlsafe===void 0){urlsafe=false}return urlsafe?_mkUriSafe(_fromUint8Array(u8a)):_fromUint8Array(u8a)};var cb_utob=function(c){if(c.length<2){var cc=c.charCodeAt(0);return cc<0x80?c:cc<0x800?(_fromCC(0xc0|(cc>>>6))+_fromCC(0x80|(cc&0x3f))):(_fromCC(0xe0|((cc>>>12)&0x0f))+_fromCC(0x80|((cc>>>6)&0x3f))+_fromCC(0x80|(cc&0x3f)))}else{var cc=0x10000+(c.charCodeAt(0)-0xD800)*0x400+(c.charCodeAt(1)-0xDC00);return(_fromCC(0xf0|((cc>>>18)&0x07))+_fromCC(0x80|((cc>>>12)&0x3f))+_fromCC(0x80|((cc>>>6)&0x3f))+_fromCC(0x80|(cc&0x3f)))}};var re_utob=/[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;var utob=function(u){return u.replace(re_utob,cb_utob)};var _encode=_hasBuffer?function(s){return Buffer.from(s,'utf8').toString('base64')}:_TE?function(s){return _fromUint8Array(_TE.encode(s))}:function(s){return _btoa(utob(s))};var encode=function(src,urlsafe){if(urlsafe===void 0){urlsafe=false}return urlsafe?_mkUriSafe(_encode(src)):_encode(src)};var encodeURI=function(src){return encode(src,true)};var re_btou=/[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;var cb_btou=function(cccc){switch(cccc.length){case 4:var cp=((0x07&cccc.charCodeAt(0))<<18)|((0x3f&cccc.charCodeAt(1))<<12)|((0x3f&cccc.charCodeAt(2))<<6)|(0x3f&cccc.charCodeAt(3)),offset=cp-0x10000;return(_fromCC((offset>>>10)+0xD800)+_fromCC((offset&0x3FF)+0xDC00));case 3:return _fromCC(((0x0f&cccc.charCodeAt(0))<<12)|((0x3f&cccc.charCodeAt(1))<<6)|(0x3f&cccc.charCodeAt(2)));default:return _fromCC(((0x1f&cccc.charCodeAt(0))<<6)|(0x3f&cccc.charCodeAt(1)))}};var btou=function(b){return b.replace(re_btou,cb_btou)};var atobPolyfill=function(asc){asc=asc.replace(/\s+/g,'');if(!b64re.test(asc))throw new TypeError('malformed base64.');asc+='=='.slice(2-(asc.length&3));var u24,bin='',r1,r2;for(var i=0;i<asc.length;){u24=b64tab[asc.charAt(i++)]<<18|b64tab[asc.charAt(i++)]<<12|(r1=b64tab[asc.charAt(i++)])<<6|(r2=b64tab[asc.charAt(i++)]);bin+=r1===64?_fromCC(u24>>16&255):r2===64?_fromCC(u24>>16&255,u24>>8&255):_fromCC(u24>>16&255,u24>>8&255,u24&255)}return bin};var _atob=typeof atob==='function'?function(asc){return atob(_tidyB64(asc))}:_hasBuffer?function(asc){return Buffer.from(asc,'base64').toString('binary')}:atobPolyfill;var _toUint8Array=_hasBuffer?function(a){return _U8Afrom(Buffer.from(a,'base64'))}:function(a){return _U8Afrom(_atob(a).split('').map(function(c){return c.charCodeAt(0)}))};var toUint8Array=function(a){return _toUint8Array(_unURI(a))};var _decode=_hasBuffer?function(a){return Buffer.from(a,'base64').toString('utf8')}:_TD?function(a){return _TD.decode(_toUint8Array(a))}:function(a){return btou(_atob(a))};var _unURI=function(a){return _tidyB64(a.replace(/[-_]/g,function(m0){return m0=='-'?'+':'/'}))};var decode=function(src){return _decode(_unURI(src))};var isValid=function(src){if(typeof src!=='string')return false;var s=src.replace(/\s+/g,'').replace(/={0,2}$/,'');return!/[^\s0-9a-zA-Z\+/]/.test(s)||!/[^\s0-9a-zA-Z\-_]/.test(s)};var _noEnum=function(v){return{value:v,enumerable:false,writable:true,configurable:true}};var extendString=function(){var _add=function(name,body){return Object.defineProperty(String.prototype,name,_noEnum(body))};_add('fromBase64',function(){return decode(this)});_add('toBase64',function(urlsafe){return encode(this,urlsafe)});_add('toBase64URI',function(){return encode(this,true)});_add('toBase64URL',function(){return encode(this,true)});_add('toUint8Array',function(){return toUint8Array(this)})};var extendUint8Array=function(){var _add=function(name,body){return Object.defineProperty(Uint8Array.prototype,name,_noEnum(body))};_add('toBase64',function(urlsafe){return fromUint8Array(this,urlsafe)});_add('toBase64URI',function(){return fromUint8Array(this,true)});_add('toBase64URL',function(){return fromUint8Array(this,true)})};var extendBuiltins=function(){extendString();extendUint8Array()};var gBase64={version:version,VERSION:VERSION,atob:_atob,atobPolyfill:atobPolyfill,btoa:_btoa,btoaPolyfill:btoaPolyfill,fromBase64:decode,toBase64:encode,encode:encode,encodeURI:encodeURI,encodeURL:encodeURI,utob:utob,btou:btou,decode:decode,isValid:isValid,fromUint8Array:fromUint8Array,toUint8Array:toUint8Array,extendString:extendString,extendUint8Array:extendUint8Array,extendBuiltins:extendBuiltins};gBase64.Base64={};Object.keys(gBase64).forEach(function(k){return gBase64.Base64[k]=gBase64[k]});return gBase64}));

window.en = Base64.encode
window.de = Base64.decode