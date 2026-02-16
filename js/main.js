// 文件: js/main.js

// --- 主入口和页面导航 ---

function initializeNavigation() {
    // 从主屏幕进入各App
    document.getElementById('chat-app-icon').addEventListener('click', (event) => {
        event.preventDefault();
        renderChatList();
        showScreen('chatList');
    });
    document.getElementById('settings-app-icon').addEventListener('click', (event) => {
        event.preventDefault();
        showScreen('settings');
    });
    document.getElementById('offline-app-icon').addEventListener('click', (event) => {
        event.preventDefault();
        renderOfflineCharacterList();
        showScreen('offlineCharacterList');
    });
    
    // 从设置页进入子页面
    document.getElementById('io-option').addEventListener('click', () => showScreen('io'));
    document.getElementById('memory-analysis-option').addEventListener('click', () => {
        renderMemoryAnalysisScreen();
        showScreen('memoryAnalysis');
    });

    // 各App返回主屏幕或上一级
    document.getElementById('back-to-main-btn-from-settings').addEventListener('click', () => showScreen('main'));
    document.getElementById('chat-list-back-btn').addEventListener('click', () => {
        applyChatStyles(null);
        showScreen('main');
    });
    document.getElementById('chat-interface-back-btn').addEventListener('click', () => {
        activeCharacterId = null;
        applyChatStyles(null);
        showScreen('chatList');
    });
    document.getElementById('chat-settings-back-btn').addEventListener('click', () => {
        applyChatStyles(activeCharacterId);
        showScreen('chatInterface');
    });
    document.getElementById('io-back-btn').addEventListener('click', () => showScreen('settings'));
    document.getElementById('memory-analysis-back-btn').addEventListener('click', () => showScreen('settings'));
    
    // Offline App 返回逻辑
    document.getElementById('offline-char-list-back-btn').addEventListener('click', () => showScreen('main'));
    document.getElementById('offline-hub-back-btn').addEventListener('click', () => showScreen('offlineCharacterList'));
    document.getElementById('offline-feature-1-back-btn').addEventListener('click', () => showScreen('offlineCharacterHub'));
    document.getElementById('offline-feature-2-back-btn').addEventListener('click', () => showScreen('offlineCharacterHub'));
    document.getElementById('offline-feature-3-back-btn').addEventListener('click', () => showScreen('offlineCharacterHub'));
    document.getElementById('offline-feature-4-back-btn').addEventListener('click', () => showScreen('offlineCharacterHub'));
    // 【修改】处理新的离线聊天室返回按钮
    document.getElementById('offline-chat-back-btn').addEventListener('click', () => showScreen('offlineCharacterHub'));
    document.getElementById('auto-reply-editor-back-btn').addEventListener('click', () => showScreen('offlineFeature1'));
    document.getElementById('random-info-library-back-btn').addEventListener('click', () => showScreen('offlineFeature3'));
}

// 应用初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化各个模块的功能
    initializeNavigation();
    initializeMainScreenFeatures();
    initializeApiSettings();
    initializeChatApp();
    initializeImportExport();
    initializeOfflineApp();
    initializeReminderApp();
    // 【新增】初始化屏幕美化功能
    initializeBeautification();
    
    console.log("BlueCoze 应用已初始化。");
});
