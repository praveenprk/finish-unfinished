console.log('YouTube Tracker: Background script loaded');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('YouTube Tracker: Received message', message);
  if (message.action === 'videoDetected') {
    saveVideoInfo(message.videoInfo);
  }
  return true; // Keeps the message channel open for asynchronous response
});

function saveVideoInfo(videoInfo) {
  console.log('YouTube Tracker: Attempting to save video info', videoInfo);
  chrome.storage.local.get('videos', (result) => {
    console.log('YouTube Tracker: Current storage state', result);
    let videos = result.videos || {};
    videos[videoInfo.id] = {
      ...videoInfo,
      lastWatched: Date.now()
    };
    chrome.storage.local.set({ videos: videos }, () => {
      if (chrome.runtime.lastError) {
        console.error('YouTube Tracker: Error saving data', chrome.runtime.lastError);
      } else {
        console.log('YouTube Tracker: Video info saved successfully', videos);
      }
      // Verify the data was actually saved
      chrome.storage.local.get('videos', (checkResult) => {
        console.log('YouTube Tracker: Verification - current storage state', checkResult);
      });
    });
  });
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('YouTube Tracker: Extension installed');
});