// 文件: js/ui-core.js

// --- 数据处理函数 ---

function loadCharacters() {
    characters = JSON.parse(localStorage.getItem(CHARACTERS_KEY)) || [];
    characters.forEach(initializeDataDefaults);
}
function saveCharacters() {
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(characters));
}

function initializeDataDefaults(char) {
    if (!char) return;
    if (!char.nickname) char.nickname = '';
    if (!char.chatHistory) char.chatHistory = [];
    if (!char.autoReplies) char.autoReplies = [];
    if (!char.randomInfo) char.randomInfo = [];
    if (!char.autoReplyRestrictions) char.autoReplyRestrictions = '';
    // 【新增】为角色数据添加关联的Reminder条目ID数组
    if (!char.linkedReminderItemIds) char.linkedReminderItemIds = [];
    
    if (!char.timeAwareness) {
        char.timeAwareness = {
            enabled: true,
            charTimezone: 'Asia/Shanghai',
            knowsUserTimezone: true,
            userTimezone: 'auto',
            holidaysEnabled: true,
            charHolidayCountry: 'CN',
            userHolidayCountry: 'CN',
            knowsUserHolidays: true
        };
    }

    const defaultBubbleStyles = {
        scale: 100, mainRadius: 20, cornerRadius: 5, fontSize: 16, shadow: 2,
        userHue: 207, userSaturation: 25, userLightness: 85,
        charHue: 0, charSaturation: 0, charLightness: 100,
        customCSS: ''
    };
    const defaultChatSettings = {
        displayCount: 50, contextCount: 20,
        apiReplyIcon: 'https://img.icons8.com/pastel-glyph/64/3a5f82/robot.png',
        chatBackground: '', bubbleStyles: defaultBubbleStyles
    };
    const defaultUserPersona = {
        name: '', avatar: '', birthdate: '', persona: '', commonPhrases: ''
    };

    if (!char.chatSettings) {
        char.chatSettings = JSON.parse(JSON.stringify(defaultChatSettings));
    } else {
        for (const key in defaultChatSettings) {
            if (typeof char.chatSettings[key] === 'undefined') {
                char.chatSettings[key] = defaultChatSettings[key];
            }
        }
        if (!char.chatSettings.bubbleStyles) {
            char.chatSettings.bubbleStyles = JSON.parse(JSON.stringify(defaultBubbleStyles));
        } else {
            for (const styleKey in defaultBubbleStyles) {
                 if (typeof char.chatSettings.bubbleStyles[styleKey] === 'undefined') {
                    char.chatSettings.bubbleStyles[styleKey] = defaultBubbleStyles[styleKey];
                }
            }
        }
    }
    
    if (!char.userPersonaForChar) {
        char.userPersonaForChar = JSON.parse(JSON.stringify(defaultUserPersona));
    }

    if (!char.schedules || !char.schedules.plans) {
        char.schedules = { activePlanIndex: 0, plans: [{ name: '默认方案', timedEvents: [], specificEvents: [] }] };
    } else {
        char.schedules.plans.forEach(plan => {
            if (plan.hourlyEvents && !plan.timedEvents) {
                plan.timedEvents = plan.hourlyEvents.map(he => {
                    const start = String(he.hour).padStart(2, '0') + ':00';
                    const end = String(he.hour + 1).padStart(2, '0') + ':00';
                    return { startTime: start, endTime: end, event: he.event };
                });
                delete plan.hourlyEvents;
            }
            if (!plan.timedEvents) plan.timedEvents = [];
            if (!plan.specificEvents) plan.specificEvents = [];
        });
    }
    return char;
}


// --- UI渲染和辅助函数 ---

function showScreen(screenName) {
    // 隐藏所有屏幕
    document.getElementById('main-screen').classList.add('hidden');
    document.getElementById('settings-screen').classList.add('hidden');
    document.getElementById('chat-list-screen').classList.add('hidden');
    document.getElementById('chat-interface-screen').classList.add('hidden');
    document.getElementById('character-settings-screen').classList.add('hidden');
    document.getElementById('user-settings-screen').classList.add('hidden');
    document.getElementById('chat-settings-screen').classList.add('hidden');
    document.getElementById('offline-character-list-screen').classList.add('hidden');
    document.getElementById('offline-character-hub-screen').classList.add('hidden');
    document.getElementById('offline-feature-1-screen').classList.add('hidden');
    document.getElementById('offline-feature-2-screen').classList.add('hidden');
    document.getElementById('offline-feature-3-screen').classList.add('hidden');
    document.getElementById('offline-feature-4-screen').classList.add('hidden');
    // 【修改】添加新的离线聊天室界面
    document.getElementById('offline-chat-screen').classList.add('hidden');
    document.getElementById('offline-auto-reply-editor-screen').classList.add('hidden');
    document.getElementById('offline-random-info-library-screen').classList.add('hidden');
    document.getElementById('memory-analysis-screen').classList.add('hidden');
    document.getElementById('reminder-app-list-screen').classList.add('hidden');
    document.getElementById('reminder-item-editor-screen').classList.add('hidden');
    // 【新增】隐藏美化页面
    document.getElementById('beautification-screen').classList.add('hidden');
    const ioScreen = document.getElementById('io-screen');
    if (ioScreen) ioScreen.classList.add('hidden');

    // 显示目标屏幕
    if (!screenName || screenName === 'main') {
        document.getElementById('main-screen').classList.remove('hidden');
        return;
    }
    
    const kebabCaseName = screenName.replace(/([A-Z0-9])/g, "-$1").toLowerCase();
    const screenId = `${kebabCaseName}-screen`;
    const screenToShow = document.getElementById(screenId);

    if (screenToShow) {
        screenToShow.classList.remove('hidden');
    } else {
        console.error(`Error: Screen with derived ID "${screenId}" not found. Defaulting to main screen.`);
        document.getElementById('main-screen').classList.remove('hidden');
    }
}
