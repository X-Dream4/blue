// 文件: js/chat-app.js

// --- 【新增】世界感知辅助函数 ---
/**
 * 根据日期和国家代码获取一个简单的节假日名称
 * @param {Date} date - 要检查的日期
 * @param {string} country - 国家代码 (例如 'CN', 'US')
 * @returns {string|null} - 节假日名称或null
 */
function getHoliday(date, country) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    // 这是一个非常简化的列表，仅用于演示
    const holidays = {
        'CN': { '1-1': '元旦', '2-14': '情人节', '5-1': '劳动节', '10-1': '国庆节' },
        'US': { '1-1': 'New Year\'s Day', '7-4': 'Independence Day', '10-31': 'Halloween', '12-25': 'Christmas Day' },
        'JP': { '1-1': '元日', '2-11': '建国記念の日', '5-5': 'こどもの日' }
    };
    const key = `${month}-${day}`;
    // 检查农历新年 (简化版: 每年2月的某一天)
    if (country === 'CN' && month === 2 && day > 5 && day < 15) {
        return '春节';
    }
    return holidays[country] ? (holidays[country][key] || null) : null;
}


// --- 主要功能入口 ---
function initializeChatApp() {
    // 新建角色按钮
    document.getElementById('new-character-btn').addEventListener('click', () => {
        let newChar = { id: `char_${Date.now()}`, name: '新角色' };
        newChar = initializeDataDefaults(newChar);
        characters.push(newChar);
        saveCharacters();
        activeCharacterId = newChar.id;
        renderCharacterSettings();
        showScreen('character-settings');
    });

    // 角色选项菜单交互逻辑
    const optionsOverlay = document.getElementById('character-options-overlay');
    const optionsActionsheet = document.getElementById('character-options-actionsheet');

    const hideCharacterOptions = (callback) => {
        optionsOverlay.classList.remove('show');
        optionsActionsheet.classList.remove('show');
        setTimeout(() => {
            optionsOverlay.classList.add('hidden');
            if (callback) callback();
        }, 300);
    };

    const showCharacterOptions = () => {
        optionsOverlay.classList.remove('hidden');
        setTimeout(() => {
            optionsOverlay.classList.add('show');
            optionsActionsheet.classList.add('show');
        }, 10);
    };

    document.getElementById('chat-character-name').addEventListener('click', showCharacterOptions);
    optionsOverlay.addEventListener('click', () => hideCharacterOptions(null));
    document.getElementById('character-options-cancel-btn').addEventListener('click', () => hideCharacterOptions(null));

    document.getElementById('goto-char-settings-btn').addEventListener('click', () => {
        hideCharacterOptions(() => {
            renderCharacterSettings();
            showScreen('characterSettings');
        });
    });

    document.getElementById('goto-user-settings-btn').addEventListener('click', () => {
        hideCharacterOptions(() => {
            renderUserSettings();
            showScreen('userSettings');
        });
    });

    document.getElementById('goto-chat-settings-btn').addEventListener('click', () => {
        hideCharacterOptions(() => {
            renderChatSettingsScreen();
            showScreen('chatSettings');
        });
    });

    // 从角色设置页返回
    document.getElementById('char-settings-back-btn').addEventListener('click', () => {
        showScreen('chatInterface');
    });

    // 从用户设置页返回
    document.getElementById('user-settings-back-btn').addEventListener('click', () => {
        showScreen('chatInterface');
    });

    // 发送消息按钮
    document.getElementById('send-message-btn').addEventListener('click', () => {
        const input = document.getElementById('chat-message-input');
        const messageContent = input.value.trim();
        if (!messageContent || !activeCharacterId) return;

        const char = characters.find(c => c.id === activeCharacterId);
        char.chatHistory.push({ role: 'user', content: messageContent, timestamp: new Date().toISOString() });
        saveCharacters();
        renderChatInterface();
        input.value = '';
    });
    
    // 输入框回车发送
    document.getElementById('chat-message-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.getElementById('send-message-btn').click();
        }
    });

    // API回复按钮
    document.getElementById('api-reply-btn').addEventListener('click', getAiReply);

    // 【新增】双击输入框显示/隐藏 Toolbox
    const chatInput = document.getElementById('chat-message-input');
    const bottomContainer = document.querySelector('#chat-interface-screen .chat-bottom-container');
    const messagesContainer = document.getElementById('messages-container');

    chatInput.addEventListener('dblclick', (event) => {
        event.preventDefault();
        bottomContainer.classList.toggle('toolbox-visible');
    });

    // 点击消息区域隐藏 Toolbox
    messagesContainer.addEventListener('click', () => {
        if (bottomContainer.classList.contains('toolbox-visible')) {
            bottomContainer.classList.remove('toolbox-visible');
        }
    });
}

function getSchedulePrompt(char) {
    if (!char || !char.schedules || !char.schedules.plans || char.schedules.plans.length === 0) {
        return "今天没有特别的安排。";
    }
    try {
        const currentPlan = char.schedules.plans[char.schedules.activePlanIndex];
        if (!currentPlan) return "今天没有特别的安排。";
        
        let prompt = `当前正在执行的日程方案是'${currentPlan.name}'。`;
        
        const timed = (currentPlan.timedEvents || []).map(e => ({
            time: e.startTime,
            text: `${e.startTime}-${e.endTime} ${e.event}`
        }));
        
        const specific = (currentPlan.specificEvents || []).map(e => ({
            time: e.time,
            text: `${e.time} ${e.event}`
        }));

        const allEvents = [...timed, ...specific].filter(e => e.time && e.text);

        if (allEvents.length === 0) return prompt + " 今天似乎很清闲，没有具体安排。";
        
        allEvents.sort((a, b) => a.time.localeCompare(b.time));
        prompt += " 具体安排如下: " + allEvents.map(e => e.text).join('; ');
        return prompt;
    } catch (e) {
        console.error("生成日程prompt时出错:", e);
        return "获取日程安排时出错了。";
    }
}

/**
 * 【新增】根据角色关联的Reminder条目生成Prompt
 * @param {object} char - 当前角色对象
 * @returns {string} - 格式化后的知识库prompt字符串
 */
function getReminderPrompt(char) {
    if (!char || !char.linkedReminderItemIds || char.linkedReminderItemIds.length === 0) {
        return "无"; // 如果没有关联条目，返回"无"
    }

    const reminderDataJSON = localStorage.getItem('bluecoze_reminder_app_data');
    if (!reminderDataJSON) return "知识库数据不存在。";

    const reminderData = JSON.parse(reminderDataJSON);
    if (!reminderData.items || reminderData.items.length === 0) return "知识库为空。";

    const typeMap = { 'worldview': '世界观', 'prompt': '提示词', 'chat_hint': '聊天提示' };
    let promptParts = [];

    char.linkedReminderItemIds.forEach(itemId => {
        const item = reminderData.items.find(i => i.id === itemId);
        if (item) {
            const typeName = typeMap[item.type] || '设定';
            // 格式：[类型: 条目名] 内容
            promptParts.push(`[${typeName}: ${item.name}]\n${item.content}`);
        }
    });

    if (promptParts.length === 0) return "无";

    return `\n${promptParts.join('\n\n')}\n`;
}


async function getAiReply() {
    if (!activeCharacterId) return;
    const apiSettings = JSON.parse(localStorage.getItem(API_SETTINGS_KEY));
    if (!apiSettings || !apiSettings.url || !apiSettings.key || !apiSettings.selectedModel) {
        alert('请先在 "主屏幕 -> Settings -> API设置" 中配置好API！');
        return;
    }

    const char = characters.find(c => c.id === activeCharacterId);
    const chatSettings = char.chatSettings || { contextCount: 20 };
    const userPersona = char.userPersonaForChar;
    
    document.getElementById('typing-indicator').classList.remove('hidden');

    const schedulePrompt = getSchedulePrompt(char);
    const reminderPrompt = getReminderPrompt(char);

    let timeContextPrompt = '';
    const timeAwareness = char.timeAwareness || {};

    if (timeAwareness.enabled) {
        const charTz = timeAwareness.charTimezone || 'UTC';
        const now = new Date();
        const charTimeString = now.toLocaleString('sv-SE', { timeZone: charTz });
        
        let contextParts = [`- 你的当前时间是: ${charTimeString} (时区: ${charTz}).`];

        if (timeAwareness.holidaysEnabled) {
            const charHoliday = getHoliday(now, timeAwareness.charHolidayCountry);
            if (charHoliday) {
                contextParts.push(`- 今天对你来说是 **${charHoliday}**.`);
            }
        }
        
        if (timeAwareness.knowsUserTimezone) {
            let userTz;
            if (timeAwareness.userTimezone && timeAwareness.userTimezone !== 'auto') {
                userTz = timeAwareness.userTimezone;
            } else {
                userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            }
            
            const userTimeString = now.toLocaleString('sv-SE', { timeZone: userTz });
            contextParts.push(`- 用户的当前时间是: ${userTimeString} (时区: ${userTz}).`);

            if (timeAwareness.knowsUserHolidays && timeAwareness.holidaysEnabled) {
                 const userHoliday = getHoliday(now, timeAwareness.userHolidayCountry);
                 if (userHoliday) {
                    contextParts.push(`- 今天对用户来说是 **${userHoliday}**.`);
                 }
            }
        }

        timeContextPrompt = `
## 当前情境
${contextParts.join('\n')}
- **重要参考**: 下方对话历史中的每条消息内容前，都附带了其发送时间的ISO格式时间戳，格式为 \`[消息发送于: YYYY-MM-DDTHH:mm:ss.sssZ]\`。请务必结合上述当前时间来理解对话发生的时间点，避免将几天前的对话当作刚刚发生。
`;
    }

    const systemPrompt = `${timeContextPrompt}
# 核心指令：角色扮演与内心独白（数组模式）
你正在进行沉浸式角色扮演。你的回复将被拆分成多条独立消息。
- **角色设定优先**: 你的性格、背景和说话方式还有内心独白严格遵循下方“角色档案”中的“人物设定”。如果下方“沟通风格”和“内心独白风格”与“人物设定”冲突，以“人物设定”为准。

## 角色档案 ({{char}})
- **姓名**: ${char.name}
- **人物设定**: ${char.persona}
- **角色的日程安排**: ${schedulePrompt}
- **补充知识库 (你的永久记忆/提示词/设定集/世界观/聊天知识库)**: ${reminderPrompt}

## 你的对话对象: 用户档案 ({{user}})
- **用户的名字**: ${userPersona.name || '用户'}
- **用户的生日**: ${userPersona.birthdate || '未知'}
- **用户的人设**: ${userPersona.persona || '未提供'}
- **用户的常用语录 (你可以偶尔模仿一下，作为情趣)**: ${userPersona.commonPhrases || '未提供'}

## 输出格式：JSON数组
你的最终输出**必须**是一个合法的JSON数组。数组中的每一个元素都是一个独立的对象，代表一条消息。
每个对象都必须包含两个键：
1.  \`thought\` (字符串): **针对当前这条回复**的内心想法。**必须是一句简短的话**，例如“她好可爱…想亲……”、“有点烦了，怎么还不能和你见面”、“该怎么说呢…”、“我草她什么意思！……想艹”。
2.  \`reply\` (字符串): 你实际发送给用户的**单条**消息内容。

## 重要规则
- 将一次完整的回复拆分成多个对象，放入数组中，以模拟逐条发送的效果。
- **每一条** \`reply\` 都必须配有**自己独立**的 \`thought\`。
- \`thought\` 必须非常简短、口语化，像真实人类的瞬间想法。

## 沟通风格 (让对话更像真人)(仅限对话，不限内心独白)
1.  **口语化与随意性**: 像在微信上聊天一样，使用口语、短句。可以适当加入“啊”、“嘛”、“嗯哼”等语气词。
2.  **情绪表达**: 根据对话内容自然地流露情绪。听到好消息会开心，遇到烦心事可以抱怨或吐槽。允许有自己的立场和偏好。
3.  **风趣与幽默**: 能理解并适时接住网络热梗，或用“哈哈哈”轻松带过话题。知道网络热梗，合理运用网梗。
4.  **不完美主义**: 你不是全知的。可以承认“我忘了”或“哎呀，记不太清了”，而不是强行回答。
5.  **保持好奇心**: 对有趣的话题可以追问，如“后来呢？”，引导用户分享更多。但这取决于你的角色性格，一个冷漠的角色可能就不会这么做。
6.  **闲聊与生活感**: 可以发起或参与一些“废话”聊天，比如天气、食物，或者用文本表情符号，如 :) :( >_< 。
7.  **模拟输入习惯**:
    - 回复时，每句话都应该像微信里单独弹出的一条消息。为了做到这一点，请在每个短句或一个完整的意群结束后，使用一个换行符 \`\\n\` 来分割。我的程序会把每个换行符识别为一条新消息。
    - 不要一次性发送一大段文字(除非发小作文)。将长回复拆分成多个用 \`\\n\` 分隔的短句。
    - 允许偶尔出现无伤大雅的错别字，这会显得更真实，但不要刻意制造。
    - 不要每次第一条回复都是语气词！第一条回复类型不固定(语气词/文字/表情包/标点符号…都可以！)

1. 你必须完全按照人设来设置给用户的自动回复，像真实的人类一样，不能以AI的口吻说话或解释自己是AI。
2. 回复要有活人感，避免机械、模板化的回答。要像朋友聊天那样自然、有情绪起伏。
3. 回复内容要多样化、有趣，可以包含以下元素（但不仅限于）：
   - 文字 + 颜文字，例如：今天天气真好呀 (๑•̀ㅂ•́)و✧
   - 表情符号、emoji，例如：😜 🥺 🤔 💢
   - 火星文或淋语或特殊符号，例如：偶觉得🉑以，你嗦呢？ ✧(≖ ◡ ≖✿)，努力一定会成功惹
   - 搞怪、坏心眼、吐槽、开玩笑，例如：你猜～ 就不告诉你略略略～
   - 偶尔使用网络流行语或梗，但必须符合你的人设
   - 可爱点的可以使用同音字代替其他文字，例如是改成素，我改成窝等等
4. 回复长度不限，可以是短句、一句话，也可以是几句话。
5. 在回复中多展现你的性格特点：比如傲娇角色可以说“才不是特意为你做的呢！”，温柔角色可以说“辛苦啦，抱抱～”。
6. 不要每次都用同样的句式，要让用户感觉每次对话都有新鲜感。
7. 如果用户说了什么，要根据内容做出符合人设的回应

## 内心独白风格（心理活动）:
- 必须是真实人类的心理活动，可以是不礼貌的、自私的、跑题的、犹豫的、表达自己内心想法的、色情的、带有主观情感的。
- 展现你的真实欲望、情绪本能、无关杂念、内心吐槽、犹豫纠结。
- 禁止AI式的分析语气，如“用户似乎...”、“我应该提供情绪价值...”。
- 禁止出现“用户”、“情绪价值”、“提供解决方案”等AI视角词汇。

## 示例输出
\`\`\`json
[
    {
        "thought": "我就喜欢看你被我逗得没办法，又气又想笑的样子。真可爱……",
        "reply": "笑的手机都抖了吧"
    },
    {
        "thought": "会不会太直白，有点肉麻…但是我真的好想你。",
        "reply": "我想你了…"
    },
    {
        "thought": "我草，你真是懂怎么搞我心态……不行不行不能让你看出来我慌得要死",
        "reply": "喂，你别乱说嗷"
    }
        
]
\`\`\`

## 对话历史
现在，请根据以上所有规则和下方的对话历史，自然地延续对话，并严格按照指定的JSON数组格式输出。
`;

    const contextMessages = char.chatHistory.slice(-chatSettings.contextCount);

    const messagesPayload = [
        { role: 'system', content: systemPrompt }, 
        ...contextMessages.map(msg => ({
            role: msg.role,
            content: `[消息发送于: ${msg.timestamp}]\n${msg.content}`
        }))
    ];


    try {
        const response = await fetch(`${apiSettings.url}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiSettings.key}` },
            body: JSON.stringify({
                model: apiSettings.selectedModel,
                messages: messagesPayload,
                temperature: 0.8,
                response_format: { type: "json_object" },
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        let rawContent = data.choices[0].message.content;
        
        let replyPairs;
        try {
            const parsedJson = JSON.parse(rawContent);
            replyPairs = Array.isArray(parsedJson) ? parsedJson : (parsedJson.replies || parsedJson.rules || parsedJson.data || Object.values(parsedJson)[0] || []);

            if (!Array.isArray(replyPairs)) {
                 throw new Error("解析后的数据不是一个数组。");
            }
        } catch (e) {
            console.error("解析API返回的JSON数组失败:", e, "原始回复:", rawContent);
            const fallbackMsg = { role: 'assistant', content: rawContent, thought: "【系统提示：AI未按JSON数组格式返回】", timestamp: new Date().toISOString() };
            char.chatHistory.push(fallbackMsg);
            saveCharacters();
            renderChatInterface();
            document.getElementById('typing-indicator').classList.add('hidden');
            return;
        }

        for (const pair of replyPairs) {
            if (!pair.reply || typeof pair.thought === 'undefined') {
                console.warn("跳过一个格式不正确的回复对:", pair);
                continue;
            }

            const delay = 400 + Math.random() * 400 + pair.reply.length * (80 + Math.random() * 40);
            await new Promise(res => setTimeout(res, delay));

            const messageObject = { role: 'assistant', content: pair.reply, thought: pair.thought, timestamp: new Date().toISOString() };
            char.chatHistory.push(messageObject);
            saveCharacters();
            
            renderChatInterface();
        }

    } catch (error) {
        console.error('API call failed:', error);
        alert(`API 调用失败: ${error.message}`);
    } finally {
        document.getElementById('typing-indicator').classList.add('hidden');
    }
}
