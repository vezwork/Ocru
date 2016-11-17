const sm = new SceneManager(document.getElementById("canvas"))
const input = new Input(document.getElementById("canvas"))

//declare variables
var img1, img2, img3, img4, img5, sound1
var mc, man, ludwig, view_other
let frame = 0

const scene_complete = new SceneWithLoader({
    preload: function() {
        //load in images
        img1 = this.load.image('http://vignette2.wikia.nocookie.net/minecraft/images/f/f0/Minecraft_Items.png/revision/latest?cb=20140102042917')
        img2 = this.load.image('https://tcrf.net/images/thumb/b/bf/Undertale_toby_dog.gif/50px-Undertale_toby_dog.gif')
        img3 = this.load.image('http://www.mariowiki.com/images/e/ee/Ludwig_Idle.gif')  
        img4 = this.load.image('http://opengameart.org/sites/default/files/spritesheet_caveman.png')
        img5 = this.load.image('http://www.nasa.gov/centers/jpl/images/content/650602main_pia15415-43.jpg')
        sound1 = this.load.audio('http://incompetech.com/music/royalty-free/mp3-royaltyfree/Inspired.mp3') 
        //add loading text
        this.text_loading = this.addDrawable(new simpleText("loading progress:", 10, 10, undefined, "30px Comic Sans MS", "crimson"), 0)
    },
    
    loadRender: function() {
        //update loading text
        this.text_loading.text = "loading progress: " + this.load.progress + "/" + this.load.total
    },
    
    create: function() {
        //remove loading text
        this.text_loading.remove()
        //add small extra view
        view_other = this.addView(new SimpleView(100, 100, 200, 200, -50, -50, 2, 2), 1)
        //add background behind view
        this.addDrawable(new rectangle(190, 190, 0, 120, 120), 10)
        //play bgm
        sound1.play()
        sound1.loop = true
        //make sprites
        mc      = this.addDrawable(new Sprite(new SpriteSheet(img1, 16, 16), 32, 32, 0, 64, 64, 0, false, false, 0.4),3)
        man     = this.addDrawable(new Sprite(new SpriteSheet(img4, 32, 32), 250, 150), 4)
        ludwig  = this.addDrawable(new Sprite(img3, 50, 50), 0)
                  this.addDrawable(new Sprite(img2, 150, 150), 4)
        //make text
        this.addDrawable(new simpleText("yo what up son", 100, 100, 0.1), 0)
        this.addDrawable(new simpleText("press left and right", 110, 340, -0.1, "30px Comic Sans MS", "blue"), 0)
        this.addDrawable(new simpleText("and up and down", 120, 370, -0.1, "30px Comic Sans MS", "crimson"), 0)
    },
    
    render: function() {
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
        //make the helmet melt
        mc.height += 0.2
        mc.subimage += (frame%60)?0:1
        //control the second view
        view_other.sx = ludwig.x - 5
        view_other.sy = ludwig.y
        //animate the man every 4th frame
        man.subimage += (frame%4)?0:1
    }
})

sm.play(scene_complete)