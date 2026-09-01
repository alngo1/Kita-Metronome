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


//if video already exists then page has changed and
//need to remove "canplaythrough" event listener and once removed reset videoPrepped flag
function resetVideo() : void {
    if(video){
        video.removeEventListener("canplaythrough", () => {
            videoPrepped = false;
        });
    }
}

//select video elem, then add a listener to pause once ready and 
//set video duration
//omg only works when link for youtube website changes not refreshes
function prepareVideo(): void {
    if(videoPrepped == true) return
    const options = {once: true};
    video = document.querySelector(".html5-main-video")!;
    video.addEventListener("canplaythrough", (event) => {
        if(video){
            video.pause();
            videoPrepped = true;
            videoDuration = video.duration; //duration of vid in seconds
            console.log(videoDuration);
        }
    }, options);
    console.log(video);
}

//send message to SW to create offscreen document to ensure audio is ready
function prepareOffscreenAudio(): void{
    if(audioPrepped) return;
    (async () => {
        const res = await chrome.runtime.sendMessage({value: "sw-create-offscreen-audio", target: "service-worker"});
        if(res == true){
            audioPrepped = true;
            console.log("audio prepped!")
        } else {
            audioPrepped = false;
            console.log("failed to create offscreen audio")
        }
    })();
}

let enableKita = true;
//everytime document.body gets mutated query the video element exists/changed
//if it exists reset existing videos and prepare video and audio to play
const observer : MutationObserver = new MutationObserver((mutations) => {
    if(document.querySelector(".html5-main-video")){
        resetVideo();
        prepareVideo();
        prepareOffscreenAudio();
    }
});
const config = {childList: true, subtree: true};
observer.observe(document.body, config);

// prepareOffscreenAudio();


//document eventlisteners for spacebar press to start and stop video and metronome
let playVideoAndMetro = false;
document.addEventListener("keydown", (event) => {
    if(event.key == " "){
        playVideoAndMetro = !playVideoAndMetro;
    }
    console.log("key pressed ", event.key);
    if(playVideoAndMetro){
        if(videoPrepped && video && audioPrepped){
            video.play();
            chrome.runtime.sendMessage({value: "play-metro", target: "offscreen"});
            console.log("playing");
        }
    } else {
        if(videoPrepped && video && audioPrepped){
            video.pause();
            chrome.runtime.sendMessage({value: "pause-metro", target: "offscreen"});
            console.log("paused");
        }
    }
});