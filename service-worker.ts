//chrome dev doc code to ensure offscreen document exists
let creating: Promise<void> | null; // A global promise to avoid concurrency issues
async function setupOffscreenDocument(path: string): Promise<void> {
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
    } else {
        creating = chrome.offscreen.createDocument({
            url: path,
            //audio playback offscreen lifetime is 30s
            reasons: ['AUDIO_PLAYBACK'],
            justification: 'Used to play metronome sounds',
        });
        await creating;
        creating = null;
    }
}

//handles contentscript sending message to create the offscreen audio
function handleSWMsg(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    if (message.target !== 'sw-create-offscreen-audio') return;
    setupOffscreenDocument("offscreen.html"); //ensure offscreen exists
    sendResponse({statusCode: 200});
}
//add handleSWMsg to listeners
chrome.runtime.onMessage.addListener(handleSWMsg);