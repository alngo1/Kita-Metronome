"use strict";
//chrome dev doc code to ensure offscreen document exists
let creating; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path) {
    // Check all windows controlled by the service worker to see if one
    // of them is the offscreen document with the given path
    const offscreenUrl = chrome.runtime.getURL(path);
    const existingContexts = await chrome.runtime.getContexts({
        contextTypes: ['OFFSCREEN_DOCUMENT'],
        documentUrls: [offscreenUrl]
    });
    if (existingContexts.length > 0) {
        return;
    }
    // create offscreen document
    if (creating) {
        await creating;
    }
    else {
        creating = chrome.offscreen.createDocument({
            url: path,
            //audio playback offscreen lifetime is 30s
            reasons: [chrome.offscreen.Reason.AUDIO_PLAYBACK],
            justification: 'Used to play metronome sounds',
        })
            .catch(e => console.log(e));
        await creating;
        creating = null;
    }
}
//handles contentscript sending message to create the offscreen audio
function handleSWMsg(message, sender, sendResponse) {
    if (message.target !== "service-worker")
        return;
    //ensure offscreen exists
    (async () => {
        await setupOffscreenDocument("src/offscreen/offscreen.html");
    })()
        .catch(e => console.log(e));
    sendResponse({ statusCode: 200 });
}
//add handleSWMsg to listeners
chrome.runtime.onMessage.addListener(async () => {
    try {
        await setupOffscreenDocument("src/offscreen/offscreen.html");
    }
    catch (error) {
        console.log(error);
    }
    return true;
});
//# sourceMappingURL=service-worker.js.map