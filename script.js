//kid friendly game dev ui on top of:
//language on top of:
//game control system on top of:
//canvas

//easy to use networking support?

//rooms / states
//camera with pan / zoom
//touch input support
//only render inside the canvas / camera
//camera order rendering
//tiling
//spritesheet animations
//animation timelining

/* CURRENT ARCHITECTURE:
Drawable
  maintains a state that is drawable to the canvas using the void draw(ctx, viewCtx) method
View
  maintains viewport state, drawing Drawable arrays based upon state, can pass viewContext to Drawables (i.e. 3d drawables need view context), interacting with ctx
Scene
  manages Drawables and Views, controls view activation order, virtual canvas layering, sprite depth, other sprite meta information
Loop
  manages scenes and performs scene transitions, continuous activation of scene drawing
*/
//With utilities Input and MediaLoadPool


//Reference:
// 0| int
// + float
// !! boolean
// +'' string

"use strict"

//Drawable interface
class Drawable {
    draw(ctx) {}
}

class simpleText extends Drawable {
    constructor(text='', x=0, y=0, rot=0, font, color) {
        super()
        
        this.text = text+''
        this.x = x|0
        this.y = y|0
        this.rot = +rot
        this.font = font
        this.color = color
    }
    
    draw(ctx) {
        ctx.save()
        
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
    constructor(image, x=0, y=0, rot=0, width=0, height=0, subimage=0, mirrorX=false, mirrorY=false) {
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

//IDEA: use es6 proxies to make a LazyRenderer class (useful for performance on things with a low change rate)
//IDEA: make a ControlledRenderer class that only renders when told to


class RenderLoop {
    
    constructor(canvas) {
        if (!canvas)
            throw new TypeError("Parametererror: canvas required!")
        
        this.canvas = canvas
        if (!this.canvas.getContext)
            throw new TypeError("Context could not be retrieved from canvas!")
        
        this.ctx = this.canvas.getContext('2d')
        
        this.onDrawStart = function() {}
        this.onDrawEnd = function() {}
        
        this._spriteHash = {}
        this._spriteArr = []
        this._running = false
        
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
        this.ctx.setTransform(0.5,0,0,0.5,100,0)
        this.onDrawStart()
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for (let i = 0; i < this._spriteArr.length; i++)
            this._spriteArr[i].draw(this.ctx)

        this.ctx.clearRect(this.canvas.width, 0, this.canvas.width*2, this.canvas.height*2)
        this.onDrawEnd()
        if (this._running)
            window.requestAnimationFrame(this._loop.bind(this))
    }
    
    addDrawable(name, drawable, depth=0) {
        if (!name)
            throw new TypeError("Parametererror: name required!")
        if (!drawable)
            throw new TypeError("Parametererror: drawable required!")
        if (!(drawable instanceof Drawable))
            throw new TypeError("Parametererror: drawable must be an instance of Drawable!")
        if (this._spriteHash[name] !== undefined)
            throw new Error("Drawable with this name already exists")
        
        this._spriteHash[name] = drawable
        this._spriteHash[name]._rl_depth = depth
        //insert into array at proper position
        this._spliceSprite(drawable)
        
        return this
    }
    
    getDrawable(name) {
        return this._spriteHash[name]
    }
    
    deleteDrawable(name) {
        //remove from array
        this._spriteArr.splice(this._spriteHash[name]._rl_index, 1)
        //remove from hash
        delete this._spriteHash[name]
    }
    
    setDrawableDepth(name, depth=0) {
        //remove from array
        this._spriteArr.splice(this._spriteHash[name]._rl_index, 1)
        this._spriteHash[name]._rl_depth = depth
        //reinsert
        this._spliceSprite(this._spriteHash[name])
    }
    
    getDrawableDepth(name) {
        return this._spriteHash[name]._rl_depth
    }
    
    _spliceSprite(sprite) {
        var low = 0,
            high = this._spriteArr.length

        while (low < high) {
            var mid = (low + high) >>> 1
            if (this._spriteArr[mid]._rl_depth < sprite._rl_depth) low = mid + 1
            else high = mid
        }
        
        sprite._rl_index = low
        this._spriteArr.splice(low, 0, sprite)
        //update index counter of sprites being pushed up by insertion
        for (let i = low+1; i < this._spriteArr.length; i++) {
            this._spriteArr[i]._rl_index++
        }
    }
}

//add longest frame delay for this second
class DebugRenderLoop extends RenderLoop {
    constructor(canvas) {
        super(canvas)
        this._debug = {}
        this._debug.lastSecond = window.performance.now()
        this._debug.framesThisSecond = 0
        this.addDrawable("_debug_fps", new simpleText("FPS: calculating...", 10, 10, 0), 1000)
    }
    
    _loop() {
        super._loop()
        if (this._debug) {
            this._debug.framesThisSecond++
            if (window.performance.now() > this._debug.lastSecond + 1000) {
                this._spriteHash._debug_fps.text = "FPS: " + this._debug.framesThisSecond
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
const renderLoop = new DebugRenderLoop(document.getElementById("canvas"))

const input = new Input(document.getElementById("canvas"))
const pool = new MediaLoadPool()

const img1 = pool.addImage('http://vignette2.wikia.nocookie.net/minecraft/images/f/f0/Minecraft_Items.png/revision/latest?cb=20140102042917')
const img2 = pool.addImage('https://tcrf.net/images/thumb/b/bf/Undertale_toby_dog.gif/50px-Undertale_toby_dog.gif')
const img3 = pool.addImage('http://www.mariowiki.com/images/e/ee/Ludwig_Idle.gif')  
pool.addImage('http://www.nasa.gov/centers/jpl/images/content/650602main_pia15415-43.jpg')

const sound1 = pool.addAudio('https://upload.wikimedia.org/wikipedia/en/3/33/Good_Fortune_%28PJ_Harvey_song_-_audio_sample%29.ogg') 

renderLoop.addDrawable("loading", new simpleText("loading progress:", 10, 100, undefined, "30px Comic Sans MS", "crimson"), 0)
pool.onProgress = (a,b) => {
    renderLoop.getDrawable("loading").text = "loading progress: " + a + "/" + b
}

pool.start()
pool.onComplete = () => {
    renderLoop.deleteDrawable("loading")
    sound1.play()

    renderLoop.addDrawable("mc", new Sprite(new SpriteSheet(img1, 16, 16), 32, 32, 0, 64, 64, 0),3)
              .addDrawable("doggy", new Sprite(img2, 150, 150), 4)
              .addDrawable("ludwig", new Sprite(img3, 50, 50), 0)
              .addDrawable("text", new simpleText("yo what up son", 200, 200, 0.1), 0)
              .addDrawable("text2", new simpleText("press left and right", 110, 240, -0.1, "30px Comic Sans MS", "blue"), 0)
              .addDrawable("text3", new simpleText("and up and down", 120, 270, -0.1, "30px Comic Sans MS", "crimson"), 0)
              
    renderLoop.onDrawStart = function() {
        if (input.checkKey('arrowleft') || input.checkKey('a')) {
            renderLoop.getDrawable("ludwig").x -=2
            renderLoop.getDrawable("ludwig").mirrorX = false
        }
        if (input.checkKey('arrowright') || input.checkKey('d')) {
            renderLoop.getDrawable("ludwig").x +=2
            renderLoop.getDrawable("ludwig").mirrorX = true
        }
        if (input.checkKey('arrowup') || input.checkKey('a')) {
            renderLoop.getDrawable("ludwig").y -=2
        }
        if (input.checkKey('arrowdown') || input.checkKey('d')) {
            renderLoop.getDrawable("ludwig").y +=2
        }
        if (renderLoop.getDrawable("ludwig").y > 138 && renderLoop.getDrawableDepth("ludwig") != 10)
            renderLoop.setDrawableDepth("ludwig", 10)
        if (renderLoop.getDrawable("ludwig").y < 138 && renderLoop.getDrawableDepth("ludwig") != 0)
            renderLoop.setDrawableDepth("ludwig", 0)
        
        renderLoop.getDrawable("ludwig").rot = Math.sin(renderLoop.getDrawable("ludwig").y/5 + renderLoop.getDrawable("ludwig").x/5) / 4
        
        renderLoop.getDrawable("mc").height += 0.2
    }
    
    input.onMouse("down", (a)=>{
        console.log(input.mousePos.x, input.mousePos.y, input.checkKey('b'))
    }, 'left')
}

