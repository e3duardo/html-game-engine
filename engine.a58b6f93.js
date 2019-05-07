parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"eJjk":[function(require,module,exports) {
"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t){for(var n=0;n<t.length;n++){var r=t[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(e,r.key,r)}}function n(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var r=function(){function t(){e(this,t),this.tag=document.querySelector(".Stage")}return n(t,[{key:"width",get:function(){return this.tag.clientWidth}},{key:"height",get:function(){return this.tag.clientHeight}}]),t}(),i=r;exports.default=i;
},{}],"6dW9":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("./Stage"));function t(e){return e&&e.__esModule?e:{default:e}}function l(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var n=function t(){l(this,t),this.game=null,this.collidableFactory=null,this.control=null,this.puppet=null,this.scene=null,this.stage=new e.default},s=new n;exports.default=s;
},{"./Stage":"eJjk"}],"deFs":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("./Inject"));function t(e){return e&&e.__esModule?e:{default:e}}function a(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}var i=function t(){var i=this;a(this,t),n(this,"gameLoop",function(){e.default.puppet.update(),e.default.scene.updatableMapVisible.forEach(function(e){e.update()}),i.ticks++;i.thisLoop=new Date,i.lastLoop;i.frameTime+=(i.thisFrameTime-i.frameTime)/i.filterStrength,i.lastLoop=i.thisLoop}),n(this,"newGame",function(){window.clearInterval(i.gameInterval)}),n(this,"gameOver",function(){--e.default.puppet.lives>0?e.default.puppet.respawnPlayer():document.querySelector(".GameOver").style.display="flex"}),n(this,"play",function(){window.clearInterval(i.gameInterval),i.gameInterval=setInterval(i.gameLoop,1e3/i.fps)}),n(this,"restart",function(){window.clearInterval(i.gameInterval)}),this.ticks=0,this.fps=30,this.filterStrength=20,this.frameTime=0,this.lastLoop=new Date,this.thisLoop},r=i;exports.default=r;
},{"./Inject":"6dW9"}],"YBnZ":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=t(require("./Inject"));function t(e){return e&&e.__esModule?e:{default:e}}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function a(e,t){for(var i=0;i<t.length;i++){var a=t[i];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}function n(e,t,i){return t&&a(e.prototype,t),i&&a(e,i),e}function l(e,t,i){return t in e?Object.defineProperty(e,t,{value:i,enumerable:!0,configurable:!0,writable:!0}):e[t]=i,e}var s={tile:{source:{w:16,h:16},target:{w:32,h:32}},tiles:{target:{w:1,h:1}},canvas:{w:1,h:1}};Number.prototype.inRange=function(e,t){var i=+this;return i>=e&&i<=t};var o=function(){function t(){var a=this;i(this,t),l(this,"animation",function(e){a.tag.classList="Puppet "+e}),l(this,"update",function(){a.ax=a.x,a.ay=a.y,e.default.control.shift?(a.velocity_x=2,a.velocity_x_jump=2.2):(a.velocity_x=1,a.velocity_x_jump=1.2),e.default.control.right||e.default.control.left||(a.speedX<0?a.animation("left"):a.animation("right")),e.default.control.up&&(a.speedX<0?a.animation("lookup-left"):a.animation("lookup-right")),e.default.control.down&&(a.speedX<0?a.animation("lower-left"):a.animation("lower-right")),0==a.speedY?e.default.control.left?(a.animation("walk-left"),a.speedX-=a.velocity_x):e.default.control.right&&(a.animation("walk-right"),a.speedX+=a.velocity_x):e.default.control.left?a.speedX-=a.velocity_x_jump:e.default.control.right&&(a.speedX+=a.velocity_x_jump),e.default.control.a&&0==a.speedY&&a.jump(),a.speedY<0?a.speedX<0?a.animation("jumping-left"):a.animation("jumping-right"):a.speedY>0&&(a.speedX<0?a.animation("falling-left"):a.animation("falling-right")),a.speedY+=e.default.scene.gravity,Math.abs(a.speedY)<.1&&(a.speedY=0),a.speedY>a.speed_limit_y&&(a.speedY=a.speed_limit_y),a.ax+=a.speedX,a.ay+=a.speedY,a.ax<0?a.ax=0:a.ax+a.width>e.default.scene.width&&(a.ax=e.default.scene.width-a.width),a.ay>e.default.scene.height&&e.default.game.gameOver(),e.default.scene.getCollisionMapVisible().forEach(function(e){var t=e.collides(a);e.collide(a,t)}),e.default.scene.scroll_x<=0?a.ax>e.default.stage.width/2&&(e.default.scene.scroll_x=1):e.default.scene.scroll_x>=e.default.scene.width-e.default.stage.width&&e.default.scene.width>e.default.stage.width?(e.default.scene.scroll_x=e.default.scene.width-e.default.stage.width,a.ax<e.default.scene.width-e.default.stage.width/2&&(e.default.scene.scroll_x=e.default.scene.width-e.default.stage.width-1)):e.default.scene.width>e.default.stage.width&&a.ax>e.default.scene.line_to_scroll&&(e.default.scene.scroll_x=a.ax-e.default.scene.line_to_scroll),a.speedX*=a.friction,a.x=a.ax,a.y=a.ay}),l(this,"jump",function(){e.default.control.releaseA(),a.speedY-=a.velocity_y}),l(this,"die",function(){e.default.game.newGame(),a.speedX<0?a.animation("dying-left"):a.animation("dying-right"),setTimeout(function(){e.default.game.gameOver(),e.default.game.play()},1e3)}),l(this,"lower",function(){}),l(this,"respawnPlayer",function(){a.speedX=0,a.speedY=0,a.x=40,a.y=0,e.default.scene.scroll_x=0,e.default.scene.x=0,a.animation("right")}),this.tag=document.querySelector(".Puppet"),this.ax=0,this.ay=0,this.velocity_x=1,this.velocity_x_jump=1.2,this.velocity_y=22,this.friction=.8,this.speed_limit_y=10,this._speedX=0,this.speedY=0,this.lives=3,this.animation("right")}return n(t,[{key:"x",get:function(){return this.tag.offsetLeft},set:function(e){(e=parseFloat(e.toFixed(1)))!=this.x&&(this.tag.style.left=e+"px")}},{key:"y",get:function(){return this.tag.offsetTop},set:function(e){(e=parseFloat(e.toFixed(1)))!=this.y&&(this.tag.style.top=e+"px")}},{key:"speedX",get:function(){return this._speedX},set:function(e){this._speedX=parseFloat(e.toFixed(1))}},{key:"width",get:function(){return this.tag.offsetWidth}},{key:"height",get:function(){return this.tag.offsetHeight}}]),t}();exports.default=o;
},{"./Inject":"6dW9"}],"O2r9":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("~/engine/Puppet"));function e(t){return t&&t.__esModule?t:{default:t}}function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){return!e||"object"!==o(e)&&"function"!=typeof e?u(t):e}function u(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function i(t){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function f(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&c(t,e)}function c(t,e){return(c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var p=function(e){function o(){return n(this,o),r(this,i(o).call(this))}return f(o,t.default),o}(),l=p;exports.default=l;
},{"~/engine/Puppet":"YBnZ"}],"iGVA":[function(require,module,exports) {
"use strict";function e(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function t(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var n=function n(){var r=this;e(this,n),t(this,"translateKeyboard",function(e){return""}),this.keys={},document.addEventListener("keydown",function(e){e.repeat||(r.keys[r.translateKeyboard(e.key)]=!0)}),document.addEventListener("keyup",function(e){e.repeat||(r.keys[r.translateKeyboard(e.key)]=!1)})},r=n;exports.default=r;
},{}],"xqQZ":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("~/engine/ControlBase"));function e(t){return t&&t.__esModule?t:{default:t}}function n(t){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function o(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}function u(t,e,n){return e&&o(t.prototype,e),n&&o(t,n),t}function i(t,e){return!e||"object"!==n(e)&&"function"!=typeof e?c(t):e}function f(t){return(f=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function c(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function s(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&a(t,e)}function a(t,e){return(a=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function l(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var y=function(e){function n(){var t;return r(this,n),l(c(t=i(this,f(n).call(this))),"releaseA",function(){t.keys.a=!1}),l(c(t),"translateKeyboard",function(t){return"ArrowUp"==t?"up":"ArrowRight"==t?"right":"ArrowDown"==t?"down":"ArrowLeft"==t?"left":"a"==t||"A"==t?"a":"Shift"==t?"shift":""}),t.keys={up:!1,right:!1,down:!1,left:!1,a:!1,shift:!1},t}return s(n,t.default),u(n,[{key:"up",get:function(){return this.keys.up}},{key:"right",get:function(){return this.keys.right}},{key:"down",get:function(){return this.keys.down}},{key:"left",get:function(){return this.keys.left}},{key:"a",get:function(){return this.keys.a}},{key:"shift",get:function(){return this.keys.shift}}]),n}(),p=y;exports.default=p;
},{"~/engine/ControlBase":"iGVA"}],"2V93":[function(require,module,exports) {
"use strict";function t(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function e(t,e){for(var i=0;i<e.length;i++){var o=e[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(t,o.key,o)}}function i(t,i,o){return i&&e(t.prototype,i),o&&e(t,o),t}function o(t,e,i){return e in t?Object.defineProperty(t,e,{value:i,enumerable:!0,configurable:!0,writable:!0}):t[e]=i,t}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var r=function(){function e(i){var r=this;t(this,e),o(this,"collide",function(t,e){e.top&&"solid"==r.border.bottom&&(t.ay=r.y+t.height,t.speedY=1),e.bottom&&("solid"==r.border.top?(t.ay=r.y-t.height,t.speedY=0):"platform"==r.border.top&&t.speedY>0&&(t.ay=r.y-t.height,t.speedY=0)),e.right&&"solid"==r.border.horizontal&&t.speedX>0&&(t.border&&"elastic"==t.border.horizontal?t.speedX*=-1:(t.ax=r.x-t.width,t.speedX=0)),e.left&&"solid"==r.border.horizontal&&t.speedX<0&&(t.border&&"elastic"==t.border.horizontal?t.speedX*=-1:(t.ax=r.x+r.width,t.speedX=0))}),o(this,"collides",function(t){var e={top:!1,bottom:!1,left:!1,right:!1};return(t.ax+t.width/2).inRange(r.x-.25,r.x+r.width+1.25)&&((t.ay+t.height).inRange(r.y,r.y+r.height-1)&&t.ay<r.y?e.bottom=!0:t.ay.inRange(r.y,r.y+r.height)&&(e.top=!0)),(t.ay+t.height/2).inRange(r.y-.25,r.y+r.height+1.25)&&((t.ax+t.width).inRange(r.x,r.x+r.width)&&(e.right=!0),t.ax.inRange(r.x,r.x+r.width)&&(e.left=!0)),e}),this.tag=i,this.solid=this.tag.classList.contains("solid"),this.platform=this.tag.classList.contains("platform"),this.elastic=this.tag.classList.contains("elastic"),this.deadly=this.tag.classList.contains("deadly"),this.border={top:"solid",bottom:"solid",horizontal:"solid"},this.platform&&(this.border.top="platform",this.border.bottom=!1,this.border.horizontal=!1)}return i(e,[{key:"x",get:function(){return this.tag.offsetLeft},set:function(t){this.tag.style.left=t+"px"}},{key:"y",get:function(){return this.tag.offsetTop},set:function(t){this.tag.style.top=t+"px"}},{key:"width",get:function(){return this.tag.offsetWidth}},{key:"height",get:function(){return this.tag.offsetHeight}}]),e}();exports.default=r;
},{}],"8pWs":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=o(require("~/engine/Inject")),t=o(require("~/engine/Collidable"));function o(e){return e&&e.__esModule?e:{default:e}}function n(e){return(n="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function r(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function i(e,t){return!t||"object"!==n(t)&&"function"!=typeof t?c(e):t}function u(e){return(u=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function c(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function a(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&l(e,t)}function l(e,t){return(l=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}function f(e,t,o){return t in e?Object.defineProperty(e,t,{value:o,enumerable:!0,configurable:!0,writable:!0}):e[t]=o,e}var s=function(o){function n(t){var o;return r(this,n),f(c(o=i(this,u(n).call(this,t))),"collide",function(e,t){t.bottom&&(e.jump(),setTimeout(function(){o.tag.parentNode.removeChild(o.tag)},100)),(t.right||t.left)&&(e.speedX>.2?o.speedX+=o.velocity_x:e.speedX<-.2?o.speedX-=o.velocity_x:e.die())}),f(c(o),"update",function(){o.ax=o.x,o.ay=o.y,o.speedY+=e.default.scene.gravity,Math.abs(o.speedY)<.1&&(o.speedY=0),o.speedY>o.speed_limit_y&&(o.speedY=o.speed_limit_y),o.ax+=o.speedX,o.ay+=o.speedY,e.default.scene.sceneMap.forEach(function(e){var t=e.collides(c(o));e.collide(c(o),t)}),o.x=o.ax,o.y=o.ay}),o.ax=0,o.ay=0,o.speedX=0,o.speedY=0,o.velocity_x=1,o.speed_limit_x=10,o.friction=.8,o.updatable=!0,o.border.horizontal="elastic",o}return a(n,t.default),n}();exports.default=s;
},{"~/engine/Inject":"6dW9","~/engine/Collidable":"2V93"}],"MWGd":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("~/engine/Collidable"));function e(t){return t&&t.__esModule?t:{default:t}}function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){return!e||"object"!==o(e)&&"function"!=typeof e?i(t):e}function u(t){return(u=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function i(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function f(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&c(t,e)}function c(t,e){return(c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function l(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var a=function(e){function o(t){var e;return n(this,o),l(i(e=r(this,u(o).call(this,t))),"collide",function(t,o){o.bottom?(t.jump(),setTimeout(function(){e.tag.parentNode.removeChild(e.tag)},100)):(o.right||o.left)&&t.die()}),e.border={top:"solid",right:"deadly",bottom:"deadly",left:"deadly"},e}return f(o,t.default),o}();exports.default=a;
},{"~/engine/Collidable":"2V93"}],"3Rfk":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("~/engine/Collidable"));function e(t){return t&&t.__esModule?t:{default:t}}function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){return!e||"object"!==o(e)&&"function"!=typeof e?i(t):e}function u(t){return(u=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function i(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function f(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&c(t,e)}function c(t,e){return(c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}function l(t,e,o){return e in t?Object.defineProperty(t,e,{value:o,enumerable:!0,configurable:!0,writable:!0}):t[e]=o,t}var a=function(e){function o(t){var e;return n(this,o),l(i(e=r(this,u(o).call(this,t))),"collide",function(t,e){console.log("from")}),e}return f(o,t.default),o}();exports.default=a;
},{"~/engine/Collidable":"2V93"}],"E4Ko":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=n(require("./Collidable"));function n(e){return e&&e.__esModule?e:{default:e}}function r(e,n){if(!(e instanceof n))throw new TypeError("Cannot call a class as a function")}function t(e,n){for(var r=0;r<n.length;r++){var t=n[r];t.enumerable=t.enumerable||!1,t.configurable=!0,"value"in t&&(t.writable=!0),Object.defineProperty(e,t.key,t)}}function o(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}var u=function(){function n(){r(this,n)}return o(n,[{key:"from",value:function(n){return new e.default(n)}}]),n}();exports.default=u;
},{"./Collidable":"2V93"}],"+/ct":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=r(require("./Enemy/KoopaTroopaShell")),t=r(require("./Enemy/KoopaTroopa")),n=r(require("./Item/Question")),o=r(require("~/engine/CollidableFactoryBase"));function r(e){return e&&e.__esModule?e:{default:e}}function u(e){return(u="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function i(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}function f(e,t,n){return t&&c(e.prototype,t),n&&c(e,n),e}function l(e,t){return!t||"object"!==u(t)&&"function"!=typeof t?a(e):t}function a(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function s(e,t,n){return(s="undefined"!=typeof Reflect&&Reflect.get?Reflect.get:function(e,t,n){var o=p(e,t);if(o){var r=Object.getOwnPropertyDescriptor(o,t);return r.get?r.get.call(n):r.value}})(e,t,n||e)}function p(e,t){for(;!Object.prototype.hasOwnProperty.call(e,t)&&null!==(e=y(e)););return e}function y(e){return(y=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function b(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&d(e,t)}function d(e,t){return(d=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var h=function(r){function u(){return i(this,u),l(this,y(u).call(this))}return b(u,o.default),f(u,[{key:"from",value:function(o){return o.classList.contains("TurtleShell")?new e.default(o):o.classList.contains("Turtle")?new t.default(o):o.classList.contains("Question")?new n.default(o):s(y(u.prototype),"from",this).call(this,o)}}]),u}();exports.default=h;
},{"./Enemy/KoopaTroopaShell":"8pWs","./Enemy/KoopaTroopa":"MWGd","./Item/Question":"3Rfk","~/engine/CollidableFactoryBase":"E4Ko"}],"+ODI":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("./Inject"));function e(t){return t&&t.__esModule?t:{default:t}}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function i(t,e){for(var n=0;n<e.length;n++){var i=e[n];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function o(t,e,n){return e&&i(t.prototype,e),n&&i(t,n),t}function a(t,e,n){return e in t?Object.defineProperty(t,e,{value:n,enumerable:!0,configurable:!0,writable:!0}):t[e]=n,t}var r=function(){function e(){var i=this;n(this,e),a(this,"getCollisionMapVisible",function(){var e=[];return i.collisionMap.forEach(function(n){n.x>Math.abs(i.x)-30&&n.x<Math.abs(i.x)+t.default.stage.width+30&&e.push(n)}),console.log(e),console.log(Math.abs(i.x),Math.abs(i.x)+t.default.stage.width),e}),this.tag=document.querySelector(".Scene"),this.gravity=3,this.line_to_scroll=128,this._scroll_x=0,this.scroll_x_start=0,this.collisionMap=[],this.updatableMap=[],this.sceneMap=[],document.querySelectorAll(".Collidable").forEach(function(e){e=t.default.collidableFactory.from(e),i.collisionMap.push(e),e.updatable&&i.updatableMap.push(e),(e.solid||e.platform)&&i.sceneMap.push(e)})}return o(e,[{key:"updatableMapVisible",get:function(){return[]}},{key:"scroll_x",get:function(){return this._scroll_x},set:function(t){this.x=-t,this._scroll_x=t}},{key:"width",get:function(){return this.tag.clientWidth}},{key:"height",get:function(){return this.tag.clientHeight}},{key:"x",get:function(){return this.tag.offsetLeft},set:function(t){(t=parseInt(t))!=this.x&&(this.tag.style.left=t+"px")}},{key:"y",get:function(){return this.tag.offsetTop},set:function(t){(t=parseInt(t))!=this.y&&(this.tag.style.top=t+"px")}}]),e}(),l=r;exports.default=l;
},{"./Inject":"6dW9"}],"c9Gh":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=e(require("~/engine/SceneBase"));function e(t){return t&&t.__esModule?t:{default:t}}function o(t){return(o="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}function n(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function r(t,e){return!e||"object"!==o(e)&&"function"!=typeof e?u(t):e}function u(t){if(void 0===t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return t}function i(t){return(i=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)})(t)}function f(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function");t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,writable:!0,configurable:!0}}),e&&c(t,e)}function c(t,e){return(c=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t})(t,e)}var l=function(e){function o(){return n(this,o),r(this,i(o).call(this))}return f(o,t.default),o}(),s=l;exports.default=s;
},{"~/engine/SceneBase":"+ODI"}],"MAyu":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=i(require("~/engine/Inject")),t=i(require("~/engine/Game")),o=i(require("./Mario")),n=i(require("./Control")),r=i(require("./CollidableFactory")),u=i(require("./Stage/YoshisIsland2"));function i(e){return e&&e.__esModule?e:{default:e}}function f(e){return(f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}function l(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function c(e,t){return!t||"object"!==f(t)&&"function"!=typeof t?s(e):t}function a(e){return(a=Object.setPrototypeOf?Object.getPrototypeOf:function(e){return e.__proto__||Object.getPrototypeOf(e)})(e)}function s(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function p(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,writable:!0,configurable:!0}}),t&&y(e,t)}function y(e,t){return(y=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e})(e,t)}var d=function(i){function f(){var t;return l(this,f),t=c(this,a(f).call(this)),e.default.puppet=new o.default,e.default.collidableFactory=new r.default,e.default.scene=new u.default,e.default.control=new n.default,e.default.game=s(t),t}return p(f,t.default),f}(),b=new d;exports.default=b;
},{"~/engine/Inject":"6dW9","~/engine/Game":"deFs","./Mario":"O2r9","./Control":"xqQZ","./CollidableFactory":"+/ct","./Stage/YoshisIsland2":"c9Gh"}],"Focm":[function(require,module,exports) {
"use strict";var e=r(require("./mario/src/SuperMarioWorld"));function r(e){return e&&e.__esModule?e:{default:e}}e.default.play(),document.querySelector(".Stage").addEventListener("click",function(){});
},{"./mario/src/SuperMarioWorld":"MAyu"}]},{},["Focm"], null)
//# sourceMappingURL=/html-game-engine/engine.a58b6f93.js.map