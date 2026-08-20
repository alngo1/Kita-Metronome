"use strict"

//select audio elements on page and set preloads to auto
let beatElem = document.querySelector("#beat");
beatElem.preload = "auto";
let downBeatElem = document.querySelector("#downbeat");
downBeatElem.preload = "auto";

class Metronome{
    constructor(bpm){
        //vars for calculating timing
        this.bpm = bpm;
        this.offset = 0;
        this.playing = false;
        this.enableDownBeat = false;
        this.beatsInBar = 4;

        //vars for metronome intervals
        this.metronomeInterval = undefined;
        
        //vars for met delays
        this.beatDelay = this.bpmToMS(this.bpm);
        this.downBeatDelay = this.beatDelay / this.beatsInBar;

        //vars for pause delay calculations
        this.startTime = 0;
        this.endTime = 0;
        this.nextDelay = 0;
        this.nextDownBeatDelay = 0;

        this.nextBeat = 1;
    }

    sleep(ms){
        return new Promise(res => setTimeout(res, ms));
    }

    //given a bpm, return ms between beats calculated: 1/(b/s) * 1000ms/1s
    bpmToMS(bpm){
        return (1/(bpm / 60)) * 1000;
    }
    //given a number of ms, and a set bpm, return number beats within those ms
    msToNumBeats(ms){
        return ms / 1000 / 60;
    }

    //funcs to play beat and downbeat
    playBeat(){
        beatElem.currentTime = 0.0;
        beatElem.play();
    }

    playDownBeat(){
        downBeatElem.currentTime = 0.0;
        downBeatElem.play();
    }

    //combining beat and downbeats to one play
    async playBeatAndDownBeats(){
        this.playBeat();
        this.nextBeat++;
        if(this.enableDownBeat){
            for(; this.nextBeat <= this.beatsInBar; this.nextBeat++){
                await this.sleep(this.downBeatDelay);
                this.playDownBeat();
            }
        }
        this.nextBeat = 1;
    }

    //determine next beat/downbeat to play and delay based off 
    //next beat number
    //interval will just play one beat and when paused will resume
    //from last beat
    playNextBeat(){
        if(this.enableDownBeat){
            if(this.nextBeat == 1){
                this.playBeat();
            }else{
                this.playDownBeat();
            }
            this.nextBeat++;
            if(this.nextBeat > this.beatsInBar){
                this.nextBeat = 1;
            }
        }else{
            this.playBeat();
            this.nextBeat++;
        }
    }

    //this function is the first beats before the play metronome interval starts up again
    //deals with paused mid play
    async playBeforeMetronome(){
        //if downbeats are enabled, and nextBeat is on beat 1, playBeatAndDownBeats after nextdelay
        //else play the remaining downbeats after nextDelay
        if(this.enableDownBeat){
            await this.sleep(this.nextDownBeatDelay);
            if(this.nextBeat == 1){
                await this.playBeatAndDownBeats();
            }else{
                for(; this.nextBeat <= this.beatsInBarInBar; this.nextBeat++){
                    await this.sleep(this.downBeatDelay);
                    this.playDownBeat();
                }
            }
        }else{
            await this.sleep(this.nextDelay);
            this.playBeatAndDownBeats();
        }
    }

    async playMetronome(){
        //toggle play flag
        met.playing = true;
        
        //timer to help calculate next delay
        met.startTime = performance.now();

        //play first beat before creating and playing interval beat
        await met.playBeforeMetronome();
        if(this.metronomeInterval == undefined && met.enableDownBeat){
            this.metronomeInterval = window.setInterval(met.playNextBeat.bind(met), met.downBeatDelay);
        }else if (this.metronomeInterval == undefined && !met.enableDownBeat){
            this.metronomeInterval = window.setInterval(met.playNextBeat.bind(met), met.beatDelay);
        }
    }

    async pauseMetronome(){
        //calculate next delay in ms
        met.endTime = performance.now();
        met.calculateNextDelay();
        met.calculateNextDownBeatDelay();

        //remove intervals
        this.metronomeInterval = window.clearInterval(this.metronomeInterval);

        //toggle play flag
        met.playing = false;
    }
    
    calculateNextDelay(){
        let timeDiff = this.endTime - this.startTime;
        this.nextDelay = this.beatDelay - (timeDiff % this.beatDelay);
        return this.nextDelay;
    }
    calculateNextDownBeatDelay(){
        let timeDiff = this.endTime - this.startTime;
        this.nextDownBeatDelay = this.downBeatDelay - (timeDiff % this.downBeatDelay);
        return this.nextDownBeatDelay;
    }

    resetTimers(){
        this.startTime = 0;
        this.endTime = 0;
        this.nextDelay = 0;
        this.nextDownBeatDelay = 0;

        this.nextBeat = 1;
    }

    printMetronome(){
        console.log("Metronome".padStart(34,"*").padEnd(59, "*"));
        console.log("Playing: ", this.playing);
        console.log("BPM: ", this.bpm);
        console.log("Offset: ", this.offset);
        console.log("Downbeat Enabled: ", this.enableDownBeat);
        console.log("Beats in Bar", this.beatsInBar);
    }
}

//create metronome at popup value's bpm
let metBPM = document.querySelector("#BPM");
let met = new Metronome(metBPM.value);

//func for handling start and stop of metronome
//select button and add a handle click
let playbuttonElem = document.querySelector("#newMet");
async function handleClick(){
    if(!met.playing){
        await met.sleep(met.offset);
        await met.playMetronome();
    }else{
        await met.pauseMetronome();
    }
}
playbuttonElem.onclick = handleClick;


//Select metronome action input elements and handle input changes
//bpm input
async function bpmValueChanged(event){
    if(met.playing){
        await met.pauseMetronome();
    }
    met = new Metronome(event.target.value);
}
bpmInput.addEventListener("input", bpmValueChanged);

//offset input
async function offsetValueChanged(event){
    if(met.playing){
        await met.pauseMetronome();
    }
    met.offset = event.target.value;
}
offsetInput.addEventListener("input", offsetValueChanged);

//beats in bar input
let beatsInBarInput = document.querySelector("#beatsInBar");
async function beatsInBarChanged(event){
    if(met.playing){
        await met.pauseMetronome();
    }
    met.beatsInBar = event.target.value;
}
beatsInBarInput.addEventListener("input", beatsInBarChanged);

//enable downbeat input
let enableDownBeatInput = document.querySelector("#enableDownBeat");
async function enableDownBeatChecked(event){
    if(met.playing){
        await met.pauseMetronome();
    }
    met.enableDownBeat = event.target.checked;
}
enableDownBeatInput.addEventListener("input", enableDownBeatChecked);