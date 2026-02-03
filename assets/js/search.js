(function() {
  // Search functionality using Lunr.js
  let searchIndex = null;
  let searchData = null;
  const searchInput = document.getElementById('search-input');
  const searchResults = document.getElementById('search-results');

  if (!searchInput || !searchResults) return;

  // Fetch search index
  fetch(window.location.pathname.replace(/\/[^\/]*$/, '') + '/search.json')
    .then(response => response.json())
    .then(data => {
      searchData = data;
      searchIndex = lunr(function() {
        this.ref('url');
        this.field('title', { boost: 10 });
        this.field('content');

        data.forEach(doc => {
          this.add(doc);
        });
      });
    })
    .catch(err => console.log('Search index not available:', err));

  // Search input handler
  searchInput.addEventListener('input', function(e) {
    const query = e.target.value.trim();

    if (query.length < 2) {
      searchResults.classList.remove('active');
      searchResults.innerHTML = '';
      return;
    }

    if (!searchIndex) {
      searchResults.innerHTML = '<div style="padding: 1rem; color: #666;">Loading search...</div>';
      searchResults.classList.add('active');
      return;
    }

    try {
      const results = searchIndex.search(query + '*');
      displayResults(results, query);
    } catch (err) {
      // Handle search syntax errors
      const results = searchIndex.search(query);
      displayResults(results, query);
    }
  });

  // Display search results
  function displayResults(results, query) {
    if (results.length === 0) {
      searchResults.innerHTML = '<div style="padding: 1rem; color: #666;">No results found</div>';
      searchResults.classList.add('active');
      return;
    }

    const html = results.slice(0, 8).map(result => {
      const doc = searchData.find(d => d.url === result.ref);
      if (!doc) return '';

      // Get a preview snippet
      let preview = doc.content.substring(0, 150);
      const queryLower = query.toLowerCase();
      const contentLower = doc.content.toLowerCase();
      const matchIndex = contentLower.indexOf(queryLower);

      if (matchIndex > 50) {
        preview = '...' + doc.content.substring(matchIndex - 30, matchIndex + 120) + '...';
      } else if (doc.content.length > 150) {
        preview = doc.content.substring(0, 150) + '...';
      }

      return `
        <a href="${doc.url}">
          <div class="result-title">${doc.title}</div>
          <div class="result-preview">${preview}</div>
        </a>
      `;
    }).join('');

    searchResults.innerHTML = html;
    searchResults.classList.add('active');
  }

  // Close results when clicking outside
  document.addEventListener('click', function(e) {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.remove('active');
    }
  });

  // Close results on Escape key
  searchInput.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      searchResults.classList.remove('active');
      searchInput.blur();
    }
  });
})();
