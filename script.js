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
    //make MediaLoadPool promise based
    //preload scenes

    //HIGH PRIORITY OVERARCHING:
    //flesh out loop/scene manager system //wrap it up into one thing
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

"use strict"

//Drawable interface
class Drawable {
    draw(ctx, viewCtx) {}
}

class simpleText extends Drawable {
    constructor(text='', x=0, y=0, rot=0, font, color, opacity=1) {
        super()
        
        this.text = text+''
        this.x = x|0
        this.y = y|0
        this.rot = +rot
        this.font = font+''
        this.color = color+''
        this.opacity = +opacity
    }
    
    draw(ctx) {
        ctx.save()
        ctx.globalAlpha = this.opacity
        if (this.font)
            ctx.font = this.font
        if (this.color)
            ctx.fillStyle = this.color
        ctx.textBaseline = "top"
        
        const {width} = ctx.measureText(this.text)
        const centerOffsetWidth = this.x|0
        const centerOffsetHeight = this.y|0
        
        ctx.translate(centerOffsetWidth, centerOffsetHeight)
        ctx.rotate(this.rot)
        ctx.translate(-centerOffsetWidth, -centerOffsetHeight)
        
        ctx.fillText(this.text, this.x, this.y)
        ctx.restore()
    }
} 

class Sprite extends Drawable {
    constructor(image, x=0, y=0, rot=0, width=0, height=0, subimage=0, mirrorX=false, mirrorY=false, opacity=1) {
        super()
        if (image instanceof Image) {
            if (image.naturalHeight == 0)
                throw new TypeError("ParameterError: image is an Image but has no source or hasn't loaded yet!")
            this.image = image
            
            this.height = height|0 || this.image.naturalHeight
            this.width = width|0 || this.image.naturalWidth
            
            this.draw = function(ctx) {
                const centerOffsetWidth = this.x+this.width/2|0
                const centerOffsetHeight = this.y+this.height/2|0
                
                ctx.save()
                ctx.globalAlpha = this.opacity
                ctx.translate(centerOffsetWidth, centerOffsetHeight)
                ctx.rotate(this.rot)
                if (this.mirrorX && this.mirrorY) 
                    ctx.scale(-1,-1)
                else if (this.mirrorX)
                    ctx.scale(-1,1)
                else if (this.mirrorY)
                    ctx.scale(1,-1)
                ctx.translate(-centerOffsetWidth, -centerOffsetHeight)
                ctx.drawImage(this.image, this.x|0, this.y|0, this.width|0, this.height|0)
                ctx.restore()
            }
        } else if (image instanceof SpriteSheet) {
            this.spriteSheet = image
            this.subimage = subimage|0
            
            this.height = height|0 || this.spriteSheet.subimageHeight
            this.width = width|0 || this.spriteSheet.subimageWidth
            
            this.draw = function(ctx) { //draw a SpriteSheet
                const centerOffsetWidth = this.x+this.width/2|0
                const centerOffsetHeight = this.y+this.height/2|0
                
                ctx.save()
                ctx.globalAlpha = this.opacity
                ctx.translate(centerOffsetWidth, centerOffsetHeight)
                ctx.rotate(this.rot)
                if (this.mirrorX && this.mirrorY) 
                    ctx.scale(-1,-1)
                else if (this.mirrorX)
                    ctx.scale(-1,1)
                else if (this.mirrorY)
                    ctx.scale(1,-1)
                ctx.translate(-centerOffsetWidth, -centerOffsetHeight)

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
        } else {
            throw new TypeError("ParameterError: image must be an Image or SpriteSheet object!")
        }
            
        this.x = x|0
        this.y = y|0
        this.rot = +rot
        this.mirrorX = !!mirrorX
        this.mirrorY = !!mirrorY
        this.opacity = +opacity
    }
}

//only supports spritesheets with subimages right next to eachother as of now
class SpriteSheet {
    
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

class View {
    drawView(ctx, drawables) {}
}
//View
//  maintains viewport state, draws Drawable arrays based upon state, can pass viewContext to Drawables (i.e. 3d drawables need view context), interacts with ctx,
//  has viewStart and viewEnd callbacks
class SimpleView extends View {
    //skewing is also possible, but not implemented in this version of view
    //TODO: A version of View with this signature: constructor(dwidth=100, dheight=100, dx=0, dy=0, drot=0, sx=0, sy=0, zoomX=1, zoomY=1, srot=0)
    constructor(dwidth=100, dheight=100, dx=0, dy=0, sx=0, sy=0, zoomX=1, zoomY=1) {
        super()
        this.dwidth=dwidth|0
        this.dheight=dheight|0
        this.dx=dx|0
        this.dy=dy|0
        
        this.sx=sx|0
        this.sy=sy|0
        
        this.zoomX=+zoomX
        this.zoomY=+zoomY
    }
    
    drawView(ctx, drawables) {
        //TODO: if sprite outside boundaries, don't draw it, consider zoom&rotation of view and rotation of sprite
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        
        ctx.save()
        //perform zoom and translation
        ctx.setTransform(this.zoomX,0,0,this.zoomY,(this.dx-this.sx)*this.zoomX-this.dx|0,(this.dy-this.sy)*this.zoomY-this.dy|0)

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
    constructor(canvas) {
        if (!canvas)
            throw new TypeError("Parametererror: canvas required!")
        
        this.canvas = canvas
        this.ctxt = canvas.getContext("2d")
    }
    
    play(scene) {
        if (!scene)
            throw new TypeError("Parametererror: scene required!")
        
        this.scene = scene
        
        if (!this._running) {
            this._running = true
            this._loop()
        } 
    }
    
    stop() {
        this._running = false
    }
    
    _loop() {
        this.scene.drawScene(this.ctxt)
        
        if (this._running)
            window.requestAnimationFrame(this._loop.bind(this))
    }
}

//Scene
//  manages Drawables and Views, controls view activation order, virtual canvas layering, sprite depth, other sprite meta information, has one default view
class Scene {
    constructor(hooks, width, height) {
        if (!hooks)
            throw new TypeError("Parametererror: hooks required!")
        
        this._osCanvas = document.createElement("canvas")
        this._osCanvas.width = width || 100
        this._osCanvas.height = height || 100
        this._osCtx = this._osCanvas.getContext("2d")
        
        //this.osCtx.imageSmoothingEnabled = false
        
        this._drawableHash = {}
        this._drawableArr = []
        
        this._viewHash = {}
        this._viewArr = []
        
        this.addView(new SimpleView(this._osCanvas.width, this._osCanvas.height))
    }
    
    setSize(width, height) {
        this._osCanvas.width = width || 100
        this._osCanvas.height = height || 100
    }
    
    drawScene(ctx) {
        if (this.renderStart)
            this.renderStart()
        
        ctx.clearRect(0, 0, this._osCanvas.width, this._osCanvas.height)
        for (let i = 0; i < this._viewArr.length; i++) {
            this._osCtx.clearRect(0, 0, this._osCanvas.width, this._osCanvas.height)
            this._viewArr[i].drawView(this._osCtx, this._drawableArr)
            //potential optimization on this line:
            ctx.drawImage(this._osCanvas, 0, 0)
        }
        
        if (this.renderEnd)
            this.renderEnd()
    }
    
    //view actions
    addView(view, depth=0) {
        if (!view)
            throw new TypeError("Parametererror: view required!")
        if (!(view instanceof View))
            throw new TypeError("Parametererror: view must be an instance of View!")
        
        view._rl_depth = depth
        //insert into array at proper position
        this._spliceIntoOrder(view, this._viewArr)
        
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
        this._spliceIntoOrder(view, this._viewArr)
    }
    
    getViewDepth(name) {
        return view._rl_depth
    }
    
    //drawable actions
    addDrawable(drawable, depth=0) {
        if (!drawable)
            throw new TypeError("Parametererror: drawable required!")
        if (!(drawable instanceof Drawable))
            throw new TypeError("Parametererror: drawable must be an instance of Drawable!")
        
        drawable._rl_depth = depth
        //insert into array at proper position
        this._spliceIntoOrder(drawable, this._drawableArr)
        
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
        this._spliceIntoOrder(drawable, this._drawableArr)
    }
    
    getDrawableDepth(name) {
        return drawable._rl_depth
    }
    
    _spliceIntoOrder(object, arr) {
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
}

//IDEA: use es6 proxies to make a LazyRenderer class (useful for performance on things with a low change rate)
//IDEA: make a ControlledRenderer class that only renders when told to

class RenderLoop {
    
    constructor(scene, ctxt) {
        if (!scene)
            throw new TypeError("Parametererror: scene required!")
        if (!(scene instanceof Scene)) 
            throw new TypeError("ParameterError: scene must be an Scene object!")
        
        if (!ctxt)
            throw new TypeError("Parametererror: ctxt required!")
        if (!(ctxt instanceof CanvasRenderingContext2D)) 
            throw new TypeError("ParameterError: ctxt must be an CanvasRenderingContext2D object!")
        
        this.scene = scene
        this.ctxt = ctxt
        
        this.onDrawStart = function() {}
        this.onDrawEnd = function() {}
        
        this.start()
    }
    
    start() {
        if (!this._running) {
            this._running = true
            this._loop()
        } else {
            throw new Error("RenderLoop instance was asked to start while running")
        }
    }
    
    stop() {
        if (this._running) {
            this._running = false
        } else {
            throw new Error("RenderLoop instance was asked to stop while stopped")
        }
    }
    
    _loop() {
        this.onDrawStart()
        
        this.scene.drawScene(this.ctxt)
        
        this.onDrawEnd()
        if (this._running)
            window.requestAnimationFrame(this._loop.bind(this))
    }
}

//add longest frame delay for this second
class DebugRenderLoop extends RenderLoop {
    constructor(scene, ctxt) {
        super(scene, ctxt)
        this._debug = {}
        this._debug.lastSecond = window.performance.now()
        this._debug.framesThisSecond = 0
        this._debug.text = this.scene.addDrawable(new simpleText("FPS: calculating...", 10, 10, 0), 1000)
    }
    
    _loop() {
        super._loop()
        if (this._debug) {
            this._debug.framesThisSecond++
            if (window.performance.now() > this._debug.lastSecond + 1000) {
                this._debug.text.text = "FPS: " + this._debug.framesThisSecond
                this._debug.lastSecond = window.performance.now()
                this._debug.framesThisSecond = 0
            }
        }
    }
}

class MediaLoadPool {
    
    constructor() {
        
        this._total = 0
        this._progress = 0

        this._loadArr = []
        
        this.onProgress = function(){}
        this.onComplete = function(){}
    }
    
    addImage(src) {
        this._total++
        const temp = new Image()
        this._loadArr.push({obj: temp, src: src})
        
        temp.onload = (function() {
            this._progress++
            if (this._progress == this._total)
                this.onComplete()
            else
                this.onProgress(this._progress, this._total)
        }).bind(this)
        
        temp.onerror = function() {
            throw new Error("Error loading image: " + src)
        }
        
        return temp
    }
    
    addAudio(src) {
        this._total++
        const temp = new Audio()
        temp.preload = 'auto'
        this._loadArr.push({obj: temp, src: src})
        
        temp.oncanplaythrough = (function() {
            this._progress++
            temp.oncanplaythrough = null
            if (this._progress == this._total)
                this.onComplete()
            else
                this.onProgress(this._progress, this._total)
        }).bind(this)
        
        temp.onerror = function() {
            throw new Error("Error loading audio: " + src)
        }
        
        return temp
    }
    
    start() {
        this._loadArr.forEach(e=>{
            e.obj.src = e.src
        })
    }
}

class Input {
    constructor(el=document) {
        if (!((el instanceof HTMLElement) || (el instanceof HTMLDocument)))
            throw new TypeError("ParameterError: el must be a valid HTML element!")
        
        //allow this element to be focused
        if (el.tabIndex==-1)
            el.tabIndex = 1
        //input state
        this.keysDown = {}
        this.buttonsDown = {}
        this.mousePos = { x: 0, y:0 }
        
        //callback registry
        this._mouseEvents = {
            down: [],
            up: [],
            move: []
        };
        
        this._keyEvents = {
            down: [],
            up: []
        }
        //IDEAs:
        //gamepad
        //touch vs mouse (perhaps gestures too)
        //tilt
        
        //disable the context menu
        el.oncontextmenu=e=>e.preventDefault()
        //add callbacks
        el.onmousedown=e=>{
            e.preventDefault()
            e.target.focus()
            this.buttonsDown[e.button] = true
            this._mouseEvents.down.forEach(o=>{
                if (o.button!=undefined) {
                    if (o.button==e.button) 
                        o.func(e.button)   
                }
                else
                    o.func(e.button)
            })
        }
        el.onmouseup=e=>{
            e.preventDefault()
            e.target.focus()
            this.buttonsDown[e.button] = false
            this._mouseEvents.up.forEach(o=>{
                if (o.button!=undefined) {
                    if (o.button==e.button) 
                        o.func(e.button)   
                }
                else
                    o.func(e.button)
            })
        }
        el.onmousemove=e=>{
            this._mouseEvents.move.forEach(o=>o.func())
            const {left, top} = canvas.getBoundingClientRect()
            this.mousePos.x = e.clientX - left
            this.mousePos.y = e.clientY - top
        }
        
        el.onkeydown=e=>{
            if (!this.keysDown[e.key.toLowerCase()]) {
                e.preventDefault()
                this.keysDown[e.key.toLowerCase()] = true
                this._keyEvents.down.forEach(o=>{
                    if (o.key) {
                        if (o.key==e.key.toLowerCase()) 
                            o.func(e.key)   
                    }
                    else
                        o.func(e.key)
                })
            }
        }
        el.onkeyup=e=>{
            e.preventDefault()
            this.keysDown[e.key.toLowerCase()] = false
            this._keyEvents.up.forEach(o=>{
                if (o.key) {
                    if (o.key==e.key.toLowerCase()) 
                        o.func(e.key)   
                }
                else
                    o.func(e.key)
            })
        }
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
    
    onKey(eventName, func, key) {
        if (!eventName)
            throw new TypeError("ParameterError: eventName required!")
        if (!func)
            throw new TypeError("ParameterError: func callback required!")
        if (!this._keyEvents[eventName])
            throw new Error(eventName + " is not a valid event!")
        
        this._keyEvents[eventName].push({func, key: (key)?key.toLowerCase():undefined})
    }
    
    checkKey(key) {
        return (this.keysDown[key.toLowerCase()])?true:false
    }
    
    checkButton(button) {
        if (typeof button == 'string')
            button = this._stringToMouseCode(button)
        
        return (this.buttonsDown[button])?true:false
    }
    
    _stringToMouseCode(str) {
        switch (str.toLowerCase()) {
            case 'left': return 0
            case 'middle': return 1
            case 'right': return 2
        }
    }
}

//TESTING:
const scene = new Scene({}, 400, 400)

const view_other = scene.addView(new SimpleView(100, 100, 200, 200, -50, -50, 2, 2), 1)

//const renderLoop = new DebugRenderLoop(scene, document.getElementById("canvas").getContext("2d"))
const sm = new SceneManager(document.getElementById("canvas"))


const input = new Input(document.getElementById("canvas"))
const pool = new MediaLoadPool()

const img1 = pool.addImage('http://vignette2.wikia.nocookie.net/minecraft/images/f/f0/Minecraft_Items.png/revision/latest?cb=20140102042917')
const img2 = pool.addImage('https://tcrf.net/images/thumb/b/bf/Undertale_toby_dog.gif/50px-Undertale_toby_dog.gif')
const img3 = pool.addImage('http://www.mariowiki.com/images/e/ee/Ludwig_Idle.gif')  
const img4 = pool.addImage('http://opengameart.org/sites/default/files/spritesheet_caveman.png')
pool.addImage('http://www.nasa.gov/centers/jpl/images/content/650602main_pia15415-43.jpg')

const sound1 = pool.addAudio('http://incompetech.com/music/royalty-free/mp3-royaltyfree/Inspired.mp3') 

const text_loading = scene.addDrawable(new simpleText("loading progress:", 10, 10, undefined, "30px Comic Sans MS", "crimson"), 0)
pool.onProgress = (a,b) => {
    text_loading.text = "loading progress: " + a + "/" + b
}

sm.play(scene)

pool.start()
pool.onComplete = () => {
        
    text_loading.remove()
    sound1.play()
    sound1.loop = true

    //add sprites to the scene 
    let mc = scene.addDrawable(new Sprite(new SpriteSheet(img1, 16, 16), 32, 32, 0, 64, 64, 0, false, false, 0.4),3)
    let man = scene.addDrawable(new Sprite(new SpriteSheet(img4, 32, 32), 250, 150), 4)
    let ludwig = scene.addDrawable(new Sprite(img3, 50, 50), 0)
    
    scene.addDrawable(new Sprite(img2, 150, 150), 4)
    
    scene.addDrawable(new simpleText("yo what up son", 200, 200, 0.1), 0)
    scene.addDrawable(new simpleText("press left and right", 110, 240, -0.1, "30px Comic Sans MS", "blue"), 0)
    scene.addDrawable(new simpleText("and up and down", 120, 270, -0.1, "30px Comic Sans MS", "crimson"), 0)
    
    let frame = 0
    renderLoop.onDrawStart = function() {
        frame++
        //control ludwig
        if (input.checkKey('arrowleft') || input.checkKey('a')) {
            ludwig.x -=2
            ludwig.mirrorX = false
        }
        if (input.checkKey('arrowright') || input.checkKey('d')) {
            ludwig.x +=2
            ludwig.mirrorX = true
        }
        if (input.checkKey('arrowup') || input.checkKey('a')) {
            ludwig.y -=2
        }
        if (input.checkKey('arrowdown') || input.checkKey('d')) {
            ludwig.y +=2
        }
        //make ludwig go in front and behind the dog
        if (ludwig.y > 138 && ludwig.depth != 10)
            ludwig.depth = 10
        if (ludwig.y < 138 && ludwig.depth != 0)
            ludwig.depth = 0
        
        //make ludwig waddle
        ludwig.rot = Math.sin(ludwig.y/5 + ludwig.x/5) / 4
        
        mc.height += 0.2
        
        view_other.sx = ludwig.x - 5
        view_other.sy = ludwig.y
        
        man.subimage += (frame%4)?0:1
        
        sound1.volume = Math.min(Math.max(1-Math.sqrt((ludwig.x-150)**2 + (ludwig.y-150)**2)/200, 0), 1)
    }
    
    input.onMouse("down", (a)=>{
        mc.x = input.mousePos.x - 32
        mc.y = input.mousePos.y + 32 - mc.height/2
    }, 'left')
}