document.addEventListener("yt-navigate-finish", callback);

function collectYTData(video : any) : void {
    if(!video){
        return;
    };

    console.log(video);
}


const observer : MutationObserver = new MutationObserver((mutations) => {
    for(const mutation of mutations){
        console.log(mutation);
        for(const node of mutation.addedNodes){
            if(node instanceof Element && node.className === "html5-main-video"){
                console.log(node);
                collectYTData(node);
            }
        }
    }
})


const config = {attributes: true, childList: true, subtree: true};
observer.observe(document.querySelector(".html5-main-video")!, config);
//there exists an observer.disconnect() but save for service worker?

console.log("hello anything?");
console.log(document.querySelector(".html5-main-video"));