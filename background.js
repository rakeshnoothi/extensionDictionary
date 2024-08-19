const dictionaryUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
        try {
            const response = await fetch(
                `${dictionaryUrl}${request.queryWord}`
            );
            const data = await response.json();
            sendResponse({ data: data });
        } catch (error) {
            sendResponse({ error: error.message });
        }
    })();
    return true;
});
