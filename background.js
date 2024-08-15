let videoProgressCache = {};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
      chrome.storage.local.set({ videos: videos });
    }
  });
}

function updateVideoProgress(videoId, currentTime) {
  if (!videoProgressCache[videoId]) {
    videoProgressCache[videoId] = { lastUpdate: 0, progress: 0 };
  }
  
  const now = Date.now();
  if (now - videoProgressCache[videoId].lastUpdate > 5000 || 
      Math.abs(currentTime - videoProgressCache[videoId].progress) > 5) {
    videoProgressCache[videoId] = { lastUpdate: now, progress: currentTime };
    
    chrome.storage.local.get('videos', (result) => {
      let videos = result.videos || {};
      if (videos[videoId]) {
        videos[videoId].progress = currentTime;
        videos[videoId].lastWatched = now;
        chrome.storage.local.set({ videos: videos });
      }
    });
  }
}

function checkUnwatchedVideos() {
  chrome.storage.local.get('videos', (result) => {
    const videos = result.videos || {};
    const unwatched = Object.values(videos).filter(v => v.progress / v.duration < 0.9);
    if (unwatched.length > 0) {
      chrome.notifications.create({
        type: 'basic',
        title: 'Unwatched Videos Reminder',
        message: `You have ${unwatched.length} unwatched or partially watched videos.`,
        iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=='
      }, (notificationId) => {
        if (chrome.runtime.lastError) {
          console.error('Notification error:', chrome.runtime.lastError);
        }
      });
    }
  });
}

chrome.alarms.create('checkUnwatched', { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'checkUnwatched') {
    checkUnwatchedVideos();
  }
});

chrome.runtime.onStartup.addListener(checkUnwatchedVideos);

// For testing purposes, you can uncomment the following line to check for unwatched videos immediately
setTimeout(checkUnwatchedVideos, 5000);