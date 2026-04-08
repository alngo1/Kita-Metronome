//handles messages: "play-metro" and "pause-metro"
function handleMessages(message: any): void{
    if(message.target !== "play-metro" && message.target !== "pause-metro"){
        return;
    }

    let metAudio: HTMLAudioElement = document.querySelector("#metAudio")!;
    if(message.target == "play-metro"){
        metAudio.play();
    } else if(message.target == "pause-metro") {
        metAudio.pause();
    }
}

//creates metronome audio element and adds to document
function createMetronome(options: {volume: number, desiredBPM: number}) : void {
    let metAudio : HTMLAudioElement = new Audio("audio/tam 4-4time 120bpm 1min.mp3");
    metAudio.setAttribute("id", "metAudio");
    metAudio.loop = true;

    metAudio.volume = options.volume;
    const audioBPM = 120.0;
    let speedFactor =  options.desiredBPM / audioBPM;
    metAudio.playbackRate = speedFactor;
    metAudio.preservesPitch = false; //i think somehow this makes it sound better because as it goes faster the imperfections in the audio timing show

    document.body.appendChild(metAudio);
}

//create and add audio element in document
let audioElemOptions = {volume: 0.4, desiredBPM: 60.0};
createMetronome(audioElemOptions);

//add listener for "play-metro" and "pause-metro"
chrome.runtime.onMessage.addListener(handleMessages);
