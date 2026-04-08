var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
//chrome dev doc code to ensure offscreen document exists
let creating; // A global promise to avoid concurrency issues
function setupOffscreenDocument(path) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check all windows controlled by the service worker to see if one
        // of them is the offscreen document with the given path
        const offscreenUrl = chrome.runtime.getURL(path);
        const existingContexts = yield chrome.runtime.getContexts({
            contextTypes: ['OFFSCREEN_DOCUMENT'],
            documentUrls: [offscreenUrl]
        });
        if (existingContexts.length > 0) {
            return;
        }
        // create offscreen document
        if (creating) {
            yield creating;
        }
        else {
            creating = chrome.offscreen.createDocument({
                url: path,
                //audio playback offscreen lifetime is 30s
                reasons: ['AUDIO_PLAYBACK'],
                justification: 'Used to play metronome sounds',
            });
            yield creating;
            creating = null;
        }
    });
}
//handles contentscript sending message to create the offscreen audio
function handleSWMsg(message, sender, sendResponse) {
    if (message.target !== 'sw-create-offscreen-audio')
        return;
    setupOffscreenDocument("offscreen.html"); //ensure offscreen exists
    sendResponse({ statusCode: 200 });
}
//add handleSWMsg to listeners
chrome.runtime.onMessage.addListener(handleSWMsg);
//# sourceMappingURL=service-worker.js.map