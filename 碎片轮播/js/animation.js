
    let oCon = document.querySelector('.con')
        str = '',w = 1120,h = 630,rows = 8,cols = 10
        for(let i = 0;i < rows * cols;i++){
            str += `<li></li>`
        }
        oCon.innerHTML = str
        let aLi = document.querySelectorAll('.con > li'),
            oBtn = document.querySelectorAll('.wrap > button'),
            count = 0//图片张数
    ~function init(){
        aLi.forEach((i,j)=>{
            let oTop = (j - j % cols) / cols,
                oLeft = j % cols
            //给每个li设置初始定位和背景
            i.style.position = 'absolute'
            i.style.top = oTop * (h / rows) + 'px'
            i.style.left = oLeft * (w / cols) + 'px'
            i.style.width = w / cols + 'px'
            i.style.height = h / rows + 'px'
            i.style.background =
            `url(./img/${count}.jpg) ${-oLeft * (w / cols)}px ${-oTop * (h / rows)}px`
            //记录每个li的初始样式值
            i.start = {
                opacity:1,
                transform:{
                    rotateX: 0,
                    rotateY: 0,
                    rotateZ: 0,
                    translateX:0,
                    translateY:0,
                    translateZ:0,
                    scale:1
                }
            }
            //设置目标样式值
            i.target = {
                opacity:.2,
                transform:{
                    rotateX: (Math.random()) * 360,
                    rotateY: (Math.random()) * 360,
                    rotateZ: (Math.random()) * 360,
                    translateX:(Math.random()-.2) * 1080,
                    translateY:(Math.random()-.2) * 1080,
                    translateZ:(Math.random()-.2) * 1080,
                    scale: Math.floor(Math.random() + .6)
                }
            }
        })
    }()

    let path = {
        transform: {
            rotateX: "rotateX($deg)",
            rotateY: "rotateY($deg)",
            rotateZ: "rotateZ($deg)",
            translateX:`translateX($px)`,
            translateY:`translateY($px)`,
            translateZ:`translateZ($px)`,
            scale: "scale($)",
        }
    }
    function next(){
        let time = Math.floor(Math.random()*1000) + 2000
        aLi.forEach(i => {
            move(
                i,
                i.start,
                i.target,
                time,
                function(){
                    time = Math.floor(Math.random()*1000) + 2000
                    this.style.backgroundImage = `url(./img/${count}.jpg)`
                    move(this,this.target,this.start,time)
                }
            )
        })
    }
    function change(bool){
        if(bool){
            count++
            count %= 7
            next()
        }else{
            count--
            if(count < 0) count = 6
            next()
        }
    }
    let timer = new Date() - 5500,
        countClock = 0
    
    function setClock(){
        countClock = setInterval(function(){
            change(true)
        },7000)
    }
        
    oBtn[0].onclick = function(){
        clearInterval(countClock)
        if(new Date() - timer < 5500) return
        change(false)
        timer= new Date()
        setClock()
    }
    oBtn[1].onclick = function(){
        clearInterval(countClock)
        if(new Date() - timer < 5500) return
        change(true)
        timer= new Date()
        setClock()
    }
    setTimeout( () => {
        change(true)
        setClock()
    },3100)

        function getStyle(el){
            return getComputedStyle(el) || el.currentStyle
        }

        function calc(startJson,targetJson,sub){//求每个样式变化的速度
            let speedJson = {}
            for(let i in startJson){
                if(typeof(startJson[i]) != 'object'){
                    speedJson[i] = sub(startJson[i],targetJson[i])
                }else{
                    speedJson[i] = calc(startJson[i],targetJson[i],sub)
                }
            }
            return speedJson
        }

        function render(el,path,currentStyle){//渲染改变之后的样式
            for(let i in currentStyle){
                if(typeof(currentStyle[i]) != 'object'){
                    el.style[i] = 
                    getStyle(el)[i].replace(parseFloat(getStyle(el)[i]),currentStyle[i])
                }else{
                    let str = ''
                    for(let j in currentStyle[i]){
                        str += path[i][j].replace('$',currentStyle[i][j]) + ' '
                    }
                    el.style[i] = str
                }
            }
        }
        function move(el,startJson,targetJson,time,callback){
            let t0 = new Date(),
                speedJson = calc(startJson,targetJson,(i,j)=>(j - i)/time)
            function run(){
                let dt = new Date() - t0,//运行到此时所耗时间
                    currentStyle = calc(startJson,speedJson,(i,j)=>i + j * dt)
                if(dt >= time){
                    currentStyle = calc(startJson,targetJson,(i,j)=>j)
                    callback && callback.call(el)
                }else{
                    requestAnimationFrame(run)
                }
                render(el,path,currentStyle)
            }
            run()
        }