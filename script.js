document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('show');
        });
    }

    // Client Page Functionality
    if (document.querySelector('.client-page')) {
        initClientPage();
    }

    // Browse Page Functionality
    if (document.querySelector('.browse-page')) {
        initBrowsePage();
    }
});

// Client Page Functions
function initClientPage() {
    // Filter torrents by status
    const filterLinks = document.querySelectorAll('.sidebar li');
    const torrentRows = document.querySelectorAll('#torrent-table-body tr');
    
    filterLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Update active state
            filterLinks.forEach(item => item.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            // Filter the torrent rows
            torrentRows.forEach(row => {
                const status = row.getAttribute('data-status');
                if (filter === 'all' || filter === status) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
            
            // Update displayed torrent count
            updateTorrentCount();
        });
    });
    
    // Search functionality
    const searchInput = document.getElementById('client-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            torrentRows.forEach(row => {
                const torrentName = row.children[1].textContent.toLowerCase();
                if (torrentName.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
            
            updateTorrentCount();
        });
    }
    
    // Add Torrent Modal
    const addTorrentBtn = document.getElementById('add-torrent-btn');
    const addTorrentModal = document.getElementById('add-torrent-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.cancel-btn');
    const addTorrentForm = document.getElementById('add-torrent-form');
    
    if (addTorrentBtn && addTorrentModal) {
        addTorrentBtn.addEventListener('click', function() {
            addTorrentModal.classList.add('show');
        });
        
        closeModalBtn.addEventListener('click', function() {
            addTorrentModal.classList.remove('show');
        });
        
        cancelBtn.addEventListener('click', function() {
            addTorrentModal.classList.remove('show');
        });
        
        addTorrentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const torrentUrl = document.getElementById('torrent-url').value;
            const torrentFile = document.getElementById('torrent-file').value;
            
            if (!torrentUrl && !torrentFile) {
                alert('Please provide a torrent URL or file');
                return;
            }
            
            // Simulate adding a torrent
            simulateAddTorrent(torrentUrl || torrentFile);
            
            // Clear form and close modal
            this.reset();
            addTorrentModal.classList.remove('show');
        });
    }
    
    // Button functionality (play, pause, stop)
    document.getElementById('play-btn').addEventListener('click', function() {
        const selectedRows = getSelectedRows();
        if (selectedRows.length === 0) {
            alert('Please select a torrent first');
            return;
        }
        
        selectedRows.forEach(row => {
            if (row.getAttribute('data-status') !== 'completed') {
                row.setAttribute('data-status', 'active');
                row.children[4].textContent = 'Active';
                
                // Update speeds randomly
                const downSpeed = (Math.random() * 3 + 1).toFixed(1) + ' MB/s';
                const upSpeed = (Math.random() * 1.5).toFixed(1) + ' MB/s';
                row.children[7].textContent = downSpeed;
                row.children[8].textContent = upSpeed;
            }
        });
        
        updateStatusBar();
    });
    
    document.getElementById('pause-btn').addEventListener('click', function() {
        const selectedRows = getSelectedRows();
        if (selectedRows.length === 0) {
            alert('Please select a torrent first');
            return;
        }
        
        selectedRows.forEach(row => {
            if (row.getAttribute('data-status') !== 'completed') {
                row.setAttribute('data-status', 'inactive');
                row.children[4].textContent = 'Inactive';
                row.children[7].textContent = '0 KB/s';
                row.children[8].textContent = '0 KB/s';
            }
        });
        
        updateStatusBar();
    });
    
    document.getElementById('stop-btn').addEventListener('click', function() {
        const selectedRows = getSelectedRows();
        if (selectedRows.length === 0) {
            alert('Please select a torrent first');
            return;
        }
        
        if (confirm('Are you sure you want to stop the selected torrents?')) {
            selectedRows.forEach(row => {
                row.remove();
            });
            
            updateTorrentCount();
            updateStatusBar();
        }
    });
    
    // Make table rows selectable
    torrentRows.forEach(row => {
        row.addEventListener('click', function(e) {
            if (e.ctrlKey) {
                this.classList.toggle('selected');
            } else {
                torrentRows.forEach(r => r.classList.remove('selected'));
                this.classList.add('selected');
            }
        });
    });
    
    // Initialize the UI
    updateTorrentCount();
    updateStatusBar();
    
    // Simulated downloading progress
    setInterval(updateDownloadProgress, 2000);
}

function updateTorrentCount() {
    const visibleTorrents = Array.from(document.querySelectorAll('#torrent-table-body tr')).filter(row => row.style.display !== 'none');
    const countElement = document.getElementById('torrent-count');
    if (countElement) {
        countElement.textContent = visibleTorrents.length;
    }
}

function updateStatusBar() {
    let totalDownSpeed = 0;
    let totalUpSpeed = 0;
    
    const activeTorrents = Array.from(document.querySelectorAll('#torrent-table-body tr')).filter(row => 
        row.style.display !== 'none' && row.getAttribute('data-status') === 'active'
    );
    
    activeTorrents.forEach(row => {
        const downSpeedText = row.children[7].textContent;
        const upSpeedText = row.children[8].textContent;
        
        if (downSpeedText.includes('MB')) {
            totalDownSpeed += parseFloat(downSpeedText);
        } else if (downSpeedText.includes('KB')) {
            totalDownSpeed += parseFloat(downSpeedText) / 1000;
        }
        
        if (upSpeedText.includes('MB')) {
            totalUpSpeed += parseFloat(upSpeedText);
        } else if (upSpeedText.includes('KB')) {
            totalUpSpeed += parseFloat(upSpeedText) / 1000;
        }
    });
    
    document.getElementById('down-speed').textContent = totalDownSpeed.toFixed(1) + ' MB/s';
    document.getElementById('up-speed').textContent = totalUpSpeed.toFixed(1) + ' MB/s';
}

function getSelectedRows() {
    return Array.from(document.querySelectorAll('#torrent-table-body tr.selected'));
}

function updateDownloadProgress() {
    const activeTorrents = Array.from(document.querySelectorAll('#torrent-table-body tr[data-status="active"]'));
    
    activeTorrents.forEach(row => {
        const progressBar = row.querySelector('.progress');
        const currentWidth = parseFloat(progressBar.style.width) || 0;
        
        if (currentWidth < 100) {
            const newWidth = Math.min(currentWidth + Math.random() * 5, 100);
            progressBar.style.width = newWidth + '%';
            
            if (newWidth === 100) {
                row.setAttribute('data-status', 'completed');
                row.children[4].textContent = 'Completed';
                row.children[7].textContent = '0 KB/s';
                row.children[8].textContent = '0 KB/s';
            }
        }
    });
    
    updateStatusBar();
}

function simulateAddTorrent(torrentSource) {
    const tableBody = document.getElementById('torrent-table-body');
    const rowCount = tableBody.children.length;
    
    // Extract file name from the url or path
    const fileName = torrentSource.split('/').pop().split('?')[0] || 'New Torrent';
    
    // Create a new row
    const newRow = document.createElement('tr');
    newRow.setAttribute('data-status', 'downloading');
    
    newRow.innerHTML = `
        <td>${rowCount + 1}</td>
        <td>${fileName}</td>
        <td>${(Math.random() * 5 + 0.5).toFixed(1)} GB</td>
        <td>
            <div class="progress-bar">
                <div class="progress" style="width: 0%"></div>
            </div>
        </td>
        <td>Downloading</td>
        <td>${Math.floor(Math.random() * 50 + 5)}</td>
        <td>${Math.floor(Math.random() * 20 + 1)}</td>
        <td>${(Math.random() * 3 + 0.5).toFixed(1)} MB/s</td>
        <td>${(Math.random() * 1.5).toFixed(1)} MB/s</td>
    `;
    
    // Make the new row selectable
    newRow.addEventListener('click', function(e) {
        if (e.ctrlKey) {
            this.classList.toggle('selected');
        } else {
            Array.from(document.querySelectorAll('#torrent-table-body tr')).forEach(r => r.classList.remove('selected'));
            this.classList.add('selected');
        }
    });
    
    tableBody.appendChild(newRow);
    updateTorrentCount();
    updateStatusBar();
}

// Browse Page Functions
function initBrowsePage() {
    // Search functionality
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('browse-search');
    
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', function() {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Simulate search - would normally involve an API call
                alert(`Searching for: ${searchTerm}`);
                
                // For demo purposes we'll just reload the page
                // window.location.href = `browse.html?search=${encodeURIComponent(searchTerm)}`;
            }
        });
        
        // Allow pressing Enter to search
        searchInput.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            const category = this.value;
            if (category) {
                // Simulate filtering - would normally involve an API call
                alert(`Filtering by category: ${category}`);
                
                // For demo purposes we'll just reload the page
                // window.location.href = `browse.html?category=${encodeURIComponent(category)}`;
            }
        });
    }
    
    // Sort selector
    const sortBy = document.getElementById('sort-by');
    if (sortBy) {
        sortBy.addEventListener('change', function() {
            const sortMethod = this.value;
            if (sortMethod) {
                // Simulate sorting - would normally involve an API call
                alert(`Sorting by: ${sortMethod}`);
                
                // For demo purposes we'll just reload the page
                // window.location.href = `browse.html?sort=${encodeURIComponent(sortMethod)}`;
            }
        });
    }
    
    // Download and Magnet buttons
    const downloadButtons = document.querySelectorAll('.download-btn');
    const magnetButtons = document.querySelectorAll('.magnet-btn');
    
    downloadButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const torrentName = this.closest('.torrent-item').querySelector('h3 a').textContent;
            alert(`Download started: ${torrentName}\nThis would typically download a .torrent file`);
        });
    });
    
    magnetButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const torrentName = this.closest('.torrent-item').querySelector('h3 a').textContent;
            alert(`Opening magnet link: ${torrentName}\nThis would typically open your default torrent client`);
        });
    });
    
    // Pagination
    const pageLinks = document.querySelectorAll('.page-number, .page-nav');
    
    pageLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Update active page
            document.querySelectorAll('.page-number').forEach(page => {
                page.classList.remove('active');
            });
            
            if (this.classList.contains('page-number')) {
                this.classList.add('active');
            }
            
            // Simulate page navigation - would normally involve an API call
            if (this.classList.contains('prev-page')) {
                alert('Navigate to previous page');
            } else if (this.classList.contains('next-page')) {
                alert('Navigate to next page');
            } else {
                alert(`Navigate to page ${this.textContent}`);
            }
            
            // Scroll to top
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });
} 