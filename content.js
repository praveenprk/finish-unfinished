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
      try {
        chrome.runtime.sendMessage({
          action: 'videoDetected',
          videoInfo: { id: videoId, title: videoTitle, duration: videoElement.duration }
        }, response => {
          console.log('YouTube Tracker: Response from background', response);
        });

        // Set up progress tracking
        videoElement.addEventListener('timeupdate', () => {
          try {
            chrome.runtime.sendMessage({
              action: 'updateProgress',
              videoId: videoId,
              currentTime: videoElement.currentTime
            });
          } catch (error) {
            console.error('YouTube Tracker: Error sending progress update', error);
          }
        });
      } catch (error) {
        console.error('YouTube Tracker: Error sending message', error);
      }
    }
  } else {
    console.log('YouTube Tracker: No video found');
  }
}

// Run checkForVideo every 5 seconds
setInterval(checkForVideo, 5000);

// Also run it immediately
checkForVideo();