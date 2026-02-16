// 文件: js/ui-chat.js (全新)

function renderChatList() {
    loadCharacters(); 
    const container = document.getElementById('chat-list-container');
    container.innerHTML = '';
    if (characters.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.7;">还没有角色，点击右上角 "+" 创建一个吧。</p>';
        return;
    }
    characters.forEach(char => {
        const charEl = document.createElement('div');
        charEl.className = 'chat-list-item';
        charEl.dataset.id = char.id;
        const displayName = char.nickname || char.name;
        charEl.innerHTML = `
            <img src="${char.avatar || 'https://placehold.co/100x100/ffffff/89b0d6?text=?'}" alt="${displayName}">
            <span class="name">${displayName}</span>
        `;
        charEl.addEventListener('click', () => {
            activeCharacterId = char.id;
            applyChatStyles(char.id); 
            renderChatInterface();
            showScreen('chatInterface');
        });
        container.appendChild(charEl);
    });
}

function renderChatInterface() {
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) {
        showScreen('chatList');
        return;
    };
    initializeDataDefaults(char);

    document.getElementById('chat-character-name').textContent = char.nickname || char.name;
    document.getElementById('api-reply-btn').querySelector('img').src = char.chatSettings.apiReplyIcon;

    const messagesContainer = document.getElementById('messages-container');
    const oldScrollHeight = messagesContainer.scrollHeight;
    const oldScrollTop = messagesContainer.scrollTop;
    const isAtBottom = oldScrollHeight - messagesContainer.clientHeight <= oldScrollTop + 1;
    
    messagesContainer.innerHTML = '';
    
    const settings = char.chatSettings;
    let displayCount = settings.displayCount;
    const totalMessages = char.chatHistory.length;

    if (totalMessages > displayCount) {
        const loadMoreBtn = document.createElement('button');
        loadMoreBtn.className = 'load-more-btn';
        loadMoreBtn.textContent = '加载更早的消息';
        loadMoreBtn.onclick = () => {
            char.chatSettings.displayCount += 50;
            saveCharacters();
            renderChatInterface();
        };
        messagesContainer.appendChild(loadMoreBtn);
    }
    
    const messagesToRender = char.chatHistory.slice(-displayCount);

    let lastTimestamp = 0;
    messagesToRender.forEach((msg, index) => { 
        if (!msg.timestamp) return;
        const currentTimestamp = new Date(msg.timestamp).getTime();
        
        const isFirstInView = index === 0;
        if ((isFirstInView && totalMessages > displayCount) || (!lastTimestamp || currentTimestamp - lastTimestamp > 5 * 60 * 1000)) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'message-time-label';
            timeLabel.textContent = formatTimestamp(currentTimestamp);
            messagesContainer.appendChild(timeLabel);
        }
        const msgEl = createMessageElement(msg.role, msg.content, char.avatar, msg.thought, `${char.id}-msg-${totalMessages - displayCount + index}`);
        messagesContainer.appendChild(msgEl);
        lastTimestamp = currentTimestamp;
    });
    
    setTimeout(() => {
        const newScrollHeight = messagesContainer.scrollHeight;
        if (isAtBottom && newScrollHeight > oldScrollHeight) { 
            messagesContainer.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
        } else {
            messagesContainer.scrollTop = messagesContainer.scrollHeight; 
        }
    }, 0);
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    if (date >= today) return timeString;
    if (date >= yesterday) return `昨天 ${timeString}`;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${timeString}`;
}

function createMessageElement(role, content, avatarUrl, thought, uniqueId) {
    const msgEl = document.createElement('div');
    msgEl.className = `message ${role}`;
    
    const char = characters.find(c => c.id === activeCharacterId);
    const userAvatar = (char && char.userPersonaForChar && char.userPersonaForChar.avatar) ? char.userPersonaForChar.avatar : 'https://placehold.co/40x40/a2b9d1/3c4f61?text=Me';
    const charAvatar = avatarUrl || 'https://placehold.co/100x100/ffffff/89b0d6?text=?';

    if (role === 'user' || !thought) {
        msgEl.innerHTML = `<img src="${role === 'user' ? userAvatar : charAvatar}" alt="avatar" class="avatar"><div class="bubble">${content.replace(/\n/g, '<br>')}</div>`;
        return msgEl;
    }
    
    msgEl.innerHTML = `
        <img src="${charAvatar}" alt="avatar" class="avatar">
        <div class="message-content-wrapper">
            <div id="thought-${uniqueId}" class="thought-bubble hidden">${thought}</div>
            <div class="bubble clickable">${content.replace(/\n/g, '<br>')}</div>
        </div>
    `;
    
    const bubble = msgEl.querySelector('.bubble.clickable');
    bubble.addEventListener('click', () => {
        document.getElementById(`thought-${uniqueId}`).classList.toggle('hidden');
    });

    return msgEl;
}

function applyChatStyles(charId, tempSettings = null) {
    let settings;
    if (tempSettings) {
        settings = tempSettings;
    } else {
        const char = charId ? characters.find(c => c.id === charId) : null;
        if (!char || !char.chatSettings) {
            document.getElementById('chat-interface-screen').style.backgroundImage = '';
            document.getElementById('dynamic-chat-styles').innerHTML = '';
            return;
        };
        settings = char.chatSettings;
    }
    
    const bs = settings.bubbleStyles;
    const styleTag = document.getElementById('dynamic-chat-styles');
    if (!styleTag) return;

    const chatScreen = document.getElementById('chat-interface-screen');
    chatScreen.style.backgroundImage = settings.chatBackground ? `url('${settings.chatBackground}')` : '';

    const cssString = `
        :root {
            --bubble-scale: ${bs.scale / 100};
            --bubble-main-radius: ${bs.mainRadius}px;
            --bubble-corner-radius: ${bs.cornerRadius}px;
            --bubble-font-size: ${bs.fontSize}px;
            --bubble-shadow: 0 ${bs.shadow * 0.5}px ${bs.shadow * 1.5}px rgba(0, 0, 0, ${bs.shadow * 0.02});
            --user-bubble-bg: hsl(${bs.userHue}, ${bs.userSaturation}%, ${bs.userLightness}%);
            --char-bubble-bg: hsl(${bs.charHue}, ${bs.charSaturation}%, ${bs.charLightness}%);
        }
        ${bs.customCSS}
    `;

    styleTag.innerHTML = cssString;
}
