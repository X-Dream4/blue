// --- 全局变量、常量和DOM元素引用 ---

// 数据存储键
const API_SETTINGS_KEY = 'ai_phone_api_settings';
const CHARACTERS_KEY = 'ai_phone_characters';

// 全局状态变量
let activeCharacterId = null;
let characters = [];

// DOM 元素引用
const DOM = {
    mainScreen: document.getElementById('main-screen'),
    // App 屏幕
    screens: {
        settings: document.getElementById('settings-screen'),
        chatList: document.getElementById('chat-list-screen'),
        chatInterface: document.getElementById('chat-interface-screen'),
        characterSettings: document.getElementById('character-settings-screen'),
        chatSettings: document.getElementById('chat-settings-screen'),
        // 【新增】内存分析屏幕
        memoryAnalysis: document.getElementById('memory-analysis-screen'),
        // Offline App 相关屏幕
        offlineCharacterList: document.getElementById('offline-character-list-screen'),
        offlineCharacterHub: document.getElementById('offline-character-hub-screen'),
        offlineFeature1: document.getElementById('offline-feature-1-screen'),
        offlineFeature2: document.getElementById('offline-feature-2-screen'),
        offlineFeature3: document.getElementById('offline-feature-3-screen'),
        offlineFeature4: document.getElementById('offline-feature-4-screen'),
        offlineFeature5: document.getElementById('offline-feature-5-screen'),
        offlineRandomInfoLibrary: document.getElementById('offline-random-info-library-screen'),
    },
    // API 设置模态框
    apiSettingsModal: document.getElementById('api-settings-modal'),
    modalOverlay: document.getElementById('modal-overlay'),
    apiForm: {
        url: document.getElementById('api-url'),
        key: document.getElementById('api-key'),
        modelSelect: document.getElementById('model-select'),
        form: document.getElementById('api-form'),
        fetchBtn: document.getElementById('fetch-models-btn'),
    },
    // Chat App
    chat: {
        listContainer: document.getElementById('chat-list-container'),
        interfaceName: document.getElementById('chat-character-name'),
        messagesContainer: document.getElementById('messages-container'),
        messageInput: document.getElementById('chat-message-input'),
        typingIndicator: document.getElementById('typing-indicator'),
        optionsDropdown: document.getElementById('character-options-dropdown'),
    },
    // 角色设置
    charSettingsForm: {
        preview: document.getElementById('char-avatar-preview'),
        uploadInput: document.getElementById('char-avatar-upload'),
        urlInput: document.getElementById('char-avatar-url'),
        name: document.getElementById('char-name'),
        birthdate: document.getElementById('char-birthdate'),
        persona: document.getElementById('char-persona'),
        scheduleContainer: document.getElementById('schedule-container'),
        offlineCorpus: document.getElementById('char-offline-corpus'),
    }
};
