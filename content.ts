//TODO:
//  could also edit the seek time with video.currentTime property (also in secs)
//  use setTimeout() or service worker alarm for set some timer to continue play of metronome

//  (assuming ext is on) click video > pauses/preps video > 
//  msg service worker to ensure offscreen > offscreen returns response audio prepped
//  calculates metronome length > press space > start video and metronome

//ensure playback rate of video
//edit bpm of metronome and any necessary offset in popup
//refresh page after modification in chrome extension

let video: HTMLVideoElement | null = null;
let videoPrepped: boolean = false;
let audioPrepped: boolean = false;
let videoDuration: number = 0;


//if video already exists then page has changed and i'll 
//need to remove event listener and once removed reset videoPrepped flag
function resetVideo() : void {
    if(video){
        video.removeEventListener("canplaythrough", () => {
            videoPrepped = false;
        });
    }
}

//select video elem, then add a listener to pause once ready and 
//set video duration
function prepareVideo(): void {
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
}

//send message to SW to create offscreen document to ensure audio is ready
function prepareOffscreenAudio(): void{
    chrome.runtime.sendMessage({target: "sw-create-offscreen-audio"}, (response) => {
        if(response.statusCode == 200){
            audioPrepped = true;
            console.log("audio prepped!")
        } else {
            audioPrepped = false;
            console.log("failed to create offscreen audio")
        }
    });
}

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


//document eventlisteners for spacebar press to start and stop video and metronome
let playVideoAndMetro = false;
document.addEventListener("keydown", (event) => {
    if(event.key == " "){
        playVideoAndMetro = !playVideoAndMetro;
    }
});

document.addEventListener("keyup", () => {
    if(playVideoAndMetro){
        if(videoPrepped && video && audioPrepped){
            video.play();
            chrome.runtime.sendMessage({target: "play-metro"});
            console.log("playing");
        }
    } else {
        if(videoPrepped && video && audioPrepped){
            video.pause();
            chrome.runtime.sendMessage({target: "pause-metro"});
            console.log("paused");
        }
    }
});