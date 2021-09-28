// 拖动，点击进度条
const bindEventProgress = (audio) => {
    let inner = e('.inner')
    let outer = e('.range')
    let dot = e('.dot')
    let button = e('.fa-play')

    let max = outer.offsetWidth
    let moving = false

    dot.addEventListener('mousedown', (event) => {
        moving = true
    })

    dot.addEventListener('mouseup', (event) => {
        moving = false
        audio.currentTime = audio.dataset.timenow
    })

    dot.addEventListener('mousemove', (event) => {
        if (moving) {
            let innerX = inner.getBoundingClientRect().left
            let x = event.clientX - innerX
            if (x > max) {
                x = max
            }
            if (x < 0) {
                x = 0
            }
            let width = (x / max) * 100
            inner.style.width = String(width) + '%'

            let clock = Number(audio.dataset.clock)
            clearInterval(clock)

            audio.dataset.timenow = width / 100 * audio.duration

            button.classList.remove('fa-play')
            button.classList.add('fa-pause')

        }
    })

    outer.addEventListener('click', (event) => {
        let innerX = inner.getBoundingClientRect().left
        let x = event.clientX - innerX
        log('x is', x)
        log('innerX', innerX)
        if (x > max) {
            x = max
        }
        if (x < 0) {
            x = 0
        }
        let width = (x / max) * 100
        inner.style.width = String(width) + '%'

        let clock = Number(audio.dataset.clock)
        clearInterval(clock)
        audio.dataset.timenow = width / 100 * audio.duration
        audio.currentTime = audio.dataset.timenow

        button.classList.remove('fa-play')
        button.classList.add('fa-pause')
    })

}

// 歌曲进度
const changesecond = (second) => {
    let secondint = parseInt(second)
    let minute = Math.floor(second / 60)
    let second2 = secondint - minute * 60
    let before = `0${minute}`.slice(-2)
    let after = `0${second2}`.slice(-2)
    return `${before}:${after}`
}

const bindInsertTime = (audio) => {
    let span1 = e('#id-currentTime')
    span1.innerHTML = '00:00'

    let span2 = e('#id-duration')

    audio.addEventListener('canplay', () => {
        span2.innerHTML = `${changesecond(audio.duration)}`

        let interval = 500
        let clockId = setInterval(() => {
            span1.innerHTML = `${changesecond(audio.currentTime)}`
            let dot = e('.dot')
            flow(audio.currentTime, audio.duration)
        }, interval)
        audio.dataset.clock = clockId
    })
}

const flow = (currentTime, duration) => {
    let width = (currentTime / duration) * 100
    let inner = e('.inner')
    inner.style.width = String(width) + '%'
}

// 点击播放歌曲
const bindEventPlay = (audio) => {
    let button = e('.fa-play')

    button.addEventListener('click', () => {
        if (button.classList.contains('fa-play')) {
            audio.play()
            button.classList.remove('fa-play')
            button.classList.add('fa-pause')
        } else {
            audio.pause()
            button.classList.remove('fa-pause')
            button.classList.add('fa-play')
        }
    })
}

const bindEventCanPlay = (audio) => {
    audio.addEventListener('canplay', () => {
        audio.play()
        changeCover(audio)
        changeInfo(audio)
    })
}

const songArray = () => {
    let array = []
    let selector = '.songlist'
    let divs = es(selector)
    for (let i = 0; i < divs.length; i++) {
        let song = divs[i].dataset.path
        array.push(song)
    }
    return array
}

// 播放下一首
const nextSongIndex = (index, offset) => {
    let songs = songArray()
    index = (index + offset + songs.length) % songs.length
    return index
}

const ForwardSong = (audio) => {
    let index = Number(audio.dataset.index)
    let numberOfSongs = Number(audio.dataset.songs)
    let newindex = nextSongIndex(index, 1) + 1
    audio.src = `audio/${newindex}.mp3`
    audio.dataset.index = newindex - 1
}

const bindEventNext = (audio) => {
    let selector = '.fa-next'
    let button = e('.fa-play')
    bindAll(selector, 'click', (event) => {
        let self = event.target
        let index = Number(audio.dataset.index)
        let numberOfSongs = Number(audio.dataset.songs)
        let offset = Number(self.dataset.offset)
        let newindex = nextSongIndex(index, offset) + 1
        audio.src = `audio/${newindex}.mp3`
        audio.dataset.index = newindex - 1

        button.classList.remove('fa-play')
        button.classList.add('fa-pause')
    })
}

const bindClickEnded = (audio) => {
    let button = '.fa-ended'
    bindAll(button, 'click', (event) => {
        removeClassAll('fa-ended-clicked')
        let self = event.target
        audio.dataset.ended = self.dataset.ended
        self.classList.toggle('fa-ended-clicked')
    })
}

// 随机播放
const choice = (array, audio) => {
    let a = Math.random()
    a = a * array.length
    a = Math.floor(a)
    audio.dataset.index = a
    return array[a]
}

// 自动播放下一首（点击相关按钮 决定 随机/顺序/循环 播放
const howToEnded = (audio) => {
    bindClickEnded(audio)
    audio.addEventListener('ended', () => {
        let ended = audio.dataset.ended
        if (ended === 'random') {
            let array = songArray()
            let song = choice(array, audio)
            audio.src = `audio/${song}`
        } else if (ended === 'undo') {
            ForwardSong(audio)
        } else {
            audio.currentTime = 0
        }
    })
}

// 根据当前歌曲切换封面，歌曲信息
const changeCover = (audio) => {
    let img = e('img')
    let index = Number(audio.dataset.index) + 1
    log('index', index)
    img.src = `cover/${index}.jpg`
}

const changeInfo = (audio) => {
    let ealbum = e('.info__album')
    let esongname = e('.info__song')
    let eartist = e('.info__artist')
    let index = Number(audio.dataset.index) + 1
    let id = `#id-${index}`
    let thesong = e(id)
    let album = thesong.dataset.album
    let songname = thesong.dataset.songname
    let artist = thesong.dataset.artist

    ealbum.innerHTML = album
    esongname.innerHTML = songname
    eartist.innerHTML = artist
}

const bindEvents = () => {
    let audio = e('#id-audio-player')
    bindEventProgress(audio)
    bindEventPlay(audio)
    bindEventCanPlay(audio)
    bindEventNext(audio)
    howToEnded(audio)
    bindInsertTime(audio)
}

const __main = () => {
    bindEvents()
}

__main()