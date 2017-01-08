//GOALS:
//extensible
//modular
//each piece is useful at it's place in the usage hierarchy
//simple to use, but with all the functionality needed
//minimally restrictive
//distributed complexity

//TODO:
    //big-picture:
        //unit testing
        //docs
        //promo
        //...
        //last: optimization
    
    //FUTURE:
        //spritesheet animations
        //animation timelining
        //view attached drawables (ui elements)

    //DOABLE:
        //tiling sprite drawable, multiline text
        //extend pressed/released input to touch
        //clean up input (can be reduced to like half the code and more readable)
        //test touch and tilt on a real device
        //test Group and Layer more extensively

"use strict"

//Game class mixin
function EventDrawable(Base) {
    if (!(Base.prototype instanceof Drawable))
        throw new TypeError("Base must inherit from Drawable")
    
    return class extends Base {
        constructor() {
            super(...arguments)
            if (this.onCreate) this.onCreate()
            
            if (this.onDraw) {
                const temp = this.draw
                this.draw = function(...args) {
                    this.onDraw()
                    temp.bind(this)(...args)
                }
            }
        }
    }
}

//Drawable interface
class Drawable {
    constructor(x=0, y=0, width=0, height=0, rot=0, opacity=1, blendmode='source-over') {
        this.x = x|0
        this.y = y|0
        this.width = width|0
        this.height = height|0
        this.rot = +rot
        this.opacity = +opacity
        
        this.scaleX = 1
        this.scaleY = 1
        
        this.blendmode = blendmode+''
        
        this.origin = { x: undefined, y: undefined }
    }
    prepare(ctx) {
        //handle opacity
        ctx.globalAlpha = this.opacity
        ctx.globalCompositeOperation = this.blendmode
        
        const centerOffsetWidth  = this.x + ((this.origin.x !== undefined)? this.origin.x : this.width/2)|0
        const centerOffsetHeight = this.y + ((this.origin.y !== undefined)? this.origin.y : this.height/2)|0
        
        //scaling
        ctx.translate(centerOffsetWidth, centerOffsetHeight)
        //rotation
        ctx.rotate(this.rot)
        ctx.scale(this.scaleX,this.scaleY)
        ctx.translate(-centerOffsetWidth, -centerOffsetHeight)
        //the subclass must handle using x,y,width,height and must restore the ctx
    }
}

class Rectangle extends Drawable {
    constructor(x, y, width, height, rot, opacity, color='black') {
        super(x, y, width, height, rot, opacity)
        this.color = color+''
    }
    
    draw(ctx) {
        ctx.save()
        super.prepare(ctx)
        ctx.fillStyle = this.color
        
        ctx.fillRect(this.x|0,this.y|0,this.width|0,this.height|0)
        ctx.restore()
    }
}

class SimpleText extends Drawable {
    constructor(text='', x, y, width=100000, height=14, color='#000', font='arial', rot, opacity) {
        super(x, y, width, height, rot, opacity)
        
        this.text = text+''
        this.font = font+''
        this.color = color+''
    }
    
    draw(ctx) {
        ctx.save()
        super.prepare(ctx)
        
        ctx.font = this.height + "px " + this.font
        ctx.fillStyle = this.color
        
        ctx.textBaseline = "top"
        ctx.fillText(this.text, this.x, this.y, this.width)
        ctx.restore()
    }
} 

class Sprite extends Drawable {
    constructor(image, x, y, width, height, rot, opacity) {
        
        if (image instanceof Image) {
            if (image.naturalHeight == 0)
                throw new TypeError("ParameterError: image is an Image but has no source or hasn't loaded yet!")
            
            super(x, y, width || image.naturalWidth, height || image.naturalHeight, rot, opacity)
            
            this.image = image
            this.draw = this._imageDraw
            
        } else if (image instanceof Sprite.Sheet) {
            
            super(x, y, width || image.subimageWidth, height || image.subimageHeight, rot, opacity)
            
            this.spriteSheet = image
            this.subimage = 0
            this.draw = this._sheetDraw
            
        } else {
            throw new TypeError("ParameterError: image must be an Image or SpriteSheet object!")
        }
    }
    
    _imageDraw(ctx) {
        ctx.save()
        super.prepare(ctx)
        ctx.drawImage(this.image, this.x|0, this.y|0, this.width|0, this.height|0)
        ctx.restore()
    }
    
    _sheetDraw(ctx) { //draw a SpriteSheet
        ctx.save()
        super.prepare(ctx)
        ctx.drawImage(this.spriteSheet.image, 
                      this.spriteSheet.getFrameX(this.subimage)|0, 
                      this.spriteSheet.getFrameY(this.subimage)|0, 
                      this.spriteSheet.subimageWidth|0,
                      this.spriteSheet.subimageHeight|0,
                      this.x|0, 
                      this.y|0, 
                      this.width|0, 
                      this.height|0
                     )
        ctx.restore()
    }
}

Sprite.Sheet = class {
    constructor(image, subimageWidth, subimageHeight, subimageCount) {
    
        if (!(image instanceof Image)) 
            throw new TypeError("ParameterError: image must be an Image or SpriteSheet object!")
        if (!subimageHeight) 
            throw new TypeError("ParameterError: subimageHeight required!")
        if (!subimageWidth) 
            throw new TypeError("ParameterError: subimageWidth required!")
        if (image.naturalHeight == 0)
            throw new TypeError("ParameterError: image is an Image but has no source or hasn't loaded yet!")
        
        this.image = image
        this.subimageHeight = subimageHeight|0
        this.subimageWidth = subimageWidth|0
        
        this._imagesPerRow = (image.naturalWidth / subimageWidth|0)
        this._imagesPerColumn = (image.naturalHeight / subimageHeight|0)
        //this.subimageCount = subimageCount|0 || this._imagesPerColumn * this._imagesPerRow
    }
    
    getFrameX(subimage) {
        return ((subimage % this._imagesPerRow) % this._imagesPerRow) * this.subimageWidth
    }
    
    getFrameY(subimage) {
        
        return ((subimage / this._imagesPerRow |0) % this._imagesPerColumn) * this.subimageHeight
    } 
}

//only supports spritesheets with subimages right next to eachother as of now

class View {
    drawView(ctx, drawables) {}
}
//View
//  maintains viewport state, draws Drawable arrays based upon state, can pass viewContext to Drawables (i.e. 3d drawables need view context), interacts with ctx,
//  has viewStart and viewEnd callbacks
class SimpleView extends View {
    //TODO: A version of View with this signature: constructor(dwidth=100, dheight=100, dx=0, dy=0, drot=0, sx=0, sy=0, zoomX=1, zoomY=1, srot=0)
    constructor(dwidth=100, dheight=100, dx=0, dy=0, sx=0, sy=0, zoomX=1, zoomY=1, backgroundColor, smooth=true) {
        super()
        this.dwidth=dwidth|0
        this.dheight=dheight|0
        this.dx=dx|0
        this.dy=dy|0
        
        this.sx=sx|0
        this.sy=sy|0
        
        this.zoomX=+zoomX
        this.zoomY=+zoomY
        this.smooth = !!smooth
        
        this.backgroundColor = backgroundColor
    }
    
    drawView(ctx, drawables) {
        ctx.save()
        //background color
        if (this.backgroundColor) {
            ctx.fillStyle = this.backgroundColor
            ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        } else {
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        }
        //perform zoom and translation
        ctx.setTransform(this.zoomX,
                         0,
                         0,
                         this.zoomY,
                         (this.dx-this.sx)*this.zoomX-this.dx|0,
                         (this.dy-this.sy)*this.zoomY-this.dy|0
                        )

        ctx.imageSmoothingEnabled = this.smooth
        
        for (let i = 0; i < drawables.length; i++)
            drawables[i].draw(ctx)
        
        ctx.restore()
        
        ctx.clearRect(this.dx, 0, ctx.canvas.width, this.dy)
        ctx.clearRect(this.dx+this.dwidth, this.dy, ctx.canvas.width, ctx.canvas.height)
        ctx.clearRect(0, this.dy+this.dheight, this.dx+this.dwidth, ctx.canvas.height)
        ctx.clearRect(0, 0, this.dx, this.dy+this.dheight)
    }
}

class SceneManager {
    constructor(canvas, fpscap=60) {
        if (!canvas)
            throw new TypeError("Parametererror: canvas required!")
        
        this.canvas = canvas
        this.ctxt = canvas.getContext("2d")
        
        const c = document.createElement("canvas")
        c.width = canvas.width
        c.height = canvas.height
        this._osCtx = c.getContext("2d")
        
        this.fpscap = fpscap|0
        
        this.debug = {
            _lastSecond: window.performance.now(),
            _framesThisSecond: 0,
            fps: 0
        }
    }
    
    play(scene) {
        if (!scene)
            throw new TypeError("Parametererror: scene required!")
        
        this.scene = scene
        scene._setOffscreenContext(this._osCtx)
        scene._onPlay()
        
        if (!this._running) {
            this._running = true
            this._loop()
        } 
    }
    
    stop() {
        scene._onStop()
        
        this._running = false
    }
    
    _loop() {
        if (this._running)
            window.requestAnimationFrame(this._loop.bind(this))
        
        //calculate fps
        if (window.performance.now() > this.debug._lastSecond + 1000) {
            this.debug._lastSecond = window.performance.now()
            this.debug.fps = this.debug._framesThisSecond
            this.debug._framesThisSecond = 0
        }
        //limit fps
        if (this.fpscap==60 || this.debug._framesThisSecond < (window.performance.now() - this.debug._lastSecond) / 1000 * this.fpscap) {
            this.scene.drawScene(this.ctxt)
            this.debug._framesThisSecond++
        }
    }
}

class Crux extends SceneManager {
    constructor(canvas, fpscap) {
        super(canvas, fpscap)
        
        this.input = new Input(canvas)
    }
    
    _loop() {
        super._loop()
        this.input.resetPressedAndReleased()
    }
}

//inserts an object into an sorted array, sorted based upon an object's _rl_index property
function rlindexInsert(object, arr) {
    var low = 0,
        high = arr.length

    while (low < high) {
        var mid = (low + high) >>> 1
        if (arr[mid]._rl_depth < object._rl_depth) low = mid + 1
        else high = mid
    }
    
    object._rl_index = low
    arr.splice(low, 0, object)
    //update index counter of sprites being pushed up by insertion
    for (let i = low+1; i < arr.length; i++) {
        arr[i]._rl_index++
    }
}

//abstract class below Drawable
class DrawableCollection extends Drawable {
    constructor(x, y, width, height, rot, opacity, blendmode) {
        super(x, y, width, height, rot, opacity, blendmode)
     
        this._drawableArr = []
    }
    
    addDrawable(drawable, depth=0) {
        if (!drawable)
            throw new TypeError("Parametererror: drawable required!")
        if (!(drawable instanceof Drawable))
            throw new TypeError("Parametererror: drawable must be an instance of Drawable!")
        if (drawable._rl_depth != undefined)
            throw new Error("drawable is already registered to a scene!")
        
        drawable._rl_depth = depth
        //insert into array at proper position
        rlindexInsert(drawable, this._drawableArr)
        
        //add the ability to delete this drawable
        drawable.remove = (function() {
            this.removeDrawable(drawable)
        }).bind(this)
        
        //add depth setter and getter to drawable for ease of use
        Object.defineProperty(drawable, 'depth', {
            get: function() { 
                return this._rl_depth
            },
            set: (function(newValue) {
                this.setDrawableDepth(drawable, newValue)
            }).bind(this),
            enumerable: true,
            configurable: true
        })

        return drawable
    }
    
    removeDrawable(drawable) {
        //remove from array
        this._drawableArr.splice(drawable._rl_index, 1)
        //clean and remove from hash
        delete drawable.depth
        delete drawable.remove
        delete drawable._rl_depth
        delete drawable._rl_index
    }
    
    setDrawableDepth(drawable, depth=0) {
        //remove from array
        this._drawableArr.splice(drawable._rl_index, 1)
        drawable._rl_depth = depth
        //reinsert
        rlindexInsert(drawable, this._drawableArr)
    }
}

//could be extended to support rotation, smoothing, background color
class Layer extends DrawableCollection {
    constructor(x, y, width, height, rot, opacity, blendmode) {
        super(x, y, width, height, rot, opacity, blendmode)
        
        const c = document.createElement("canvas")
        if (width)
            c.width = width
        if (height)
            c.height = height
        this._osCtx = c.getContext("2d")
    }

    draw(ctx) {
        this._osCtx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
        
        for (let i = 0; i < this._drawableArr.length; i++)
            this._drawableArr[i].draw(this._osCtx)
        
        ctx.save()
        super.prepare(ctx)
        ctx.drawImage(this._osCtx.canvas, this.x, this.y)
        ctx.restore()
    }
}

class Group extends DrawableCollection {
    constructor(x, y, rot, scaleX=1, scaleY=1) {
        super(x, y, 0, 0, rot)
        
        this.scaleX = scaleX
        this.scaleY = scaleY
    }
    
    draw(ctx) {
        ctx.save()
        super.prepare(ctx)
        ctx.translate(this.x, this.y)
        //ctx.rotate(this.rot)
        //ctx.rotate(this.rot)
        //ctx.scale(this.scaleX,this.scaleY)
        
        for (let i = 0; i < this._drawableArr.length; i++)
            this._drawableArr[i].draw(ctx)
        
        ctx.restore()
    }
}


function EventScene(Base) {
    if (!(Base.prototype instanceof Scene) && Base != Scene)
        throw new TypeError("Base must be a Scene")
    
    return class extends Base {
        constructor() {
            super(...arguments)
            if (this.onCreate) 
                this.onCreate()
        }
        
        drawScene() {
            if (this.onDrawStart) 
                this.onDrawStart()
            super.drawScene(...arguments)
            if (this.onDrawEnd) 
                this.onDrawEnd()
        }
    }
}

function LoadEventScene(Base) {
    if (!(Base.prototype instanceof Scene) && Base != Scene)
        throw new TypeError("Base must be a Scene")
    
    return class extends Base {
        constructor() {
            super(...arguments)
            
            this._activeDrawStart = this.onLoadDrawStart
            this._activeDrawEnd = this.onLoadDrawEnd
            
            this.load = new MediaLoader()
            this.load.onComplete(() => {
                this._activeDrawStart = this.onDrawStart
                this._activeDrawEnd = this.onDrawEnd
                this.onReady()
            })
            
            if (this.onCreate) 
                this.onCreate()
            this.load.start()
        }
        
        drawScene() {
            if (this._activeDrawStart) 
                this._activeDrawStart()
            super.drawScene(...arguments)
            if (this._activeDrawEnd) 
                this._activeDrawEnd()
        }
    }
}

//Scene
//  manages Drawables and Views, controls view activation order, virtual canvas layering, sprite depth, other sprite meta information, has one default view
class Scene {
    constructor(width, height) {
        
        const c = document.createElement("canvas")
        c.width = width || 100
        c.height = height || 100
        this._osCtx = c.getContext("2d")
        
        this._drawableArr = []
        
        this._viewArr = []
        
        this.default_view = new SimpleView(this._osCtx.canvas.width, this._osCtx.canvas.height)
        this.addView(this.default_view)
    }
    
    _setOffscreenContext(osCtx) {
        this._osCtx = osCtx
        if (this.default_view) {
            this.default_view.dwidth = osCtx.canvas.width || 100
            this.default_view.dheight = osCtx.canvas.height || 100
        }  
    }
    
    drawScene(ctx) {
        ctx.clearRect(0, 0, this._osCtx.canvas.width, this._osCtx.canvas.height)
        
        for (let i = 0; i < this._drawableArr.length; i++) {
            if (this._drawableArr[i].onFrame)
                this._drawableArr[i].onFrame()
        }
        
        for (let i = 0; i < this._viewArr.length; i++) {
            this._osCtx.clearRect(0, 0, this._osCtx.canvas.width, this._osCtx.canvas.height)
            this._viewArr[i].drawView(this._osCtx, this._drawableArr)
            //potential optimization on this line:
            ctx.drawImage(this._osCtx.canvas, 0, 0)
        }
    }
    
    //view actions
    addView(view, depth=0) {
        if (!view)
            throw new TypeError("Parametererror: view required!")
        if (!(view instanceof View))
            throw new TypeError("Parametererror: view must be an instance of View!")
        if (view._rl_depth != undefined)
            throw new Error("view is already registered to a scene!")
        
        view._rl_depth = depth
        //insert into array at proper position
        rlindexInsert(view, this._viewArr)
        
        //add the ability to delete this view
        view.remove = (function() {
            this.removeView(view)
        }).bind(this)
        
        //add depth setter and getter to view for ease of use
        Object.defineProperty(view, 'depth', {
            get: function() { 
                return this._rl_depth
            },
            set: (function(newValue) {
                this.setViewDepth(view, newValue)
            }).bind(this),
            enumerable: true,
            configurable: true
        })
        
        
        
        return view
    }
    
    removeView(view) {
        //remove from array
        this._viewArr.splice(view._rl_index, 1)
        //clean and remove from hash
        delete view.depth
        delete view.remove
        delete view._rl_depth
        delete view._rl_index
    }
    
    setViewDepth(depth=0) {
        //remove from array
        this._viewArr.splice(view._rl_index, 1)
        view._rl_depth = depth
        //reinsert
        rlindexInsert(view, this._viewArr)
    }
    
    //drawable actions
    addDrawable(drawable, depth=0) {
        if (!drawable)
            throw new TypeError("Parametererror: drawable required!")
        if (!(drawable instanceof Drawable))
            throw new TypeError("Parametererror: drawable must be an instance of Drawable!")
        if (drawable._rl_depth != undefined)
            throw new Error("drawable is already registered to a scene!")
        
        drawable._rl_depth = depth
        //insert into array at proper position
        rlindexInsert(drawable, this._drawableArr)
        
        //add the ability to delete this drawable
        drawable.remove = (function() {
            this.removeDrawable(drawable)
        }).bind(this)
        
        //add depth setter and getter to drawable for ease of use
        Object.defineProperty(drawable, 'depth', {
            get: function() { 
                return this._rl_depth
            },
            set: (function(newValue) {
                this.setDrawableDepth(drawable, newValue)
            }).bind(this),
            enumerable: true,
            configurable: true
        })

        return drawable
    }
    
    removeDrawable(drawable) {
        //remove from array
        this._drawableArr.splice(drawable._rl_index, 1)
        //clean and remove from hash
        delete drawable.depth
        delete drawable.remove
        delete drawable._rl_depth
        delete drawable._rl_index
    }
    
    setDrawableDepth(drawable, depth=0) {
        //remove from array
        this._drawableArr.splice(drawable._rl_index, 1)
        drawable._rl_depth = depth
        //reinsert
        rlindexInsert(drawable, this._drawableArr)
    }
    
    _onPlay() {
        if (this.onPlay)
            this.onPlay()
        for (let i = 0; i < this._drawableArr.length; i++) {
            if (this._drawableArr[i].onPlay)
                this._drawableArr[i].onPlay()
        }
    }
    
    _onStop() {
        if (this.onStop)
            this.onStop()
        for (let i = 0; i < this._drawableArr.length; i++) {
            if (this._drawableArr[i].onStop)
                this._drawableArr[i].onStop()
        }
    }
}

//IDEA: use es6 proxies to make a LazyRenderer class (useful for performance on things with a low change rate)
//IDEA: make a ControlledRenderer class that only renders when told to

class MediaLoader {
    
    constructor() {
        
        this.total = 0
        this.progress = 0

        this._loadArr = []
        
        this._progressEvents = []
        this._completeEvents = []
    }
    
    onProgress(func) {
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        this._progressEvents.push(func);
    }
    
    onComplete(func) {
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        this._completeEvents.push(func);
    }
    
    image(src) {
        this.total++
        const temp = new Image()
        this._loadArr.push({obj: temp, src: src})
        
        temp.onload = (function() {
            this.progress++
            if (this.progress == this.total)
                this._completeEvents.forEach(f=>f())
            else
                this._progressEvents.forEach(f=>f(this.progress, this.total))
        }).bind(this)
        
        temp.onerror = function() {
            throw new Error("Error loading image: " + src)
        }
        
        return temp
    }
    
    audio(src) {
        this.total++
        const temp = new Audio()
        temp.preload = 'auto'
        this._loadArr.push({obj: temp, src: src})
        
        temp.oncanplaythrough = (function() {
            this.progress++
            temp.oncanplaythrough = null
            if (this.progress == this.total)
                this._completeEvents.forEach(f=>f())
            else
                this._progressEvents.forEach(f=>f(this.progress, this.total))
        }).bind(this)
        
        temp.onerror = function() {
            throw new Error("Error loading audio: " + src)
        }
        
        return temp
    }
    
    start() {
        if (this.total==0)
            this._completeEvents.forEach(f=>f())
        
        this._loadArr.forEach(e=>{
            e.obj.src = e.src
        })
    }
}

class Input {
    constructor(el=document.body) {
        if (!((el instanceof HTMLElement) || (el instanceof HTMLDocument)))
            throw new TypeError("ParameterError: el must be a valid HTML element!")
        
        this._el = el
        //allow this element to be focused
        if (el.tabIndex==-1)
            el.tabIndex = 1
        //input state
        this.keysDown = {}
        this.buttonsDown = {}
        this.mouse = { x: 0, y:0 }
        this.resetPressedAndReleased()
        
        this.tilt = { abs: false, z:0, x:0, y:0 }
        
        this.touches = {}
        
        //callback registry
        this._mouseEvents = {
            down: [],
            up: []
        };
        
        this._keyEvents = {
            down: [],
            up: []
        }
        
        this._tiltEvents = []
        
        this._touchEvents = {
            start: [],
            cancel: [],
            end: []
        }

        //tilt
        window.addEventListener('deviceorientation', e=>{
            this._tiltEvents.forEach(o=>o())
            this.tilt = {
                abs: e.absolute,
                z: e.alpha,
                x: e.beta,
                y: e.gamma
            }
        })
        //mouse and keybaord
        //disable the context menu
        el.addEventListener('contextmenu', e=>e.preventDefault())
        //add callbacks
        el.addEventListener('mousedown', e=>{
            e.preventDefault()
            this._el.focus()
            this.buttonsDown[e.button] = true
            this.buttonsPressed[e.button] = true
            this._mouseEvents.down.forEach(o=>{
                if (o.button!==undefined) {
                    if (o.button==e.button) 
                        o.func(e.button)   
                }
                else
                    o.func(e.button)
            })
        })
        el.addEventListener('mouseup', e=>{
            e.preventDefault()
            this.buttonsDown[e.button] = false
            this.buttonsReleased[e.button] = true
            this._mouseEvents.up.forEach(o=>{
                if (o.button!==undefined) {
                    if (o.button==e.button) 
                        o.func(e.button)   
                }
                else
                    o.func(e.button)
            })
        })
        el.addEventListener('mousemove', e=>{
            const {left, top} = this._el.getBoundingClientRect()
            this.mouse.x = e.clientX - left
            this.mouse.y = e.clientY - top
        })
        
        el.addEventListener('keydown', e=>{
            if (!this.keysDown[e.key.toLowerCase()]) {
                e.preventDefault()
                this.keysPressed[e.key.toLowerCase()] = true
                this.keysDown[e.key.toLowerCase()] = true
                this._keyEvents.down.forEach(o=>{
                    if (o.key!==undefined) {
                        if (o.key==e.key.toLowerCase()) 
                            o.func(e.key)   
                    }
                    else
                        o.func(e.key)
                })
            }
        })
        el.addEventListener('keyup', e=>{
            this.keysReleased[e.key.toLowerCase()] = true
            e.preventDefault()
            this.keysDown[e.key.toLowerCase()] = false
            this._keyEvents.up.forEach(o=>{
                if (o.key!==undefined) {
                    if (o.key==e.key.toLowerCase()) 
                        o.func(e.key)   
                }
                else
                    o.func(e.key)
            })
        })
        //touch
        el.addEventListener('touchstart', e=>{
            e.preventDefault()
            this._el.focus()
            this.touches = this._processTouches(e.touches)
            
            this._touchEvents.start.forEach(o=>{
                if (o.id!==undefined) {
                    if (touches[o.id]!= undefined)
                        o.func(touches)
                }
                else
                    o.func(touches)
                    
            })
        })
        
        el.addEventListener('touchmove', e=>{
            e.preventDefault()
            this.touches = this._processTouches(e.touches)
        })
        
        el.addEventListener('touchcancel', e=>{
            e.preventDefault()
            const touches = this._processTouches(e.changedTouches)
            
            this._touchEvents.cancel.forEach(o=>{
                if (o.id!==undefined) {
                    if (touches[o.id]!= undefined)
                        o.func(touches)
                }
                else
                    o.func(touches)
                    
            })
        })
        
        el.addEventListener('touchend', e=>{
            e.preventDefault()
            const touches = this._processTouches(e.changedTouches, true)
            this._touchEvents.end.forEach(o=>{
                if (o.id!==undefined) {
                    if (touches[o.id]!= undefined)
                        o.func(touches)
                }
                else
                    o.func(touches)
                    
            })
        })
    }
    
    _processTouches(touches, del) {
        const formatted = {}
        for(let i = 0; i < touches.length; i++) {
            const {left, top} = this._el.getBoundingClientRect()
            if (del)
                delete this.touches[touches[i].identifier]
                
            formatted[touches[i].identifier] = {
                x: touches[i].clientX - left |0,
                y: touches[i].clientY - top |0
            }
        }
        return formatted
    }
    
    setCursor(...args) {
        this._el.style.cursor = args.reduce(
            (a,c)=> a + c + ', '
        , "")+"auto"
    }
    
    onMouse(eventName, func, button) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._mouseEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        if (typeof button == 'string')
            button = this._stringToMouseCode(button)

        this._mouseEvents[eventName].push({func, button})
    }
    
    unMouse(eventName, func) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._mouseEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        
        const find = this._mouseEvents[eventName].findIndex(f=>f.func===func);
        if (find === -1)
            throw new Error("func is not a registered key listener!")
        this._mouseEvents[eventName].splice(find,1);
    }
    
    onKey(eventName, func, key) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._keyEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        
        this._keyEvents[eventName].push({func, key: (key)?key.toLowerCase():undefined})
    }
    
    unKey(eventName, func) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._keyEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        
        const find = this._keyEvents[eventName].findIndex(f=>f.func===func);
        if (find === -1)
            throw new Error("func is not a registered key listener!")
        this._keyEvents[eventName].splice(find,1);
    }
    
    onTilt(func) {
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        this._tiltEvents.push(func)
    }
    
    unTilt(func) {
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        
        const find = this._tiltEvents.findIndex(f=>f.func===func);
        if (find === -1)
            throw new Error("func is not a registered key listener!")
        this._tiltEvents.splice(find,1);
    }
    
    onTouch(eventName, func, id) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._touchEvents[eventName])
            throw new Error(eventName + " is not a valid event!")

        this._touchEvents[eventName].push({func, id})
    }
    
    unTouch(eventName, func) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._touchEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        
        const find = this._touchEvents[eventName].findIndex(f=>f.func===func);
        if (find === -1)
            throw new Error("func is not a registered key listener!")
        this._touchEvents[eventName].splice(find,1);
    }
    
    keyDown(key) {
        return (this.keysDown[key.toLowerCase()])?true:false
    }
    
    buttonDown(button) {
        if (typeof button == 'string')
            button = this._stringToMouseCode(button)
        
        return (this.buttonsDown[button])?true:false
    }
    
    keyPressed(key) {
        return (this.keysPressed[key.toLowerCase()])?true:false
    }
    
    keyReleased(key) {
        return (this.keysReleased[key.toLowerCase()])?true:false
    }
    
    buttonPressed(button) {
        if (typeof button == 'string')
            button = this._stringToMouseCode(button)
        
        return (this.buttonsPressed[button])?true:false
    }
    
    buttonReleased(button) {
        if (typeof button == 'string')
            button = this._stringToMouseCode(button)
        
        return (this.buttonsReleased[button])?true:false
    }
    
    _stringToMouseCode(str) {
        switch (str.toLowerCase()) {
            case 'left': return 0
            case 'middle': return 1
            case 'right': return 2
        }
    }
    
    resetPressedAndReleased() {
        this.keysPressed = {}
        this.keysReleased = {}
        this.buttonsPressed = {}
        this.buttonsReleased = {}
    }
}