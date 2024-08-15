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
          <p>Duration: ${video.duration ? video.duration.toFixed(2) + 's' : 'N/A'}</p>
          <p>Last watched: ${video.lastWatched ? new Date(video.lastWatched).toLocaleString() : 'N/A'}</p>
          <button class="remove-btn" data-id="${id}">Remove</button>
        `;
        videoList.appendChild(videoElement);
      }
      
      // Add event listeners for remove buttons
      document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', function() {
          const videoId = this.getAttribute('data-id');
          removeVideo(videoId, this.closest('.video-item'));
        });
      });
    });
  });
  
  function removeVideo(videoId, element) {
    chrome.storage.local.get('videos', (result) => {
      const videos = result.videos || {};
      delete videos[videoId];
      chrome.storage.local.set({ videos: videos }, () => {
        element.remove();
        console.log('YouTube Tracker: Video removed', videoId);
        // Refresh the popup if all videos are removed
        if (Object.keys(videos).length === 0) {
          location.reload();
        }
      });
    });
  }