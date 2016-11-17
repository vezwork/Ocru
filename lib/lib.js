//kid friendly game dev ui on top of:
//language on top of:
//game control system on top of:
//canvas

//easy to use networking support?
//web sockets or webRTC

//maybe more audio manipulation

//GOALS:
//extensible
//modular
//each piece is useful at it's place in the usage hierarchy
//simple to use, but with all the functionality needed
//minimally restrictive
//distributed complexity

//TODO:
//MACRO:
//unit testing
//babel + uglify es5 builds

//FUTURE:
//some sort of groups
//tiling sprite drawable
//css backgrounds on scenes maybe
//spritesheet animations
//animation timelining
//view attached drawables (ui elements)

//HIGH PRIORITY OVERARCHING:
//framerate capping/locking

//DOABLE:
//scene background color i.e. custom clear color
//touch input support
//tilt input
//view blend modes
//mouse cursor swapping i.e. INPUT.setCursor(img)
//draw smoothing on/off i.e. VIEW.smooth
//only render inside the canvas / camera i.e. using DRAWABLE.MAX SIZE GET
//primitive drawable i.e. (square, circle, line, polygon etc)

"use strict";

//Drawable interface

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Drawable = function () {
    function Drawable() {
        _classCallCheck(this, Drawable);
    }

    _createClass(Drawable, [{
        key: 'draw',
        value: function draw(ctx, viewCtx) {}
    }]);

    return Drawable;
}();

var rectangle = function (_Drawable) {
    _inherits(rectangle, _Drawable);

    function rectangle() {
        var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
        var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var rot = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var width = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var height = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var color = arguments[5];
        var opacity = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;

        _classCallCheck(this, rectangle);

        var _this = _possibleConstructorReturn(this, (rectangle.__proto__ || Object.getPrototypeOf(rectangle)).call(this));

        _this.x = x | 0;
        _this.y = y | 0;
        _this.rot = +rot;
        _this.width = width | 0;
        _this.height = height | 0;
        _this.color = color + '';
        _this.opacity = +opacity;
        return _this;
    }

    _createClass(rectangle, [{
        key: 'draw',
        value: function draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            if (this.color) ctx.fillStyle = this.color;

            var centerOffsetWidth = this.x + this.width / 2 | 0;
            var centerOffsetHeight = this.y + this.height / 2 | 0;

            ctx.translate(centerOffsetWidth, centerOffsetHeight);
            ctx.rotate(this.rot);
            ctx.translate(-centerOffsetWidth, -centerOffsetHeight);

            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.restore();
        }
    }]);

    return rectangle;
}(Drawable);

var simpleText = function (_Drawable2) {
    _inherits(simpleText, _Drawable2);

    function simpleText() {
        var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var rot = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var font = arguments[4];
        var color = arguments[5];
        var opacity = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;

        _classCallCheck(this, simpleText);

        var _this2 = _possibleConstructorReturn(this, (simpleText.__proto__ || Object.getPrototypeOf(simpleText)).call(this));

        _this2.text = text + '';
        _this2.x = x | 0;
        _this2.y = y | 0;
        _this2.rot = +rot;
        _this2.font = font + '';
        _this2.color = color + '';
        _this2.opacity = +opacity;
        return _this2;
    }

    _createClass(simpleText, [{
        key: 'draw',
        value: function draw(ctx) {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            if (this.font) ctx.font = this.font;
            if (this.color) ctx.fillStyle = this.color;
            ctx.textBaseline = "top";

            var centerOffsetWidth = this.x | 0;
            var centerOffsetHeight = this.y | 0;

            ctx.translate(centerOffsetWidth, centerOffsetHeight);
            ctx.rotate(this.rot);
            ctx.translate(-centerOffsetWidth, -centerOffsetHeight);

            ctx.fillText(this.text, this.x, this.y);
            ctx.restore();
        }
    }]);

    return simpleText;
}(Drawable);

var Sprite = function (_Drawable3) {
    _inherits(Sprite, _Drawable3);

    function Sprite(image) {
        var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var y = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var rot = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var width = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var height = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
        var subimage = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 0;
        var mirrorX = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : false;
        var mirrorY = arguments.length > 8 && arguments[8] !== undefined ? arguments[8] : false;
        var opacity = arguments.length > 9 && arguments[9] !== undefined ? arguments[9] : 1;

        _classCallCheck(this, Sprite);

        var _this3 = _possibleConstructorReturn(this, (Sprite.__proto__ || Object.getPrototypeOf(Sprite)).call(this));

        if (image instanceof Image) {
            if (image.naturalHeight == 0) throw new TypeError("ParameterError: image is an Image but has no source or hasn't loaded yet!");
            _this3.image = image;

            _this3.height = height | 0 || _this3.image.naturalHeight;
            _this3.width = width | 0 || _this3.image.naturalWidth;

            _this3.draw = function (ctx) {
                var centerOffsetWidth = this.x + this.width / 2 | 0;
                var centerOffsetHeight = this.y + this.height / 2 | 0;

                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.translate(centerOffsetWidth, centerOffsetHeight);
                ctx.rotate(this.rot);
                if (this.mirrorX && this.mirrorY) ctx.scale(-1, -1);else if (this.mirrorX) ctx.scale(-1, 1);else if (this.mirrorY) ctx.scale(1, -1);
                ctx.translate(-centerOffsetWidth, -centerOffsetHeight);
                ctx.drawImage(this.image, this.x | 0, this.y | 0, this.width | 0, this.height | 0);
                ctx.restore();
            };
        } else if (image instanceof SpriteSheet) {
            _this3.spriteSheet = image;
            _this3.subimage = subimage | 0;

            _this3.height = height | 0 || _this3.spriteSheet.subimageHeight;
            _this3.width = width | 0 || _this3.spriteSheet.subimageWidth;

            _this3.draw = function (ctx) {
                //draw a SpriteSheet
                var centerOffsetWidth = this.x + this.width / 2 | 0;
                var centerOffsetHeight = this.y + this.height / 2 | 0;

                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.translate(centerOffsetWidth, centerOffsetHeight);
                ctx.rotate(this.rot);
                if (this.mirrorX && this.mirrorY) ctx.scale(-1, -1);else if (this.mirrorX) ctx.scale(-1, 1);else if (this.mirrorY) ctx.scale(1, -1);
                ctx.translate(-centerOffsetWidth, -centerOffsetHeight);

                ctx.drawImage(this.spriteSheet.image, this.spriteSheet.getFrameX(this.subimage) | 0, this.spriteSheet.getFrameY(this.subimage) | 0, this.spriteSheet.subimageWidth | 0, this.spriteSheet.subimageHeight | 0, this.x | 0, this.y | 0, this.width | 0, this.height | 0);
                ctx.restore();
            };
        } else {
            throw new TypeError("ParameterError: image must be an Image or SpriteSheet object!");
        }

        _this3.x = x | 0;
        _this3.y = y | 0;
        _this3.rot = +rot;
        _this3.mirrorX = !!mirrorX;
        _this3.mirrorY = !!mirrorY;
        _this3.opacity = +opacity;
        return _this3;
    }

    return Sprite;
}(Drawable);

//only supports spritesheets with subimages right next to eachother as of now


var SpriteSheet = function () {
    function SpriteSheet(image, subimageWidth, subimageHeight, subimageCount) {
        _classCallCheck(this, SpriteSheet);

        if (!(image instanceof Image)) throw new TypeError("ParameterError: image must be an Image or SpriteSheet object!");
        if (!subimageHeight) throw new TypeError("ParameterError: subimageHeight required!");
        if (!subimageWidth) throw new TypeError("ParameterError: subimageWidth required!");
        if (image.naturalHeight == 0) throw new TypeError("ParameterError: image is an Image but has no source or hasn't loaded yet!");

        this.image = image;
        this.subimageHeight = subimageHeight | 0;
        this.subimageWidth = subimageWidth | 0;

        this._imagesPerRow = image.naturalWidth / subimageWidth | 0;
        this._imagesPerColumn = image.naturalHeight / subimageHeight | 0;
        //this.subimageCount = subimageCount|0 || this._imagesPerColumn * this._imagesPerRow
    }

    _createClass(SpriteSheet, [{
        key: 'getFrameX',
        value: function getFrameX(subimage) {
            return subimage % this._imagesPerRow % this._imagesPerRow * this.subimageWidth;
        }
    }, {
        key: 'getFrameY',
        value: function getFrameY(subimage) {

            return (subimage / this._imagesPerRow | 0) % this._imagesPerColumn * this.subimageHeight;
        }
    }]);

    return SpriteSheet;
}();

var View = function () {
    function View() {
        _classCallCheck(this, View);
    }

    _createClass(View, [{
        key: 'drawView',
        value: function drawView(ctx, drawables) {}
    }]);

    return View;
}();
//View
//  maintains viewport state, draws Drawable arrays based upon state, can pass viewContext to Drawables (i.e. 3d drawables need view context), interacts with ctx,
//  has viewStart and viewEnd callbacks


var SimpleView = function (_View) {
    _inherits(SimpleView, _View);

    //skewing is also possible, but not implemented in this version of view
    //TODO: A version of View with this signature: constructor(dwidth=100, dheight=100, dx=0, dy=0, drot=0, sx=0, sy=0, zoomX=1, zoomY=1, srot=0)
    function SimpleView() {
        var dwidth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 100;
        var dheight = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 100;
        var dx = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
        var dy = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
        var sx = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 0;
        var sy = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;
        var zoomX = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : 1;
        var zoomY = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : 1;

        _classCallCheck(this, SimpleView);

        var _this4 = _possibleConstructorReturn(this, (SimpleView.__proto__ || Object.getPrototypeOf(SimpleView)).call(this));

        _this4.dwidth = dwidth | 0;
        _this4.dheight = dheight | 0;
        _this4.dx = dx | 0;
        _this4.dy = dy | 0;

        _this4.sx = sx | 0;
        _this4.sy = sy | 0;

        _this4.zoomX = +zoomX;
        _this4.zoomY = +zoomY;
        return _this4;
    }

    _createClass(SimpleView, [{
        key: 'drawView',
        value: function drawView(ctx, drawables) {
            //TODO: if sprite outside boundaries, don't draw it, consider zoom&rotation of view and rotation of sprite
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            ctx.save();
            //perform zoom and translation
            ctx.setTransform(this.zoomX, 0, 0, this.zoomY, (this.dx - this.sx) * this.zoomX - this.dx | 0, (this.dy - this.sy) * this.zoomY - this.dy | 0);

            for (var i = 0; i < drawables.length; i++) {
                drawables[i].draw(ctx);
            }ctx.restore();

            ctx.clearRect(this.dx, 0, ctx.canvas.width, this.dy);
            ctx.clearRect(this.dx + this.dwidth, this.dy, ctx.canvas.width, ctx.canvas.height);
            ctx.clearRect(0, this.dy + this.dheight, this.dx + this.dwidth, ctx.canvas.height);
            ctx.clearRect(0, 0, this.dx, this.dy + this.dheight);
        }
    }]);

    return SimpleView;
}(View);

var SceneManager = function () {
    function SceneManager(canvas) {
        _classCallCheck(this, SceneManager);

        if (!canvas) throw new TypeError("Parametererror: canvas required!");

        this.canvas = canvas;
        this.ctxt = canvas.getContext("2d");
    }

    _createClass(SceneManager, [{
        key: 'play',
        value: function play(scene) {
            if (!scene) throw new TypeError("Parametererror: scene required!");

            this.scene = scene;
            scene.setSize(this.canvas.width, this.canvas.height);
            if (scene.play) scene.play();

            if (!this._running) {
                this._running = true;
                this._loop();
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (scene.stop) scene.stop();

            this._running = false;
        }
    }, {
        key: '_loop',
        value: function _loop() {
            if (this._running) window.requestAnimationFrame(this._loop.bind(this));

            this.scene.drawScene(this.ctxt);
        }
    }]);

    return SceneManager;
}();

//Scene
//  manages Drawables and Views, controls view activation order, virtual canvas layering, sprite depth, other sprite meta information, has one default view


var Scene = function () {
    function Scene(hooks, width, height) {
        _classCallCheck(this, Scene);

        if (!hooks) throw new TypeError("Parametererror: hooks required!");

        this._osCanvas = document.createElement("canvas");
        this._osCanvas.width = width || 100;
        this._osCanvas.height = height || 100;
        this._osCtx = this._osCanvas.getContext("2d");

        //this.osCtx.imageSmoothingEnabled = false

        this._drawableHash = {};
        this._drawableArr = [];

        this._viewHash = {};
        this._viewArr = [];

        //main hooks
        if (hooks.create) {
            this.play = function () {
                hooks.create.bind(this)();
                if (hooks.play) hooks.play.bind(this)();
                this.play = hooks.play;
            };
        } else {
            this.play = hooks.play;
        }

        this.renderStart = hooks.renderStart || hooks.render;
        this.renderEnd = hooks.renderEnd;

        this.stop = hooks.stop;

        this.default_view = new SimpleView(this._osCanvas.width, this._osCanvas.height);
        this.addView(this.default_view);
    }

    _createClass(Scene, [{
        key: 'setSize',
        value: function setSize(width, height) {
            this._osCanvas.width = width || 100;
            this._osCanvas.height = height || 100;
            if (this.default_view) {
                this.default_view.dwidth = width || 100;
                this.default_view.dheight = height || 100;
            }
        }
    }, {
        key: 'drawScene',
        value: function drawScene(ctx) {
            if (this.renderStart) this.renderStart();

            ctx.clearRect(0, 0, this._osCanvas.width, this._osCanvas.height);
            for (var i = 0; i < this._viewArr.length; i++) {
                this._osCtx.clearRect(0, 0, this._osCanvas.width, this._osCanvas.height);
                this._viewArr[i].drawView(this._osCtx, this._drawableArr);
                //potential optimization on this line:
                ctx.drawImage(this._osCanvas, 0, 0);
            }

            if (this.renderEnd) this.renderEnd();
        }

        //view actions

    }, {
        key: 'addView',
        value: function addView(view) {
            var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (!view) throw new TypeError("Parametererror: view required!");
            if (!(view instanceof View)) throw new TypeError("Parametererror: view must be an instance of View!");

            view._rl_depth = depth;
            //insert into array at proper position
            this._spliceIntoOrder(view, this._viewArr);

            //add the ability to delete this view
            view.remove = function () {
                this.removeView(view);
            }.bind(this);

            //add depth setter and getter to view for ease of use
            Object.defineProperty(view, 'depth', {
                get: function get() {
                    return this._rl_depth;
                },
                set: function (newValue) {
                    this.setViewDepth(view, newValue);
                }.bind(this),
                enumerable: true,
                configurable: true
            });

            return view;
        }
    }, {
        key: 'removeView',
        value: function removeView(view) {
            //remove from array
            this._viewArr.splice(view._rl_index, 1);
            //clean and remove from hash
            delete view.depth;
            delete view.remove;
            delete view._rl_depth;
            delete view._rl_index;
        }
    }, {
        key: 'setViewDepth',
        value: function setViewDepth() {
            var depth = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;

            //remove from array
            this._viewArr.splice(view._rl_index, 1);
            view._rl_depth = depth;
            //reinsert
            this._spliceIntoOrder(view, this._viewArr);
        }
    }, {
        key: 'getViewDepth',
        value: function getViewDepth(name) {
            return view._rl_depth;
        }

        //drawable actions

    }, {
        key: 'addDrawable',
        value: function addDrawable(drawable) {
            var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            if (!drawable) throw new TypeError("Parametererror: drawable required!");
            if (!(drawable instanceof Drawable)) throw new TypeError("Parametererror: drawable must be an instance of Drawable!");

            drawable._rl_depth = depth;
            //insert into array at proper position
            this._spliceIntoOrder(drawable, this._drawableArr);

            //add the ability to delete this drawable
            drawable.remove = function () {
                this.removeDrawable(drawable);
            }.bind(this);

            //add depth setter and getter to drawable for ease of use
            Object.defineProperty(drawable, 'depth', {
                get: function get() {
                    return this._rl_depth;
                },
                set: function (newValue) {
                    this.setDrawableDepth(drawable, newValue);
                }.bind(this),
                enumerable: true,
                configurable: true
            });

            return drawable;
        }
    }, {
        key: 'removeDrawable',
        value: function removeDrawable(drawable) {
            //remove from array
            this._drawableArr.splice(drawable._rl_index, 1);
            //clean and remove from hash
            delete drawable.depth;
            delete drawable.remove;
            delete drawable._rl_depth;
            delete drawable._rl_index;
        }
    }, {
        key: 'setDrawableDepth',
        value: function setDrawableDepth(drawable) {
            var depth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

            //remove from array
            this._drawableArr.splice(drawable._rl_index, 1);
            drawable._rl_depth = depth;
            //reinsert
            this._spliceIntoOrder(drawable, this._drawableArr);
        }
    }, {
        key: 'getDrawableDepth',
        value: function getDrawableDepth(name) {
            return drawable._rl_depth;
        }
    }, {
        key: '_spliceIntoOrder',
        value: function _spliceIntoOrder(object, arr) {
            var low = 0,
                high = arr.length;

            while (low < high) {
                var mid = low + high >>> 1;
                if (arr[mid]._rl_depth < object._rl_depth) low = mid + 1;else high = mid;
            }

            object._rl_index = low;
            arr.splice(low, 0, object);
            //update index counter of sprites being pushed up by insertion
            for (var i = low + 1; i < arr.length; i++) {
                arr[i]._rl_index++;
            }
        }
    }]);

    return Scene;
}();

var SceneWithLoader = function (_Scene) {
    _inherits(SceneWithLoader, _Scene);

    function SceneWithLoader(hooks, width, height) {
        _classCallCheck(this, SceneWithLoader);

        var create = hooks.create;
        var renderStart = hooks.renderStart || hooks.render;
        var renderEnd = hooks.renderEnd;
        hooks.renderStart = hooks.loadRenderStart || hooks.loadRender;
        hooks.renderEnd = hooks.loadRenderEnd;

        hooks.create = function () {
            hooks.preload.bind(_this5)();
            _this5.load.start();
        };

        var _this5 = _possibleConstructorReturn(this, (SceneWithLoader.__proto__ || Object.getPrototypeOf(SceneWithLoader)).call(this, hooks, width, height));

        _this5.load = new MediaLoader();
        _this5.load.onComplete(function () {
            _this5.renderStart = renderStart;
            _this5.renderEnd = renderEnd;
            create.bind(_this5)();
        });
        return _this5;
    }

    return SceneWithLoader;
}(Scene);

//IDEA: use es6 proxies to make a LazyRenderer class (useful for performance on things with a low change rate)
//IDEA: make a ControlledRenderer class that only renders when told to

var RenderLoop = function () {
    function RenderLoop(scene, ctxt) {
        _classCallCheck(this, RenderLoop);

        if (!scene) throw new TypeError("Parametererror: scene required!");
        if (!(scene instanceof Scene)) throw new TypeError("ParameterError: scene must be an Scene object!");

        if (!ctxt) throw new TypeError("Parametererror: ctxt required!");
        if (!(ctxt instanceof CanvasRenderingContext2D)) throw new TypeError("ParameterError: ctxt must be an CanvasRenderingContext2D object!");

        this.scene = scene;
        this.ctxt = ctxt;

        this.onDrawStart = function () {};
        this.onDrawEnd = function () {};

        this.start();
    }

    _createClass(RenderLoop, [{
        key: 'start',
        value: function start() {
            if (!this._running) {
                this._running = true;
                this._loop();
            } else {
                throw new Error("RenderLoop instance was asked to start while running");
            }
        }
    }, {
        key: 'stop',
        value: function stop() {
            if (this._running) {
                this._running = false;
            } else {
                throw new Error("RenderLoop instance was asked to stop while stopped");
            }
        }
    }, {
        key: '_loop',
        value: function _loop() {
            this.onDrawStart();

            this.scene.drawScene(this.ctxt);

            this.onDrawEnd();
            if (this._running) window.requestAnimationFrame(this._loop.bind(this));
        }
    }]);

    return RenderLoop;
}();

//add longest frame delay for this second


var DebugRenderLoop = function (_RenderLoop) {
    _inherits(DebugRenderLoop, _RenderLoop);

    function DebugRenderLoop(scene, ctxt) {
        _classCallCheck(this, DebugRenderLoop);

        var _this6 = _possibleConstructorReturn(this, (DebugRenderLoop.__proto__ || Object.getPrototypeOf(DebugRenderLoop)).call(this, scene, ctxt));

        _this6._debug = {};
        _this6._debug.lastSecond = window.performance.now();
        _this6._debug.framesThisSecond = 0;
        _this6._debug.text = _this6.scene.addDrawable(new simpleText("FPS: calculating...", 10, 10, 0), 1000);
        return _this6;
    }

    _createClass(DebugRenderLoop, [{
        key: '_loop',
        value: function _loop() {
            _get(DebugRenderLoop.prototype.__proto__ || Object.getPrototypeOf(DebugRenderLoop.prototype), '_loop', this).call(this);
            if (this._debug) {
                this._debug.framesThisSecond++;
                if (window.performance.now() > this._debug.lastSecond + 1000) {
                    this._debug.text.text = "FPS: " + this._debug.framesThisSecond;
                    this._debug.lastSecond = window.performance.now();
                    this._debug.framesThisSecond = 0;
                }
            }
        }
    }]);

    return DebugRenderLoop;
}(RenderLoop);

var MediaLoader = function () {
    function MediaLoader() {
        _classCallCheck(this, MediaLoader);

        this.total = 0;
        this.progress = 0;

        this._loadArr = [];

        this._progressEvents = [];
        this._completeEvents = [];
    }

    _createClass(MediaLoader, [{
        key: 'onProgress',
        value: function onProgress(func) {
            if (!func) throw new TypeError("ParameterError: func callback required!");
            this._progressEvents.push(func);
        }
    }, {
        key: 'onComplete',
        value: function onComplete(func) {
            if (!func) throw new TypeError("ParameterError: func callback required!");
            this._completeEvents.push(func);
        }
    }, {
        key: 'image',
        value: function image(src) {
            this.total++;
            var temp = new Image();
            this._loadArr.push({ obj: temp, src: src });

            temp.onload = function () {
                var _this7 = this;

                this.progress++;
                if (this.progress == this.total) this._completeEvents.forEach(function (f) {
                    return f();
                });else this._progressEvents.forEach(function (f) {
                    return f(_this7.progress, _this7.total);
                });
            }.bind(this);

            temp.onerror = function () {
                throw new Error("Error loading image: " + src);
            };

            return temp;
        }
    }, {
        key: 'audio',
        value: function audio(src) {
            this.total++;
            var temp = new Audio();
            temp.preload = 'auto';
            this._loadArr.push({ obj: temp, src: src });

            temp.oncanplaythrough = function () {
                var _this8 = this;

                this.progress++;
                temp.oncanplaythrough = null;
                if (this.progress == this.total) this._completeEvents.forEach(function (f) {
                    return f();
                });else this._progressEvents.forEach(function (f) {
                    return f(_this8.progress, _this8.total);
                });
            }.bind(this);

            temp.onerror = function () {
                throw new Error("Error loading audio: " + src);
            };

            return temp;
        }
    }, {
        key: 'start',
        value: function start() {
            if (this.total == 0) this._completeEvents.forEach(function (f) {
                return f();
            });

            this._loadArr.forEach(function (e) {
                e.obj.src = e.src;
            });
        }
    }]);

    return MediaLoader;
}();

var Input = function () {
    function Input() {
        var _this9 = this;

        var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : document;

        _classCallCheck(this, Input);

        if (!(el instanceof HTMLElement || el instanceof HTMLDocument)) throw new TypeError("ParameterError: el must be a valid HTML element!");

        //allow this element to be focused
        if (el.tabIndex == -1) el.tabIndex = 1;
        //input state
        this.keysDown = {};
        this.buttonsDown = {};
        this.mousePos = { x: 0, y: 0 };

        //callback registry
        this._mouseEvents = {
            down: [],
            up: [],
            move: []
        };

        this._keyEvents = {
            down: [],
            up: []
        };
        //IDEAs:
        //gamepad
        //touch vs mouse (perhaps gestures too)
        //tilt

        //disable the context menu
        el.oncontextmenu = function (e) {
            return e.preventDefault();
        };
        //add callbacks
        el.onmousedown = function (e) {
            e.preventDefault();
            e.target.focus();
            _this9.buttonsDown[e.button] = true;
            _this9._mouseEvents.down.forEach(function (o) {
                if (o.button != undefined) {
                    if (o.button == e.button) o.func(e.button);
                } else o.func(e.button);
            });
        };
        el.onmouseup = function (e) {
            e.preventDefault();
            e.target.focus();
            _this9.buttonsDown[e.button] = false;
            _this9._mouseEvents.up.forEach(function (o) {
                if (o.button != undefined) {
                    if (o.button == e.button) o.func(e.button);
                } else o.func(e.button);
            });
        };
        el.onmousemove = function (e) {
            _this9._mouseEvents.move.forEach(function (o) {
                return o.func();
            });

            var _canvas$getBoundingCl = canvas.getBoundingClientRect(),
                left = _canvas$getBoundingCl.left,
                top = _canvas$getBoundingCl.top;

            _this9.mousePos.x = e.clientX - left;
            _this9.mousePos.y = e.clientY - top;
        };

        el.onkeydown = function (e) {
            if (!_this9.keysDown[e.key.toLowerCase()]) {
                e.preventDefault();
                _this9.keysDown[e.key.toLowerCase()] = true;
                _this9._keyEvents.down.forEach(function (o) {
                    if (o.key) {
                        if (o.key == e.key.toLowerCase()) o.func(e.key);
                    } else o.func(e.key);
                });
            }
        };
        el.onkeyup = function (e) {
            e.preventDefault();
            _this9.keysDown[e.key.toLowerCase()] = false;
            _this9._keyEvents.up.forEach(function (o) {
                if (o.key) {
                    if (o.key == e.key.toLowerCase()) o.func(e.key);
                } else o.func(e.key);
            });
        };
    }

    _createClass(Input, [{
        key: 'onMouse',
        value: function onMouse(eventName, func, button) {
            if (!eventName) throw new TypeError("ParameterError: eventName required!");
            if (!func) throw new TypeError("ParameterError: func callback required!");
            if (!this._mouseEvents[eventName]) throw new Error(eventName + " is not a valid event!");
            if (typeof button == 'string') button = this._stringToMouseCode(button);

            this._mouseEvents[eventName].push({ func: func, button: button });
        }
    }, {
        key: 'onKey',
        value: function onKey(eventName, func, key) {
            if (!eventName) throw new TypeError("ParameterError: eventName required!");
            if (!func) throw new TypeError("ParameterError: func callback required!");
            if (!this._keyEvents[eventName]) throw new Error(eventName + " is not a valid event!");

            this._keyEvents[eventName].push({ func: func, key: key ? key.toLowerCase() : undefined });
        }
    }, {
        key: 'checkKey',
        value: function checkKey(key) {
            return this.keysDown[key.toLowerCase()] ? true : false;
        }
    }, {
        key: 'checkButton',
        value: function checkButton(button) {
            if (typeof button == 'string') button = this._stringToMouseCode(button);

            return this.buttonsDown[button] ? true : false;
        }
    }, {
        key: '_stringToMouseCode',
        value: function _stringToMouseCode(str) {
            switch (str.toLowerCase()) {
                case 'left':
                    return 0;
                case 'middle':
                    return 1;
                case 'right':
                    return 2;
            }
        }
    }]);

    return Input;
}();