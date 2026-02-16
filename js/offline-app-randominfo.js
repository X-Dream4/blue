// 文件: js/offline-app-randominfo.js (已修改)

/**
 * 渲染随机信息主界面
 */
function renderRandomInfoScreen() {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;
    initializeDataDefaults(char);

    const container = document.getElementById('random-info-main-content');
    container.innerHTML = `
        <div class="offline-feature-card">
            <p>点击下方按钮，让 ${char.name} 根据自己的人设，用心设置一些关于自己的随机信息（如日记、心声、小秘密等）。</p>
            <p>这些信息将在离线聊天中随机出现，让角色更生动。</p>
            <div class="random-info-actions">
                <button id="generate-random-info-btn" class="btn btn-save">让角色设置</button>
            </div>
        </div>
        <div class="random-info-summary">
            <div id="random-info-count" class="count">${char.randomInfo.length}</div>
            <div class="label">条信息已存储</div>
        </div>
        <div class="offline-feature-card">
             <p>你也可以手动查看、修改、增删 ${char.name} 的信息库。</p>
             <button id="view-random-info-btn" class="btn">查看信息库</button>
        </div>
    `;

    document.getElementById('generate-random-info-btn').addEventListener('click', generateRandomInfoByAI);
    document.getElementById('view-random-info-btn').addEventListener('click', () => {
        if (confirm('真的要查看吗？')) {
            renderRandomInfoLibrary();
            showScreen('offlineRandomInfoLibrary');
        }
    });
}

/**
 * 通过API让角色生成随机信息
 */
async function generateRandomInfoByAI() {
    const apiSettings = JSON.parse(localStorage.getItem(API_SETTINGS_KEY));
    if (!apiSettings || !apiSettings.url || !apiSettings.key || !apiSettings.selectedModel) {
        alert('请先在 "主屏幕 -> Settings -> API设置" 中配置好API！');
        return;
    }

    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;
    
    const btn = document.getElementById('generate-random-info-btn');
    btn.textContent = '设置中，请稍候...';
    btn.disabled = true;

    const existingInfo = char.randomInfo.length > 0 ? `为避免重复，请不要生成与以下内容相似的信息：[${char.randomInfo.map(i => `"${i.content}"`).join(', ')}]` : '目前没有任何信息。';

    const systemPrompt = `
# 指令：创建角色专属的“随机信息”
你是一位名叫“${char.name}”的角色，你的人设是：“${char.persona}”。
你的任务是为“离线聊天”功能，精心设置一些关于你自己的、可供展示的“随机信息”。这些信息要像是无意间透露的生活片段、内心想法或个人数据，让用户感觉更了解你。

## 任务要求
1.  **严格遵守人设**：你所有的信息都必须完全符合你的角色设定（“${char.persona}”）。
- **角色设定优先**: 你的性格、背景和说话方式还有内心独白还有任何随机信息严格遵循“角色设定”。如果“任务要求”与“角色设定”冲突，以“角色设定${char.persona}”为准。
2.  **生成并分类**：你需要生成 **3到7条** 全新的、不重复的随机信息。对于生成的每一条信息，你必须从下面的分类列表中，为其选择一个最合适的分类。
3.  **避免重复**：${existingInfo}。请确保你本次生成的内容是全新的。
4.  **用心设置**：请你认真思考，让你的信息充满个性和灵魂。这些信息将被储存起来，在未来的离线互动中随机展示给用户。
- 随机信息规则如下：是一小段文字，但要分类型比如日记（纯粹些，白话文白描即可，禁止比喻）、突然念想/心声、感受、回忆、现在在做什么、其他（天气、气味、物件、NPC举动、情绪）、备忘录、浏览器搜索记录、歌单、手机App使用记录、日程、行踪记录、一点点角色内心深处的极端的占有欲/想念/欲望/控制欲、、之前一直藏在心里没说出的话、一点龌龊的心思、目标、规划、总资产、一件用户不知道的小事、小秘密、等等随机信息。随机信息需要严格按照角色的人设来设置！
1. 随机信息完全随机，从任何可能的角度描述身边发生的细节。
2. 指定覆盖范围：天气、气味、物件、身体感受、回忆、NPC举动、突然念头等，任选其一。
3. 强调只选最微小、最容易被忽略的瞬间，不要刻意挑选有意义的事。
4. 要求符合现实逻辑，可以加入五感细节（视觉、听觉、嗅觉、触觉、味觉）。
5. 如果回答平淡，追问具体细节让信息更立体。
6. 必须是一个角色身边的完全随机的信息！

## 信息分类列表 (必须从中选择)
- '日记'
- '突然念想/心声'
- '感受'
- '回忆'
- '现在在做什么'
- '其他' (可注明具体内容，如：天气、气味、物件、NPC举动、情绪等)
- '备忘录'
- '浏览器搜索记录'
- '歌单'
- '手机App使用记录'
- '日程'
- '行踪记录'
- '内心深处的占有欲/想念/欲望' (展现角色不为人知的、更深层的情感)
- '藏在心里没说出的话'
- '一点龌龊的心思'
- '目标/规划'
- '总资产'
- '用户不知道的小事/小秘密'

## 输出格式
你必须严格按照以下JSON格式输出。返回一个包含多个信息对象的数组。每个对象包含：
- \`category\`: 从上述列表中选择的分类名 (string)。
- \`content\`: 信息内容的具体文本 (string)。

## 示例输出
\`\`\`json
{
  "new_info": [
    {
      "category": "浏览器搜索记录",
      "content": "如何制作提拉米苏 简单教程"
    },
    {
      "category": "内心深处的占有欲/想念/欲望",
      "content": "为什么...看到TA和别人说话，心里会这么不舒服..."
    },
    {
      "category": "现在在做什么",
      "content": "坐在窗边看雨，有点想睡觉了。"
    }
  ]
}
\`\`\`

现在，请严格遵守以上所有规则，开始为我（用户）创建一批新的、充满你个人风格的随机信息吧。
`;

    try {
        const response = await fetch(`${apiSettings.url}/v1/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiSettings.key}` },
            body: JSON.stringify({
                model: apiSettings.selectedModel,
                messages: [{ role: 'system', content: systemPrompt }],
                temperature: 0.9,
                response_format: { type: "json_object" },
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} - ${errorData.error.message}`);
        }

        const data = await response.json();
        const rawContent = data.choices[0].message.content;
        
        const newInfo = JSON.parse(rawContent).new_info;

        if (Array.isArray(newInfo) && newInfo.length > 0) {
            const validNewInfo = newInfo.filter(info => info.category && info.content);
            
            validNewInfo.forEach(info => info.id = `info_${Date.now()}_${Math.random()}`);

            char.randomInfo.push(...validNewInfo);
            saveCharacters();
            
            alert(`${char.name} 新设置了 ${validNewInfo.length} 条随机信息！`);
            renderRandomInfoScreen(); 
        } else {
            alert(`${char.name} 似乎没有想出新的信息。`);
        }

    } catch (error) {
        console.error('生成随机信息失败:', error);
        const failAlert = `API 调用失败: ${error.message}`;
        alert(failAlert);
        const errorDetails = document.createElement('div');
        errorDetails.style.cssText = 'position:fixed; top:10px; left:10px; right:10px; background: #fdd; border:1px solid red; padding:10px; z-index:9999;';
        errorDetails.textContent = failAlert;
        document.body.appendChild(errorDetails);
        setTimeout(() => document.body.removeChild(errorDetails), 8000);
    } finally {
        btn.textContent = '让角色设置';
        btn.disabled = false;
    }
}

/**
 * 渲染随机信息库编辑器
 * 【修改】改为非折叠的平铺列表样式
 */
function renderRandomInfoLibrary() {
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;

    const container = document.getElementById('random-info-library-container');
    container.innerHTML = '';
    
    const grouped = char.randomInfo.reduce((acc, item) => {
        (acc[item.category] = acc[item.category] || []).push(item);
        return acc;
    }, {});

    if (Object.keys(grouped).length === 0) {
        container.innerHTML = '<p class="empty-list-info">还没有任何信息。</p>';
    } else {
        Object.keys(grouped).sort().forEach(category => {
            const items = grouped[category];
            
            // 1. 创建分类组的容器
            const groupEl = document.createElement('div');
            groupEl.className = 'info-category-group';

            // 2. 创建分类标题
            const titleEl = document.createElement('div');
            titleEl.className = 'info-category-title';
            titleEl.textContent = `${category} (${items.length})`;
            groupEl.appendChild(titleEl);
            
            // 3. 创建该分类下所有条目的容器
            const contentDiv = document.createElement('div');
            contentDiv.className = 'info-category-content';

            // 4. 循环创建每个可编辑条目
            items.forEach(item => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'info-item';
                itemDiv.dataset.id = item.id;
                itemDiv.innerHTML = `
                    <textarea>${item.content}</textarea>
                    <button class="btn-icon delete-info-btn">×</button>
                `;
                contentDiv.appendChild(itemDiv);
            });
            
            groupEl.appendChild(contentDiv);
            container.appendChild(groupEl);
        });
    }

    const actionsEl = document.createElement('div');
    actionsEl.className = 'info-library-actions';
    actionsEl.innerHTML = `
        <button id="add-new-info-btn" class="btn">+ 新增一条</button>
        <button id="save-all-info-btn" class="btn btn-save">保存全部修改</button>
    `;
    container.appendChild(actionsEl);

    bindRandomInfoLibraryEvents();
}

/**
 * 为随机信息库编辑器绑定事件
 */
function bindRandomInfoLibraryEvents() {
    const container = document.getElementById('random-info-library-container');
    const char = characters.find(c => c.id === activeOfflineCharacterId);
    if (!char) return;

    container.addEventListener('click', (event) => {
        if (event.target.classList.contains('delete-info-btn')) {
            const itemEl = event.target.closest('.info-item');
            const idToDelete = itemEl.dataset.id;
            const itemIndex = char.randomInfo.findIndex(i => i.id === idToDelete);
            
            if (itemIndex > -1) {
                char.randomInfo.splice(itemIndex, 1);
                saveCharacters();
                
                const groupEl = itemEl.closest('.info-category-group');
                itemEl.remove(); // 从DOM中移除
                
                const titleEl = groupEl.querySelector('.info-category-title');
                const newCount = groupEl.querySelectorAll('.info-item').length;
                
                if(newCount === 0) {
                    groupEl.remove(); // 如果分类空了，则移除整个分类卡片
                } else {
                    // 否则只更新标题中的数量
                    titleEl.textContent = `${titleEl.textContent.split('(')[0].trim()} (${newCount})`;
                }
            }
        }
        if (event.target.id === 'add-new-info-btn') {
            const category = prompt('请输入这条新信息的分类：', '突然念想/心声');
            if(category && category.trim()) {
                const newItem = {
                    id: `info_${Date.now()}_${Math.random()}`,
                    category: category.trim(),
                    content: ''
                };
                char.randomInfo.push(newItem);
                saveCharacters();
                renderRandomInfoLibrary(); 
            }
        }
        if (event.target.id === 'save-all-info-btn') {
            const itemElements = container.querySelectorAll('.info-item');
            itemElements.forEach(el => {
                const id = el.dataset.id;
                const newContent = el.querySelector('textarea').value.trim();
                const itemInArray = char.randomInfo.find(i => i.id === id);
                if (itemInArray) {
                    itemInArray.content = newContent;
                }
            });
            
            char.randomInfo = char.randomInfo.filter(i => i.content);
            saveCharacters();
            alert('随机信息库已保存！');
            renderRandomInfoScreen(); 
            showScreen('offlineFeature3');
        }
    });
}
