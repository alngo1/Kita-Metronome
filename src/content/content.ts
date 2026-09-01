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
function prepareVideo(): void {
    if(videoPrepped) return;
    video = document.querySelector(".html5-main-video")!;
    const options = {once: true};
    video.addEventListener("canplaythrough", (event) => {
        if(video){
            video.pause();
            videoPrepped = true;
            videoDuration = video.duration; //duration of vid in seconds
            console.log(videoDuration);
        }
    }, options);
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
    if(enableKita && document.querySelector(".html5-main-video")){
        if(!videoPrepped){
            prepareVideo();
        }
        if(!audioPrepped){
            prepareOffscreenAudio();
        }
    } else if(document.querySelector(".html5-main-video") == null){
        videoPrepped = false;
        audioPrepped = false;
    }
});
const config = {childList: true, subtree: true};
observer.observe(document.body, config);

//document eventlisteners for spacebar press to start and stop video and metronome
document.addEventListener("keydown", (event) => {
    console.log(videoPrepped, Boolean(video), audioPrepped);
    if(videoPrepped && video && audioPrepped){
        video.play();
        chrome.runtime.sendMessage({value: "play-metro", target: "offscreen"});
        console.log("playing");
    } else if (!video || (video && video.paused == false)){ //if already playing or lost connection to video need to pause video
        video?.pause();
        chrome.runtime.sendMessage({value: "pause-metro", target: "offscreen"});
        console.log("paused");
    }
});