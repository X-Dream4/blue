// 文件: js/offline-app.js (已修改)

// 全局变量，用于追踪离线聊天模式
let currentOfflineMode = 'auto-reply';

/**
 * 初始化Offline App的所有功能, 包括Hub按钮和离线聊天界面
 */
function initializeOfflineApp() {
    // --- 为 Hub 按钮绑定事件 ---
    document.getElementById('hub-btn-1').addEventListener('click', () => {
        renderAutoReplyScreen();
        showScreen('offlineFeature1');
    });

    document.getElementById('hub-btn-2').addEventListener('click', () => {
        alert('该功能正在开发中。');
        showScreen('offlineFeature2');
    });
    
    document.getElementById('hub-btn-3').addEventListener('click', () => {
        renderRandomInfoScreen();
        showScreen('offlineFeature3');
    });

    document.getElementById('hub-btn-4').addEventListener('click', () => {
        alert('该功能正在开发中。');
        showScreen('offlineFeature4');
    });

    // --- 【修改】为 IN 按钮绑定打开离线聊天室的事件 ---
    document.getElementById('hub-btn-5').addEventListener('click', () => {
        renderOfflineChatScreen();
        showScreen('offlineChat');
    });
    
    // --- 为离线聊天室界面绑定一次性事件 ---
    initializeOfflineChatEvents();
}


// --- 以下为新增的离线聊天功能函数 ---

/**
 * 渲染离线聊天室界面
 */
function renderOfflineChatScreen() {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;

    // 重置状态
    currentOfflineMode = 'auto-reply';
    document.getElementById('offline-chat-char-name').textContent = char.nickname || char.name;
    document.getElementById('offline-messages-container').innerHTML = `<div class="message-time-label">你正在与 ${char.name} 进行离线聊天</div>`;
    document.getElementById('offline-chat-message-input').value = '';
    document.getElementById('offline-chat-input-container').classList.remove('options-visible');
    
    updateOptionSelectionUI();
}

/**
 * 在离线聊天界面中添加一条消息
 * @param {string} role 'user' 或 'assistant'
 * @param {string} content 消息内容
 */
function addMessageToOfflineScreen(role, content) {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;

    const messagesContainer = document.getElementById('offline-messages-container');
    const msgEl = document.createElement('div');
    msgEl.className = `message ${role}`;

    const userAvatar = (char.userPersonaForChar && char.userPersonaForChar.avatar) ? char.userPersonaForChar.avatar : 'https://placehold.co/40x40/a2b9d1/3c4f61?text=Me';
    const charAvatar = char.avatar || 'https://placehold.co/100x100/ffffff/89b0d6?text=?';

    msgEl.innerHTML = `<img src="${role === 'user' ? userAvatar : charAvatar}" alt="avatar" class="avatar"><div class="bubble">${content.replace(/\n/g, '<br>')}</div>`;
    
    messagesContainer.appendChild(msgEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * 处理用户发送消息的逻辑
 */
function handleOfflineSendMessage() {
    const input = document.getElementById('offline-chat-message-input');
    const messageText = input.value.trim();
    if (!messageText) return;

    addMessageToOfflineScreen('user', messageText);
    input.value = '';
    
    document.getElementById('offline-chat-input-container').classList.remove('options-visible');

    if (currentOfflineMode === 'auto-reply') {
        setTimeout(() => triggerAutoReply(messageText), 500); // 模拟思考
    }
}

/**
 * 根据用户消息触发自动回复
 * @param {string} userMessage 用户发送的消息文本
 */
function triggerAutoReply(userMessage) {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char || !char.autoReplies || char.autoReplies.length === 0) return;

    const lowerUserMessage = userMessage.toLowerCase();
    let replyFound = null;

    for (const rule of char.autoReplies) {
        for (const keyword of rule.keywords) {
            if (lowerUserMessage.includes(keyword.toLowerCase())) {
                replyFound = rule.reply;
                break;
            }
        }
        if (replyFound) break;
    }

    if (replyFound) {
        addMessageToOfflineScreen('assistant', replyFound);
    }
}

/**
 * 触发一条随机信息
 */
function triggerRandomInfo() {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;
    
    if (!char.randomInfo || char.randomInfo.length === 0) {
        addMessageToOfflineScreen('assistant', '【系统提示】角色的随机信息库是空的。');
        return;
    }

    const randomIndex = Math.floor(Math.random() * char.randomInfo.length);
    const randomInfo = char.randomInfo[randomIndex];
    const formattedMessage = `<b>[${randomInfo.category}]</b><br>${randomInfo.content}`;

    addMessageToOfflineScreen('assistant', formattedMessage);
}

/**
 * 更新选项按钮的选中状态UI
 */
function updateOptionSelectionUI() {
    const optionItems = document.querySelectorAll('#offline-chat-options .option-item');
    optionItems.forEach(item => {
        if (item.dataset.option === currentOfflineMode) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * 为离线聊天界面的所有交互元素绑定事件（仅需执行一次）
 */
function initializeOfflineChatEvents() {
    document.getElementById('offline-chat-plus-btn').addEventListener('click', () => {
        document.getElementById('offline-chat-input-container').classList.toggle('options-visible');
    });

    document.getElementById('offline-send-message-btn').addEventListener('click', handleOfflineSendMessage);
    document.getElementById('offline-chat-message-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleOfflineSendMessage();
        }
    });
    
    document.querySelectorAll('#offline-chat-options .option-item').forEach(item => {
        item.addEventListener('click', () => {
            const option = item.dataset.option;
            
            switch (option) {
                case 'auto-reply':
                    currentOfflineMode = 'auto-reply';
                    updateOptionSelectionUI();
                    break;
                case 'random-info':
                    triggerRandomInfo();
                    break;
                case 'quotes':
                case 'jokes':
                    alert('该功能正在开发中。');
                    break;
            }
            // 无论选择哪个，都关闭选项面板
            document.getElementById('offline-chat-input-container').classList.remove('options-visible');
        });
    });
}
