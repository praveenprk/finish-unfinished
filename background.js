chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('YouTube Tracker: Received message', message);
  if (message.action === 'videoDetected') {
    saveVideoInfo(message.videoInfo);
  } else if (message.action === 'updateProgress') {
    updateVideoProgress(message.videoId, message.currentTime);
  }
  return true;
});

function saveVideoInfo(videoInfo) {
  chrome.storage.local.get('videos', (result) => {
    let videos = result.videos || {};
    if (!videos[videoInfo.id] || videos[videoInfo.id].duration !== videoInfo.duration) {
      videos[videoInfo.id] = {
        ...videoInfo,
        lastWatched: Date.now(),
        progress: 0
      };
      chrome.storage.local.set({ videos: videos }, () => {
        console.log('YouTube Tracker: Video info saved successfully', videos[videoInfo.id]);
      });
    }
  });
}

function updateVideoProgress(videoId, currentTime) {
  chrome.storage.local.get('videos', (result) => {
    let videos = result.videos || {};
    if (videos[videoId]) {
      videos[videoId].progress = currentTime;
      videos[videoId].lastWatched = Date.now();
      chrome.storage.local.set({ videos: videos }, () => {
        console.log('YouTube Tracker: Video progress updated', videos[videoId]);
      });
    }
  });
}

function checkUnwatchedVideos() {
  chrome.storage.local.get('videos', (result) => {
    const videos = result.videos || {};
    const unwatched = Object.values(videos).filter(v => v.progress / v.duration < 0.9); // Consider videos watched less than 90% as unwatched
    if (unwatched.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icon.png',
        title: 'Unwatched Videos Reminder',
        message: `You have ${unwatched.length} unwatched or partially watched videos. Don't forget to finish them!`
      });
    }
  });
}

// Run checkUnwatchedVideos every hour
chrome.alarms.create('checkUnwatched', { periodInMinutes: 60 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkUnwatched') {
    checkUnwatchedVideos();
  }
});

// Also check when the browser starts
chrome.runtime.onStartup.addListener(checkUnwatchedVideos);