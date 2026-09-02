//TODO:
//  could also edit the seek time with video.currentTime property (also in secs)
//  use setTimeout() or service worker alarm for set some timer to continue play of metronome


//HOW EXTENSION WORKS:
//  (assuming ext is on) click video > pauses/preps video > 
//  msg service worker to ensure offscreen > offscreen returns response audio prepped
//  calculates metronome length > press space > start video and metronome


//var for youtube video element
let video: HTMLVideoElement | null = null;

//vars for whether video and metronome audio are prepped before playing
let videoPrepped: boolean = false;
let audioPrepped: boolean = false;

//var for lenght of video in ms?
let videoDuration: number = 0;


//select video elem, then add a listener to pause once ready and 
//set video duration
//omg only works when link for youtube website changes not refreshes
function handleCanPlayThrough(event: any){
    if(video){
        // video.load();
        video.pause();
        videoPrepped = true;
        videoDuration = video.duration; //duration of vid in seconds
        console.log(videoDuration);
    }
}

async function handlePlay(event: any){
    if(event.target.play){
        await chrome.runtime.sendMessage({value: "play-metro", target: "offscreen"});
    } else {
        await chrome.runtime.sendMessage({value: "pause-metro", target: "offscreen"});
    }
}

function resetVideo(): void{
    if(video){
        video.removeEventListener("canplaythrough", handleCanPlayThrough);
    }
}

function prepareVideo(): void {
    if(videoPrepped) return;
    video = document.querySelector(".html5-main-video")!;
    const options = {once: true};
    video.addEventListener("canplaythrough", handleCanPlayThrough, options);
    video.addEventListener("play", handlePlay, options);
}

//send message to SW to create offscreen document to ensure audio is ready
function prepareOffscreenAudio(): void{
    if(audioPrepped) return;
    (async () => {
        const res = await chrome.runtime.sendMessage({value: "sw-create-offscreen-audio", target: "service-worker"});
        if(res == true){
            console.log("audio prepped!")
            audioPrepped = true;
        } else {
            console.log("failed to create offscreen audio")
            audioPrepped = false;
        }
    })();
}

let enableKita = true;
//everytime document.body gets mutated query the video element exists/changed
//if it exists reset existing videos and prepare video and audio to play
const observer : MutationObserver = new MutationObserver((mutations) => {
    resetVideo();
    if(enableKita && document.querySelector(".html5-main-video") != null){
        if(!videoPrepped){
            prepareVideo();
        }
        if(!audioPrepped){
            prepareOffscreenAudio();
        }
    } else {
        console.log("stop")
        audioPrepped = false;
        chrome.runtime.sendMessage({value: "pause-metro", target: "offscreen"});
    }
});
const config = {childList: true, subtree: true};
observer.observe(document.body, config);

//document eventlisteners for spacebar press to start and stop video and metronome
let playMetAndVid = false;
document.addEventListener("keydown", async (event) => {
    event.preventDefault();
    playMetAndVid = !playMetAndVid;
    console.log(playMetAndVid, videoPrepped, Boolean(video), audioPrepped);
    if(playMetAndVid && videoPrepped && video && audioPrepped){
        console.log("all true");
        await chrome.runtime.sendMessage({value: "play-metro", target: "offscreen"});
        console.log("playing");
    } else {
        await chrome.runtime.sendMessage({value: "pause-metro", target: "offscreen"});
        console.log("paused");
    }
});