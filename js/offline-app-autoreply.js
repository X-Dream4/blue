// 文件: js/offline-app-autoreply.js (新)

/**
 * 渲染自动回复主界面
 */
function renderAutoReplyScreen() {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;
    initializeDataDefaults(char); // 确保数据结构最新

    const container = document.getElementById('auto-reply-main-content');
    container.innerHTML = `
        <div class="offline-feature-card">
            <p>点击下方按钮，让 ${char.name} 根据自己的人设，用心设置一些自动回复规则。</p>
            <p>例如，当用户发送包含“你好”的消息时，${char.name} 可能会设置自动回复“【自动回复】你好呀。”</p>
            <button id="generate-auto-replies-btn" class="btn btn-save">让角色设置自动回复</button>
        </div>
        <div class="offline-feature-card">
            <p>你也可以手动查看、修改或增删 ${char.name} 的自动回复库。</p>
            <p class="stats">当前共有 ${char.autoReplies.length} 条自动回复规则。</p>
            <button id="view-auto-replies-btn" class="btn">查看回复库</button>
        </div>
    `;

    document.getElementById('generate-auto-replies-btn').addEventListener('click', generateAutoRepliesByAI);
    document.getElementById('view-auto-replies-btn').addEventListener('click', () => {
        if (confirm('真的要查看吗？')) {
            renderAutoReplyEditor();
            showScreen('offlineAutoReplyEditor');
        }
    });
}

/**
 * 通过API让角色生成自动回复规则
 */
async function generateAutoRepliesByAI() {
    const apiSettings = JSON.parse(localStorage.getItem(API_SETTINGS_KEY));
    if (!apiSettings || !apiSettings.url || !apiSettings.key || !apiSettings.selectedModel) {
        alert('请先在 "主屏幕 -> Settings -> API设置" 中配置好API！');
        return;
    }

    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;
    
    const btn = document.getElementById('generate-auto-replies-btn');
    btn.textContent = '设置中，请稍候...';
    btn.disabled = true;

    const existingKeywords = char.autoReplies.flatMap(rule => rule.keywords).join(', ');
    const userRestrictions = char.autoReplyRestrictions 
        ? `\n## 用户指定的输出限制\n${char.autoReplyRestrictions}` 
        : '';

    const systemPrompt = `
# 指令：创建自动回复规则
你是一位名叫“${char.name}”的角色，你的人设是：“${char.persona}”。
你的任务是为离线聊天功能，精心设计一批自动回复规则。这些规则能让你在无法使用API时，也能根据用户的特定信息做出符合你性格的回应。

## 任务要求
1.  **严格遵守人设**：你所有的回复都必须完全符合你的角色设定（“${char.persona}”）。
2.  **思考常见场景**：设想用户可能会发送的各种信息，例如问候（你好、在吗）、关心（吃饭了吗、在干嘛）、表达情感（喜欢你、爱你、想你）、道别（晚安、再见）等。
3.  **创建规则**：为你想到的场景创建规则。每个规则包含“关键词”和“回复”。
4.  **避免重复**：我已经设置了以下关键词的规则：“${existingKeywords}”。请你创作全新的、不要与这些重复的规则。
5.  **用心设置**：这不是一个敷衍的任务。请你认真思考，让你的自动回复充满个性和灵魂，让用户即使在离线模式下也能感受到你的存在。

## 全局核心限制
- **绝对禁止**: 你的任何回复（包括自动回复内容）都不能提及自己是AI、模型、程序、机器人或虚拟人物。你就是“${char.name}”本人。
- **格式要求**: 你的回复内容必须以“【自动回复】”这五个字开头。
- **角色设定优先**: 你的性格、背景和说话方式还有内心独白严格遵循“角色设定”（“${char.persona}”）。如果下方“沟通风格”与“人物设定”冲突，以“角色设定”（“${char.persona}”）为准。
- 记住你写的是自动回复，写的时候要带着“期待用户发现这个自动回复的时候的表情、感受等等”的感觉来写，要写合理有趣的符合自己人设的自动回复哦。要把用户可能会说到的词语都猜一猜然后写自动回复。
- 输出之前确认和之前的自动回复没有重复！
${userRestrictions}

## 沟通风格 (让对话更像真人)(仅限自动回复)
1.  **口语化与随意性**: 像在微信上聊天一样，使用口语、短句。可以适当加入“啊”、“嘛”、“嗯哼”等语气词。
2.  **情绪表达**: 根据对话内容自然地流露情绪。听到好消息会开心，遇到烦心事可以抱怨或吐槽。允许有自己的立场和偏好。
3.  **风趣与幽默**: 能理解并适时接住网络热梗，或用“哈哈哈”轻松带过话题。知道网络热梗，合理运用网梗。
4.  **不完美主义**: 你不是全知的。可以承认“我忘了”或“哎呀，记不太清了”，而不是强行回答。
5.  **保持好奇心**: 对有趣的话题可以追问，如“后来呢？”，引导用户分享更多。但这取决于你的角色性格，一个冷漠的角色可能就不会这么做。
6.  **闲聊与生活感**: 可以发起或参与一些“废话”聊天，比如天气、食物，或者用文本表情符号（颜文字），如 :) :( >_< 。
7.  **模拟输入习惯**:
    - 回复时，每句话都应该像微信里单独弹出的一条消息。
    - 允许偶尔出现无伤大雅的错别字，这会显得更真实，但不要刻意制造。
    - 不要每次回复都是语气词！回复类型不固定(语气词/文字/表情包/标点符号…都可以！)
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


## 输出格式
你必须严格按照以下JSON格式输出。返回一个包含多个规则对象的数组。每个对象包含：
- \`keywords\`: 一个包含多个触发此回复的**近义词**的数组 (string[])。
- \`reply\`: 一句符合你人设的、以“【自动回复】”开头的回复 (string)。

## 示例输出
\`\`\`json
{
  "rules": [
    {
      "keywords": ["吃饭了吗", "吃了吗"],
      "reply": "【自动回复】刚吃过，你呢？要按时吃饭呀。"
    },
    {
      "keywords": ["爱你", "好爱你"],
      "reply": "【自动回复】嗯...突然说这个干嘛，怪不好意思的。"
    },
    {
       "keywords": ["在干嘛", "在忙吗"],
       "reply": "【自动回复】刚刚在发呆，现在在想你。"
    }
  ]
}
\`\`\`

现在，请严格遵守以上所有规则，开始为我（用户）创建一批新的、充满你个人风格的自动回复规则吧。
`;

    try {
        const response = await fetch(`${apiSettings.url}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiSettings.key}` },
            body: JSON.stringify({
                model: apiSettings.selectedModel,
                messages: [{ role: 'system', content: systemPrompt }],
                temperature: 0.8,
                response_format: { type: "json_object" },
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        const rawContent = data.choices[0].message.content;
        
        const newRules = JSON.parse(rawContent).rules;

        if (Array.isArray(newRules) && newRules.length > 0) {
            const validNewRules = newRules.filter(rule => 
                rule.keywords && Array.isArray(rule.keywords) && rule.keywords.length > 0 && rule.reply
            );
            
            char.autoReplies.push(...validNewRules);
            saveCharacters();
            
            alert(`${char.name} 新设置了 ${validNewRules.length} 条自动回复！`);
            renderAutoReplyScreen();
        } else {
            alert(`${char.name} 似乎没有想出新的回复规则。`);
        }

    } catch (error) {
        console.error('生成自动回复失败:', error);
        alert(`API 调用失败: ${error.message}`);
    } finally {
        btn.textContent = '让角色设置自动回复';
        btn.disabled = false;
    }
}

/**
 * 渲染自动回复编辑器
 */
function renderAutoReplyEditor() {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;
    
    const container = document.getElementById('auto-reply-editor-content');
    container.innerHTML = ''; 

    if (char.autoReplies.length === 0) {
        container.innerHTML = '<p class="empty-list-info">还没有任何自动回复规则。</p>';
    } else {
        char.autoReplies.forEach((rule, index) => {
            const ruleEl = document.createElement('div');
            ruleEl.className = 'auto-reply-editor-item';
            ruleEl.innerHTML = `
                <div class="form-group">
                    <label>触发词 (用英文逗号,隔开)</label>
                    <input type="text" class="auto-reply-keywords-input" data-index="${index}" value="${rule.keywords.join(', ')}">
                </div>
                <div class="form-group">
                    <label>自动回复内容</label>
                    <textarea class="auto-reply-reply-input" data-index="${index}">${rule.reply}</textarea>
                </div>
                <button class="btn-icon delete-auto-reply-btn" data-index="${index}">×</button>
            `;
            container.appendChild(ruleEl);
        });
    }

    const actionsEl = document.createElement('div');
    actionsEl.className = 'editor-actions';
    actionsEl.innerHTML = `
        <button id="add-new-auto-reply-btn" class="btn">+ 新增规则</button>
        <button id="save-all-auto-replies-btn" class="btn btn-save">保存全部修改</button>
    `;
    container.appendChild(actionsEl);

    bindAutoReplyEditorEvents();
}

/**
 * 为自动回复编辑器绑定事件
 */
function bindAutoReplyEditorEvents() {
    const container = document.getElementById('auto-reply-editor-content');
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;

    container.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-auto-reply-btn')) {
            const index = parseInt(event.target.dataset.index, 10);
            if (confirm(`确定要删除这条规则吗？\n触发词: ${char.autoReplies[index].keywords.join(', ')}`)) {
                char.autoReplies.splice(index, 1);
                saveCharacters();
                renderAutoReplyEditor();
            }
        }
        if (event.target.id === 'add-new-auto-reply-btn') {
            char.autoReplies.push({ keywords: [], reply: '' });
            renderAutoReplyEditor();
        }
        if (event.target.id === 'save-all-auto-replies-btn') {
            const keywordInputs = container.querySelectorAll('.auto-reply-keywords-input');
            const replyInputs = container.querySelectorAll('.auto-reply-reply-input');
            
            const updatedReplies = [];
            
            keywordInputs.forEach((input, index) => {
                const keywords = input.value.split(',').map(k => k.trim()).filter(Boolean);
                const reply = replyInputs[index].value.trim();

                if (keywords.length > 0 && reply) {
                    updatedReplies.push({ keywords, reply });
                }
            });

            char.autoReplies = updatedReplies;
            saveCharacters();
            alert('自动回复库已保存！');
            renderAutoReplyScreen();
            showScreen('offlineFeature1');
        }
    });
}
