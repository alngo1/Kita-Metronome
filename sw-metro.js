//use storage.local to persist settings
//Then read about service workers/how to time beginning of metronome with start of youtube play
//Im assuming checking network or ready events

//first need service worker to 


// maybe just grab the video element then check when its ready to be played?
// grab video length to set duration of metronome
// create offset for metronome to take place
//
//I want to grab 

//ok realized my extension just works within the default popup world
/*

so what im seeing is:
- use content script to get info on video load, video length, and play or pause video
- use service worker to be storage, event manager, etc.


*/

chrome.runtime.onInstalled((event) => {

});