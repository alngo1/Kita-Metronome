let button = document.getElementById("metronomeBtn");
let audio = document.getElementById("metAudio");
audio.volume = 0.4;

const audioBPM = 120.0;
let desiredBPM = 240.0;
let speedFactor =  desiredBPM / audioBPM;
audio.playbackRate = speedFactor;
audio.preservesPitch = false; //i think somehow this makes it sound better because as it goes faster the imperfections in the audio timing show

let isPlaying = false;
let isPaused = true;
let fullPlay = false;

audio.addEventListener("canplaythrough", () => fullPlay = true);

audio.addEventListener("play", () => {
    isPlaying = true;
    isPaused = false;
});
audio.addEventListener("pause", () => {
    isPlaying = false;
    isPaused = true;
});

button.addEventListener("click", handleClick);

function handleClick(){
    if(fullPlay && isPaused && !isPlaying){
        audio.play();
    }else if(isPlaying && !isPaused){
        audio.pause();
    }
};