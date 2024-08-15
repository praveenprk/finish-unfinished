document.addEventListener('DOMContentLoaded', () => {
    console.log('YouTube Tracker: Popup opened');
    const videoList = document.getElementById('video-list');
    
    chrome.storage.local.get('videos', (result) => {
      console.log('YouTube Tracker: Retrieved from storage', result);
      const videos = result.videos || {};
      if (Object.keys(videos).length === 0) {
        console.log('YouTube Tracker: No videos found in storage');
        videoList.innerHTML = '<p>No tracked videos yet.</p>';
        return;
      }
      for (const [id, video] of Object.entries(videos)) {
        console.log('YouTube Tracker: Processing video', video);
        const videoElement = document.createElement('div');
        videoElement.className = 'video-item';
        videoElement.innerHTML = `
          <h3>${video.title || 'Untitled Video'}</h3>
          <p>Last watched: ${new Date(video.lastWatched).toLocaleString()}</p>
          <button data-id="${id}">Remove</button>
        `;
        videoList.appendChild(videoElement);
      }
    });
  });