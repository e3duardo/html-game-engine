parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"nOQS":[function(require,module,exports) {
"use strict";function t(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function e(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function n(t,n,i){return n&&e(t.prototype,n),i&&e(t,i),t}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var i=function(){function e(n){t(this,e),this.tag=n,this.solid=this.tag.classList.contains("solid"),this.platform=this.tag.classList.contains("platform")}return n(e,[{key:"x",get:function(){return this.tag.offsetLeft}},{key:"y",get:function(){return this.tag.offsetTop}},{key:"width",get:function(){return this.tag.offsetWidth}},{key:"height",get:function(){return this.tag.offsetHeight}}]),e}();exports.default=i;
},{}],"4H6k":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("./Collidable"));function e(t){return t&&t.__esModule?t:{default:t}}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function r(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}var o=function(){function e(){var i=this;n(this,e),this.tag=document.querySelector(".Scene"),this.line_to_scroll=128,this._scroll_x=0,this.scroll_x_start=0,this.collisionMap=[],document.querySelectorAll(".Collidable").forEach(function(e){i.collisionMap.push(new t.default(e))})}return r(e,[{key:"scroll_x",get:function(){return this._scroll_x},set:function(t){this.x=-t,this._scroll_x=t}},{key:"width",get:function(){return this.tag.clientWidth}},{key:"height",get:function(){return this.tag.clientHeight}},{key:"x",get:function(){return this.tag.offsetLeft},set:function(t){(t=parseInt(t))!=this.x&&(this.tag.style.left=t+"px")}},{key:"y",get:function(){return this.tag.offsetTop},set:function(t){(t=parseInt(t))!=this.y&&(this.tag.style.top=t+"px")}}]),e}(),l=new o;exports.default=l;
},{"./Collidable":"nOQS"}],"r6ZD":[function(require,module,exports) {
"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var r=function(){function t(){e(this,t),this.tag=document.querySelector(".Stage")}return n(t,[{key:"width",get:function(){return this.tag.clientWidth}},{key:"height",get:function(){return this.tag.clientHeight}}]),t}(),i=new r;exports.default=i;
},{}],"lLWZ":[function(require,module,exports) {
"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0,document.addEventListener("keydown",function(e){},!1);var o=function(){function t(){var n=this;e(this,t),r(this,"releaseA",function(){console.log(n.keys.a,"<"),n.keys.a=!1}),r(this,"translateKeyboard",function(e){return"ArrowUp"==e?"up":"ArrowRight"==e?"right":"ArrowDown"==e?"down":"ArrowLeft"==e?"left":"a"==e?"a":""}),this.keys={up:!1,right:!1,down:!1,left:!1,a:!1},document.addEventListener("keydown",function(e){e.repeat||(n.keys[n.translateKeyboard(e.key)]=!0)}),document.addEventListener("keyup",function(e){e.repeat||(n.keys[n.translateKeyboard(e.key)]=!1)})}return n(t,[{key:"up",get:function(){return this.keys.up}},{key:"right",get:function(){return this.keys.right}},{key:"down",get:function(){return this.keys.down}},{key:"left",get:function(){return this.keys.left}},{key:"a",get:function(){return this.keys.a}}]),t}(),i=new o;exports.default=i;
},{}],"A8Tk":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=l(require("./Game")),e=l(require("./Scene")),i=l(require("./Stage")),a=l(require("./Control"));function l(t){return t&&t.__esModule?t:{default:t}}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function s(t,e){for(var i=0;i<e.length;i++){var a=e[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(t,a.key,a)}}function o(t,e,i){return e&&s(t.prototype,e),i&&s(t,i),t}function d(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}var r={tile:{source:{w:16,h:16},target:{w:32,h:32}},tiles:{target:{w:1,h:1}},canvas:{w:1,h:1}};Number.prototype.inRange=function(t,e){var i=+this;return i>=t&&i<=e};var u=function(){function l(){var s=this;n(this,l),d(this,"animation",function(t){s.tag.classList="Puppet "+t}),d(this,"update",function(){var l=s.x,n=s.y;a.default.right||a.default.left||(s.speedX>0?s.animation("right"):s.animation("left")),a.default.up&&(s.speedX>0?s.animation("lookup-right"):s.animation("lookup-left")),a.default.down&&(s.speedX>0?s.animation("lower-right"):s.animation("lower-left")),0==s.speedY?a.default.left?(s.animation("walk-left"),s.speedX-=s.velocity_x):a.default.right&&(s.animation("walk-right"),s.speedX+=s.velocity_x):a.default.left?s.speedX-=s.velocity_x_jump:a.default.right&&(s.speedX+=s.velocity_x_jump),a.default.a&&0==s.speedY&&(a.default.releaseA(),s.speedY-=s.velocity_y),s.speedY<0?s.speedX>0?s.animation("jumping-right"):s.animation("jumping-left"):s.speedY>0&&(s.speedX>0?s.animation("falling-right"):s.animation("falling-left")),s.speedY+=s.gravity,Math.abs(s.speedY)<.1&&(s.speedY=0),s.speedY>s.speed_limit_y&&(s.speedY=s.speed_limit_y),l+=s.speedX,n+=s.speedY,l<0?l=0:l+s.width>e.default.width&&(l=e.default.width-s.width),n>e.default.height&&t.default.gameOver(),e.default.collisionMap.forEach(function(t){var e={top:!1,bottom:!1,left:!1,right:!1};(l+s.width/2).inRange(t.x-.25,t.x+t.width+1.25)&&((n+s.height).inRange(t.y,t.y+t.height-1)&&n<t.y?e.bottom=!0:n.inRange(t.y,t.y+t.height)&&(e.top=!0)),(n+s.height/2).inRange(t.y-.25,t.y+t.height+1.25)&&((l+s.width).inRange(t.x,t.x+t.width)&&(e.right=!0),l.inRange(t.x,t.x+t.width)&&(e.left=!0)),t.solid?e.top?(n=t.y+s.height,s.speedY=1):e.bottom?(n=t.y-s.height,s.speedY=0):e.right?(l=t.x-s.width,s.speedX=0):e.left&&(l=t.x+s.width,s.speedX=0):t.platform&&e.bottom&&s.speedY>0&&(n=t.y-s.height,s.speedY=0)}),e.default.scroll_x<=0?l>i.default.width/2&&(e.default.scroll_x=1):e.default.scroll_x>=e.default.width-i.default.width&&e.default.width>i.default.width?(e.default.scroll_x=e.default.width-i.default.width,l<e.default.width-i.default.width/2&&(e.default.scroll_x=e.default.width-i.default.width-1)):e.default.width>i.default.width&&l>e.default.line_to_scroll&&(e.default.scroll_x=l-e.default.line_to_scroll),s.speedX*=s.friction,s.x=l,s.y=n}),d(this,"walk",function(t){s.speedX+=s.velocity_x,s.tag.classList.add("walk"),s.tag.classList.remove("walk-back")}),d(this,"walkReverse",function(t){s.speedX-=s.velocity_x,s.tag.classList.remove("walk"),s.tag.classList.add("walk-back")}),d(this,"jump",function(){s.speedY-=s.velocity_y}),d(this,"lower",function(){}),d(this,"respawnPlayer",function(){s.x=2*r.tile.target.w,s.y=5*r.tile.target.h,e.default.scroll_x=0,s.speedX=0,s.speedY=0}),this.tag=document.querySelector(".Puppet"),this.velocity_x=1.5,this.velocity_x_jump=1,this.velocity_y=22,this.gravity=3,this.friction=.8,this.speed_limit_y=10,this._speedX=0,this.speedY=0,this.lives=3,this.background={x:-209,y:0}}return o(l,[{key:"x",get:function(){return this.tag.offsetLeft},set:function(t){(t=parseFloat(t.toFixed(1)))!=this.x&&(this.tag.style.left=t+"px")}},{key:"y",get:function(){return this.tag.offsetTop},set:function(t){(t=parseFloat(t.toFixed(1)))!=this.y&&(this.tag.style.top=t+"px")}},{key:"speedX",get:function(){return this._speedX},set:function(t){this._speedX=parseFloat(t.toFixed(1))}},{key:"width",get:function(){return this.tag.offsetWidth}},{key:"height",get:function(){return this.tag.offsetHeight}}]),l}();exports.default=u;
},{"./Game":"GLet","./Scene":"4H6k","./Stage":"r6ZD","./Control":"lLWZ"}],"GLet":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("./Puppet"));function t(e){return e&&e.__esModule?e:{default:e}}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}var i=function t(){var i=this;a(this,t),n(this,"gameLoop",function(){i.puppet.update(),i.ticks++;i.thisLoop=new Date,i.lastLoop;i.frameTime+=(i.thisFrameTime-i.frameTime)/i.filterStrength,i.lastLoop=i.thisLoop}),n(this,"newGame",function(){window.clearInterval(i.gameInterval)}),n(this,"gameOver",function(){console.error("dead"),--i.puppet.lives>0&&i.puppet.respawnPlayer()}),n(this,"play",function(){window.clearInterval(i.gameInterval),i.gameInterval=setInterval(i.gameLoop,1e3/i.fps)}),n(this,"restart",function(){window.clearInterval(i.gameInterval)}),this.puppet=new e.default(this),this.ticks=0,this.fps=30,this.filterStrength=20,this.frameTime=0,this.lastLoop=new Date,this.thisLoop},r=new i;exports.default=r;
},{"./Puppet":"A8Tk"}],"Focm":[function(require,module,exports) {
"use strict";var e=r(require("./src/Game"));function r(e){return e&&e.__esModule?e:{default:e}}e.default.play();
},{"./src/Game":"GLet"}]},{},["Focm"], null)
//# sourceMappingURL=/html-game-engine/engine.1878e79f.js.map