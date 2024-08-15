console.log('YouTube Tracker: Content script loaded');

function checkForVideo() {
  console.log('YouTube Tracker: Checking for video');
  const videoElement = document.querySelector('video');
  if (videoElement) {
    console.log('YouTube Tracker: Video found');
    const videoId = new URLSearchParams(window.location.search).get('v');
    const videoTitle = document.title;
    
    if (videoId && videoTitle) {
      console.log('YouTube Tracker: Sending video info', { videoId, videoTitle });
      chrome.runtime.sendMessage({
        action: 'videoDetected',
        videoInfo: { id: videoId, title: videoTitle, duration: videoElement.duration }
      }, response => {
        console.log('YouTube Tracker: Response from background', response);
      });
    }
  } else {
    console.log('YouTube Tracker: No video found');
  }
}

// Run checkForVideo every 5 seconds
setInterval(checkForVideo, 5000);

// Also run it immediately
checkForVideo();
/* console.log('Content script loaded');

function extractVideoInfo() {
  console.log('Attempting to extract video info');
  const videoElement = document.querySelector('video');
  if (videoElement) {
    console.log('Video element found');
    const videoId = new URLSearchParams(window.location.search).get('v');
    let videoTitle = '';
    // Try different selectors to get the video title
    const titleSelectors = [
      'h1.title',
      '#container h1.title',
      'yt-formatted-string.ytd-video-primary-info-renderer'
    ];
    for (const selector of titleSelectors) {
      const titleElement = document.querySelector(selector);
      if (titleElement && titleElement.textContent) {
        videoTitle = titleElement.textContent.trim();
        console.log('Video title found:', videoTitle);
        break;
      }
    }
    const videoDuration = videoElement.duration;
    
    if (videoId && videoTitle && videoDuration) {
      console.log('Sending video info to background script');
      chrome.runtime.sendMessage({
        action: 'videoDetected',
        videoInfo: { id: videoId, title: videoTitle, duration: videoDuration }
      }, response => {
        console.log('Response from background script:', response);
      });
    } else {
      console.log('Missing video info:', { videoId, videoTitle, videoDuration });
    }
  } else {
    console.log('No video element found');
  }
}

// Run extractVideoInfo when the page loads and periodically afterwards
function runExtraction() {
  extractVideoInfo();
  setTimeout(runExtraction, 5000); // Check every 5 seconds
}

runExtraction();

// Listen for playback updates
document.addEventListener('timeupdate', () => {
  const videoElement = document.querySelector('video');
  if (videoElement) {
    const videoId = new URLSearchParams(window.location.search).get('v');
    console.log('Sending playback update');
    chrome.runtime.sendMessage({
      action: 'updatePlaybackTime',
      videoId: videoId,
      currentTime: videoElement.currentTime
    }, response => {
      console.log('Playback update response:', response);
    });
  }
}); */