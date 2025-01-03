let currentTrack = new Audio();
let currFolder = null;
let currentLi;
async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:5500//songs/${folder}/`);
    let response = await a.text();
    let div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a')
    let songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith('.mp3')) {
            songs.push(element.href.split(`/songs/${folder}/`)[1])
            
        }
    }    
    let songsUL = document.querySelector('.songsList').getElementsByTagName('ul')[0];
    songsUL.innerHTML= '';
    for (const song of songs) {
        let songName = song.replaceAll('%20',' ').split('-')[0];
        let artistName = song.replaceAll('%20',' ').split('-')[1].split('.mp3')[0];
        songsUL.innerHTML += `<li class="flex justify-space-between"><img class="invert" src="/assets/musicLogo.svg">
                            <div class="info">
                                <div class="name font-16">${songName}</div>
                                <div class="artist font-12">${artistName}</div>
                            </div>
                            <img src="/assets/playBtn.svg" class="invert play-btn-on-card">
                        </li>`;
    }

    //event listener to each song in the songsList
    Array.from(document.querySelectorAll('.songsList ul li')).forEach(e=>{
        e.addEventListener('click',()=>{
            trackName = e.getElementsByClassName('name')[0].innerHTML +'-'+ e.getElementsByClassName('artist')[0].innerHTML;
            updateCurrentLi(e);
            playMusic(`${trackName}.mp3`);
            document.querySelector('.playbar').classList.add('playbar-dynamic-class')
        })
    })

    return songs
}

function updateCurrentLi(newLi) {
    if (currentLi) {
        currentLi.style.border = '1px solid white';
        currentLi.querySelector('.play-btn-on-card').src = '/assets/playBtn.svg';
    }
    currentLi = newLi;
    currentLi.style.border = '2px solid #16C47F';
    currentLi.querySelector('.play-btn-on-card').src = '/assets/pause.svg';

}
function secondsToMinutes(seconds) {
    let roundedSeconds = Math.round(seconds);
    let minutes = Math.floor(roundedSeconds / 60);
    let remainingSeconds = roundedSeconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' + remainingSeconds : remainingSeconds}`;
}

const playMusic = (track)=>{
    currentTrack.src = `/songs/${currFolder}/` + track;    
    currentTrack.play();

    let playBtn = document.querySelector('.play-btn');
    playBtn.src = '/assets/pause.svg';
    document.querySelector('.songInfo').innerHTML = track.split('.mp3')[0].replaceAll('%20',' ')
    document.querySelector('.playbar').classList.add('display-playbar')
}

const ChangeVol = (vol)=>{
    const inputBar = document.querySelector('.range input');
    inputBar.value = vol;
    currentTrack.volume = vol/100;
}

async function main() {   
    
    songs = await getSongs(`/songs/${currFolder}`)
    
    //event listener to play, next and previous song
    let playBtn = document.querySelector('.play-btn');
    playBtn.addEventListener('click',()=>{
        if (currentTrack.paused) {
            currentTrack.play();
            playBtn.src = '/assets/pause.svg';
            currentLi.querySelector('.play-btn-on-card').src = '/assets/pause.svg';
        }else{
            currentTrack.pause();
            playBtn.src = '/assets/playBtn.svg';
            currentLi.querySelector('.play-btn-on-card').src = '/assets/playBtn.svg';
        }
    })
    let prevBtn = document.querySelector('.prev-btn');
    prevBtn.addEventListener('click', ()=>{
        let currentIndex = songs.indexOf(currentTrack.src.split(`/songs/${currFolder}/`)[1]);
        if (currentIndex > 0) { 
            playMusic(songs[currentIndex - 1]);
            document.querySelector('.next-btn').style.opacity='1';

            let liElements = document.querySelectorAll('.songsList ul li');
            updateCurrentLi(liElements[currentIndex - 1]);

        }if (currentIndex == 1){
                prevBtn.style.opacity='0.3';
        }if (currentIndex != 1){
                prevBtn.style.opacity='1';
        }
    });
    
    let nextBtn = document.querySelector('.next-btn');
    nextBtn.addEventListener('click', ()=>{
        let currentIndex = songs.indexOf(currentTrack.src.split(`/songs/${currFolder}/`)[1]);
        if(currentIndex < songs.length - 1){
            playMusic(songs[currentIndex+1]);
            document.querySelector('.prev-btn').style.opacity='1';

            let liElements = document.querySelectorAll('.songsList ul li');
            updateCurrentLi(liElements[currentIndex + 1]);

        }if (currentIndex == songs.length-2){
            nextBtn.style.opacity='0.3';
        }if (currentIndex != songs.length-2){
            nextBtn.style.opacity='1';
        }
    })
    currentTrack.addEventListener('timeupdate',()=>{
        document.querySelector('.songTime').innerHTML = `${secondsToMinutes(currentTrack.currentTime)} / ${secondsToMinutes(currentTrack.duration)}`       
        document.querySelector('.circle').style.left = `${(currentTrack.currentTime/currentTrack.duration)*100}%`
    })
    
    //Event listener for seekbar
    document.querySelector('.seekbar').addEventListener('click', (event)=>{
        let percentage = (event.offsetX/event.target.getBoundingClientRect().width)*100;
        
        document.querySelector('.circle').style.left = `${percentage}%`;
        currentTrack.currentTime = (currentTrack.duration * percentage)/100;
    })
    
    //event listeners for hamburger
    document.querySelector('.hamburger').addEventListener('click',()=>{
        document.querySelector('.left-container').style.left = '0%';
    })
    
    document.querySelector('.cross').addEventListener('click',()=>{
        document.querySelector('.left-container').style.left = '-100%';
    })
    
    //volume seekbar functionality
    document.querySelector('.range').getElementsByTagName('input')[0].addEventListener('change',(e)=>{
        let img = document.querySelector('.volume img');
        ChangeVol(e.target.value)
        if (e.target.value==0) {
            img.src = "/assets/muteVolume.svg"
        }else{
            img.src = "/assets/volume.svg"
        }
    })
    
    document.querySelector('.volume img').addEventListener('click',()=>{
        const img = document.querySelector('.volume img');
        const initVal = 50;
        if (img.src.includes("muteVolume.svg")){
            img.src = "/assets/volume.svg";
            ChangeVol(initVal);
        }else{
            img.src = "/assets/muteVolume.svg";
            ChangeVol(0);
        }
    })
    
    document.querySelectorAll('.card').forEach(elem=>{
        elem.addEventListener('click', async (event)=>{
            songs = await getSongs(event.currentTarget.dataset.folder);
            document.querySelector('.prev-btn').style.opacity = '1';
            document.querySelector('.next-btn').style.opacity = '1';
            
        });
    })

    document.addEventListener('keypress',(event)=>{
        if (event.key == ' '){
            event.preventDefault();
            if (currentTrack.paused) {
                currentTrack.play();
                playBtn.src = '/assets/pause.svg';
                currentLi.querySelector('.play-btn-on-card').src = '/assets/pause.svg';
            }else{
                currentTrack.pause();
                playBtn.src = '/assets/playBtn.svg';
                currentLi.querySelector('.play-btn-on-card').src = '/assets/playBtn.svg';
            }
        }   
    })
}



main();