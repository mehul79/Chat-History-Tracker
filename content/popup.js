// Show status message
function showStatus(message, isSuccess = true) {
    const status = document.getElementById('saveStatus');
    status.textContent = message;
    status.classList.remove('success', 'error');
    status.classList.add(isSuccess ? 'success' : 'error');
    setTimeout(() => {
        status.classList.remove('success', 'error');
    }, 3000);
}

// Get current tab URL and title
function getCurrentTabInfo(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs.length > 0) {
            const tab = tabs[0];
            callback({
                url: tab.url,
                title: tab.title
            });
        } else {
            callback(null);
        }
    });
}

// Save current chat to local storage
function saveCurrentChat() {
    getCurrentTabInfo((tabInfo) => {
        if (!tabInfo) {
            showStatus('Could not access current tab', false);
            return;
        }

        // Only save if it's a chat URL
        const validDomains = ['chat.openai.com', 'chatgpt.com', 'claude.ai', 'gemini.google.com'];
        const isValidDomain = validDomains.some(domain => tabInfo.url.includes(domain));

        if (!isValidDomain) {
            showStatus('Not a supported chat page', false);
            return;
        }

        chrome.storage.local.get(['chats'], (result) => {
            const chats = result.chats || [];
            
            // Check if URL already exists
            const existingIndex = chats.findIndex(c => c.id === tabInfo.url);
            
            if (existingIndex >= 0) {
                // Update existing chat
                chats[existingIndex].title = tabInfo.title;
                chats[existingIndex].lastSaved = new Date().toISOString();
            } else {
                // Add new chat
                chats.push({
                    id: tabInfo.url,
                    title: tabInfo.title || 'Untitled Chat',
                    url: tabInfo.url,
                    starred: false,
                    dateAdded: new Date().toISOString(),
                    lastSaved: new Date().toISOString()
                });
            }
            
            chrome.storage.local.set({ chats }, () => {
                showStatus('✓ Chat saved successfully!', true);
                loadChats();
            });
        });
    });
}

// Load and display chats
function loadChats(filterStarred = false) {
    chrome.storage.local.get(['chats'], (result) => {
        const chats = result.chats || [];
        const filtered = filterStarred ? chats.filter(chat => chat.starred) : chats;
        const chatsList = document.getElementById('chatsList');
        const emptyState = document.getElementById('emptyState');

        if (filtered.length === 0) {
            chatsList.innerHTML = '';
            emptyState.style.display = 'block';
        } else {
            emptyState.style.display = 'none';
            chatsList.innerHTML = filtered.map((chat, index) => `
                <div class="chat-item" data-id="${chat.id}">
                    <span class="chat-text">${chat.title}</span>
                    <div class="chat-actions">
                        <button class="icon-btn delete-icon" title="Delete">🗑️</button>
                    </div>
                </div>
            `).join('');

            // Add event listeners
            document.querySelectorAll('.chat-item').forEach(item => {
                item.addEventListener('click', () => {
                    chrome.tabs.create({ url: item.dataset.id });
                });
            });

            document.querySelectorAll('.delete-icon').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteChat(btn.closest('.chat-item').dataset.id);
                });
            });
        }
    });
}

function toggleStar(chatId) {
    chrome.storage.local.get(['chats'], (result) => {
        const chats = result.chats || [];
        const chat = chats.find(c => c.id === chatId);
        if (chat) {
            chat.starred = !chat.starred;
            chrome.storage.local.set({ chats }, () => {
                loadChats();
                // Check which tab is active to reload properly
                const isStarredTabActive = document.querySelector('.navBar button.active').classList.contains('star-btn');
                if (isStarredTabActive) {
                    loadChats(true);
                }
            });
        }
    });
}

function deleteChat(chatId) {
    chrome.storage.local.get(['chats'], (result) => {
        const chats = result.chats || [];
        const filtered = chats.filter(c => c.id !== chatId);
        chrome.storage.local.set({ chats: filtered }, () => {
            loadChats();
            // Preserve which tab was active
            const isStarredTabActive = document.querySelector('.navBar button.active').classList.contains('star-btn');
            if (isStarredTabActive) {
                loadChats(true);
            }
        });
    });
}

// Save button click handler
document.getElementById('saveBtn').addEventListener('click', saveCurrentChat);

// Navigation
document.querySelectorAll('.navBar button').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.navBar button').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        const isStarred = this.classList.contains('star-btn');
        loadChats(isStarred);
    });
});

// Initial load
loadChats();
