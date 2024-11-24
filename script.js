document.addEventListener('DOMContentLoaded', function() {
  const commitList = document.getElementById('commit-list');

  fetch('https://api.github.com/repos/kennydedavion/videomulti-stream/commits')
    .then(response => response.json())
    .then(data => {
      data.forEach(commit => {
        const commitItem = document.createElement('div');
        commitItem.innerHTML = `
          <strong>${commit.sha.substring(0, 7)}</strong> - ${commit.commit.message}
          <br>
          <small>${new Date(commit.commit.author.date).toLocaleString()}</small>
        `;
        commitList.appendChild(commitItem);
      });
    })
    .catch(error => console.error('Error fetching commits:', error));
});
