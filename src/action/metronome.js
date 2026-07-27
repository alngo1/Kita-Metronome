
//declare metronome bpm
let audioBPMnew = 160

//get ms between beats, 1/(b/s) * 1000ms/1s
function bpmToMS(bpm){
    return (1/(bpm / 60)) * 1000;
}

//get num beats within ms
function msToNumBeats(ms){
    return ms / 1000 / 60;
}

//select audio elements

let beatElem = document.querySelector("#beat");
beatElem.preload = "auto";
let downBeatElem = document.querySelector("#downbeat");

//select button and add a handle click

let playbuttonElem = document.querySelector("#newMet");

function playBeat(){
    beatElem.currentTime = 0.0;
    beatElem.play();
}

let beatCount = 1;
function playDownBeat(){
    downBeatElem.currentTime = 0;
    if(beatCount % 4 != 0){
        downBeatElem.play();
    }
    if(beatCount == 4){
        beatCount = 0;
    }
    beatCount++;
}

function sleep(ms){
    return new Promise(res => setTimeout(res, ms));
}

let beatDelay = bpmToMS(audioBPMnew);
let numBeatsInBar = 4;
let downBeatDelay = beatDelay / numBeatsInBar;
isPlaying = false;
enableDownBeat = false;
let metronomeInterval = undefined;
let downBeatInterval = undefined;

let startTime = 0, endTime = 0;
let nextDelay = 0;
let nextDownbeatDelay = 0;
async function handleClick(){
    if(!isPlaying){
        await sleep(nextDelay);
        startTime = performance.now();
        playBeat(); //play first beat before interval delay
        metronomeInterval = window.setInterval(playBeat, beatDelay);
        if(enableDownBeat){
            downBeatInterval = window.setInterval(playDownBeat, downBeatDelay)
        }
        isPlaying = true;
    }else if(isPlaying && metronomeInterval){
        endTime = performance.now();
        timeDiff = endTime - startTime; //time diff in ms
        metronomeInterval = window.clearInterval(metronomeInterval);
        if(downBeatInterval){
            downBeatInterval = window.clearInterval(downBeatInterval);
        }
        nextDelay = beatDelay - (timeDiff % beatDelay);
        isPlaying = false;
    }
}

playbuttonElem.onclick = handleClick;

//next steps: calculate time elapsed to know exactly when to
//continue metronome
/* 
start metronome > stop after delta e ms

calculate how many beats/delays occurred within delta e = delta e / (delay)
calculate remainder time = delta e % delay = ms since last beat
delay - remaindertime = ms till next beat

start metronome again > play remaining ms > either beat or down beat plays

need to add individual delays for beat and downbeat functions
*/