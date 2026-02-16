// 文件: js/ui-settings.js

// --- 【新增】世界感知设置所需的数据和辅助函数 ---
const TIMEZONES = {
    'UTC': '协调世界时 (UTC)', 'Asia/Shanghai': '中国 / 北京时间 (Asia/Shanghai)', 'Asia/Tokyo': '日本 (Asia/Tokyo)', 'Europe/London': '英国 (Europe/London)', 'Europe/Paris': '法国 / 巴黎 (Europe/Paris)',
    'America/New_York': '美国东部 (America/New_York)', 'America/Chicago': '美国中部 (America/Chicago)', 'America/Denver': '美国山地 (America/Denver)', 'America/Los_Angeles': '美国西部 (America/Los_Angeles)'
};
const COUNTRIES = {
    'CN': '中国大陆', 'US': '美国', 'JP': '日本', 'GB': '英国', 'FR': '法国', 'DE': '德国', 'KR': '韩国'
};

function generateSelectOptions(options, selectedValue) {
    return Object.entries(options).map(([value, text]) => 
        `<option value="${value}" ${value === selectedValue ? 'selected' : ''}>${text}</option>`
    ).join('');
}


function renderChatSettingsScreen() {
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) return;
    initializeDataDefaults(char);
    const s = char.chatSettings; 
    const bs = s.bubbleStyles; 

    const formContainer = document.getElementById('chat-settings-form');
    formContainer.innerHTML = `
        <div class="setting-section">
            <h3>聊天背景</h3>
            <div class="avatar-setting">
                <div id="chat-bg-preview" class="background-setting-preview" style="background-image: url('${s.chatBackground}')">
                    ${s.chatBackground ? '' : '点击设置背景'}
                </div>
                <input type="file" id="chat-bg-upload" accept="image/*">
                <input type="text" id="chat-bg-url" class="themed-input" placeholder="或者在此处粘贴图片URL" value="${s.chatBackground.startsWith('http') ? s.chatBackground : ''}">
            </div>
        </div>
        <div class="setting-section">
            <h3>API按钮图标</h3>
            <div class="avatar-setting">
                <img id="api-icon-preview" src="${s.apiReplyIcon}" alt="API图标" class="api-icon-preview">
                <input type="file" id="api-icon-upload" accept="image/*">
                <div>点击图标上传或输入URL</div>
                <input type="text" id="api-icon-url" class="themed-input" placeholder="或者在此处粘贴图片URL" value="${s.apiReplyIcon.startsWith('http') ? s.apiReplyIcon : ''}">
            </div>
        </div>
        <div class="setting-section">
            <h3>聊天气泡美化</h3>
            <div class="style-preview-container" id="style-preview-container">
                 <div class="message assistant preview-message">
                    <img class="avatar" src="${char.avatar || 'https://placehold.co/100x100/ffffff/89b0d6?text=?'}" alt="avatar">
                    <div class="bubble">这是角色气泡</div>
                </div>
                <div class="message user preview-message">
                    <img class="avatar" src="${char.userPersonaForChar.avatar || 'https://placehold.co/40x40/a2b9d1/3c4f61?text=Me'}" alt="avatar">
                    <div class="bubble">这是你的气泡</div>
                </div>
            </div>
            <div class="form-group slider-group"><label>气泡方角程度: <span id="val-main-radius">${bs.mainRadius}</span>px</label><input type="range" id="ctrl-main-radius" min="0" max="25" value="${bs.mainRadius}"></div>
            <div class="form-group slider-group"><label>气泡尖角圆润度: <span id="val-corner">${bs.cornerRadius}</span>px</label><input type="range" id="ctrl-corner" min="0" max="20" value="${bs.cornerRadius}"></div>
            <div class="form-group slider-group"><label>整体显示大小: <span id="val-scale">${bs.scale}</span>%</label><input type="range" id="ctrl-scale" min="80" max="120" value="${bs.scale}"></div>
            <div class="form-group slider-group"><label>气泡内字体大小: <span id="val-font-size">${bs.fontSize}</span>px</label><input type="range" id="ctrl-font-size" min="12" max="20" value="${bs.fontSize}"></div>
            <div class="form-group slider-group"><label>气泡立体感(阴影): <span id="val-shadow">${bs.shadow}</span></label><input type="range" id="ctrl-shadow" min="0" max="10" value="${bs.shadow}"></div>
        </div>
        <div class="setting-section">
            <h3>气泡颜色</h3>
            <div class="color-picker-group">
                <label>我的气泡颜色 <div class="color-preview" id="user-color-preview"></div></label>
                <div class="form-group slider-group"><label>色相: <span id="val-user-hue">${bs.userHue}</span></label><input type="range" id="ctrl-user-hue" min="0" max="360" value="${bs.userHue}"></div>
                <div class="form-group slider-group"><label>饱和度: <span id="val-user-sat">${bs.userSaturation}</span>%</label><input type="range" id="ctrl-user-sat" min="0" max="100" value="${bs.userSaturation}"></div>
                <div class="form-group slider-group"><label>亮度: <span id="val-user-light">${bs.userLightness}</span>%</label><input type="range" id="ctrl-user-light" min="0" max="100" value="${bs.userLightness}"></div>
            </div>
            <div class="color-picker-group">
                <label>角色气泡颜色 <div class="color-preview" id="char-color-preview"></div></label>
                <div class="form-group slider-group"><label>色相: <span id="val-char-hue">${bs.charHue}</span></label><input type="range" id="ctrl-char-hue" min="0" max="360" value="${bs.charHue}"></div>
                <div class="form-group slider-group"><label>饱和度: <span id="val-char-sat">${bs.charSaturation}</span>%</label><input type="range" id="ctrl-char-sat" min="0" max="100" value="${bs.charSaturation}"></div>
                <div class="form-group slider-group"><label>亮度: <span id="val-char-light">${bs.charLightness}</span>%</label><input type="range" id="ctrl-char-light" min="0" max="100" value="${bs.charLightness}"></div>
            </div>
        </div>
        <div class="setting-section">
            <h3>性能与记忆</h3>
            <div class="form-group"><div class="chat-setting-item"><label for="display-count-input">显示消息数量</label><input type="number" id="display-count-input" class="chat-setting-input" value="${s.displayCount}" placeholder="50" pattern="[0-9]*"></div><p class="setting-description">设置进入聊天时默认显示多少条最新消息。数量越少，加载越快。</p></div>
            <div class="form-group"><div class="chat-setting-item"><label for="context-count-input">AI记忆消息数量</label><input type="number" id="context-count-input" class="chat-setting-input" value="${s.contextCount}" placeholder="20" pattern="[0-9]*"></div><p class="setting-description">设置AI能“记住”多少条最近的对话历史。数量越多，对话越连贯，但API费用可能更高。</p></div>
        </div>
        <div class="setting-section">
            <h3>高级自定义</h3>
            <div class="form-group"><label for="custom-css">自定义CSS</label><textarea id="custom-css" placeholder=".message.user .bubble {\\n  border: 1px solid red;\\n}">${bs.customCSS}</textarea></div>
        </div>
        <button id="save-chat-settings-btn" class="btn btn-save">保存并应用</button>
        <button id="reset-style-settings-btn" class="btn btn-danger">重置美化设置</button>
    `;
    bindChatSettingsScreenEvents();
}

function bindChatSettingsScreenEvents() {
    const form = document.getElementById('chat-settings-form');
    if (!form) return;
    const controls = {
        chatBgPreview: form.querySelector('#chat-bg-preview'), chatBgUpload: form.querySelector('#chat-bg-upload'), chatBgUrl: form.querySelector('#chat-bg-url'),
        apiIconPreview: form.querySelector('#api-icon-preview'), apiIconUpload: form.querySelector('#api-icon-upload'), apiIconUrl: form.querySelector('#api-icon-url'),
        displayCount: form.querySelector('#display-count-input'), contextCount: form.querySelector('#context-count-input'), customCSS: form.querySelector('#custom-css'),
        mainRadius: form.querySelector('#ctrl-main-radius'), cornerRadius: form.querySelector('#ctrl-corner'), scale: form.querySelector('#ctrl-scale'), fontSize: form.querySelector('#ctrl-font-size'), shadow: form.querySelector('#ctrl-shadow'),
        userHue: form.querySelector('#ctrl-user-hue'), userSat: form.querySelector('#ctrl-user-sat'), userLight: form.querySelector('#ctrl-user-light'),
        charHue: form.querySelector('#ctrl-char-hue'), charSat: form.querySelector('#ctrl-char-sat'), charLight: form.querySelector('#ctrl-char-light'),
    };
    const previewContainer = form.querySelector('#style-preview-container');
    const previewUserBubble = previewContainer.querySelector('.user .bubble');
    const previewCharBubble = previewContainer.querySelector('.assistant .bubble');
    const userColorPreview = form.querySelector('#user-color-preview');
    const charColorPreview = form.querySelector('#char-color-preview');

    const updateLiveStyles = () => {
        Object.keys(controls).forEach(key => {
            const input = controls[key];
            if (input && input.type === 'range') {
                const valId = 'val-' + input.id.substring(5);
                const valSpan = form.querySelector(`#${valId}`);
                if (valSpan) valSpan.textContent = input.value;
            }
        });
        const styles = {
            scale: controls.scale.value / 100, mainRadius: `${controls.mainRadius.value}px`, cornerRadius: `${controls.cornerRadius.value}px`, fontSize: `${controls.fontSize.value}px`,
            shadow: `0 ${controls.shadow.value * 0.5}px ${controls.shadow.value * 1.5}px rgba(0, 0, 0, ${controls.shadow.value * 0.02})`,
            userBg: `hsl(${controls.userHue.value}, ${controls.userSat.value}%, ${controls.userLight.value}%)`, charBg: `hsl(${controls.charHue.value}, ${controls.charSat.value}%, ${controls.charLight.value}%)`,
        };
        previewContainer.style.transform = `scale(${styles.scale})`;
        [previewUserBubble, previewCharBubble].forEach(bubble => {
            bubble.style.borderRadius = styles.mainRadius; bubble.style.fontSize = styles.fontSize; bubble.style.boxShadow = styles.shadow;
        });
        previewUserBubble.style.borderBottomRightRadius = styles.cornerRadius; previewUserBubble.style.backgroundColor = styles.userBg; userColorPreview.style.backgroundColor = styles.userBg;
        previewCharBubble.style.borderBottomLeftRadius = styles.cornerRadius; previewCharBubble.style.backgroundColor = styles.charBg; charColorPreview.style.backgroundColor = styles.charBg;
        const bgUrl = controls.chatBgUrl.value.trim();
        const bgPreviewUrl = controls.chatBgPreview.style.backgroundImage.slice(5, -2);
        previewContainer.style.backgroundImage = bgUrl ? `url(${bgUrl})` : (bgPreviewUrl ? `url(${bgPreviewUrl})` : '');
    };

    form.querySelectorAll('input[type="range"], textarea, input[type="number"]').forEach(input => input.addEventListener('input', updateLiveStyles));
    controls.chatBgPreview.addEventListener('click', () => controls.chatBgUpload.click());
    controls.chatBgUpload.addEventListener('change', e => handleFileUpload(e, controls.chatBgPreview, controls.chatBgUrl, updateLiveStyles));
    controls.chatBgUrl.addEventListener('input', e => handleUrlInput(e, controls.chatBgPreview, updateLiveStyles));
    controls.apiIconPreview.addEventListener('click', () => controls.apiIconUpload.click());
    controls.apiIconUpload.addEventListener('change', e => handleFileUpload(e, controls.apiIconPreview, controls.apiIconUrl));
    controls.apiIconUrl.addEventListener('input', e => handleUrlInput(e, controls.apiIconUrl));

    function handleFileUpload(event, previewElement, urlElement, callback) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target.result;
                if (previewElement.tagName === 'IMG') previewElement.src = result; else previewElement.style.backgroundImage = `url(${result})`;
                urlElement.value = ''; if(callback) callback();
            };
            reader.readAsDataURL(file);
        }
    }
    function handleUrlInput(event, previewElement, callback) {
        const url = event.target.value.trim();
        if (url) { if (previewElement.tagName === 'IMG') previewElement.src = url; else previewElement.style.backgroundImage = `url(${url})`; }
        else { if (previewElement.tagName !== 'IMG') previewElement.style.backgroundImage = ''; }
        if(callback) callback();
    }

    form.querySelector('#save-chat-settings-btn').addEventListener('click', () => {
        const char = characters.find(c => c.id === activeCharacterId);
        if (char) {
            char.chatSettings.displayCount = parseInt(controls.displayCount.value) || 50;
            char.chatSettings.contextCount = parseInt(controls.contextCount.value) || 20;
            char.chatSettings.apiReplyIcon = controls.apiIconPreview.src;
            char.chatSettings.chatBackground = controls.chatBgUrl.value.trim() || (controls.chatBgPreview.style.backgroundImage.slice(5, -2).replace(/"/g, ''));
            char.chatSettings.bubbleStyles = {
                scale: parseInt(controls.scale.value), mainRadius: parseInt(controls.mainRadius.value), cornerRadius: parseInt(controls.cornerRadius.value), fontSize: parseInt(controls.fontSize.value), shadow: parseInt(controls.shadow.value),
                userHue: parseInt(controls.userHue.value), userSaturation: parseInt(controls.userSat.value), userLightness: parseInt(controls.userLight.value),
                charHue: parseInt(controls.charHue.value), charSaturation: parseInt(controls.charSat.value), charLightness: parseInt(controls.charLight.value),
                customCSS: controls.customCSS.value,
            };
            saveCharacters(); alert('聊天设置已保存！'); applyChatStyles(char.id); renderChatInterface(); showScreen('chatInterface');
        }
    });

    form.querySelector('#reset-style-settings-btn').addEventListener('click', () => {
         if (confirm('确定要重置所有美化设置吗？')) {
            const char = characters.find(c => c.id === activeCharacterId);
            if(char) {
                delete char.chatSettings.bubbleStyles; delete char.chatSettings.apiReplyIcon; delete char.chatSettings.chatBackground;
                initializeDataDefaults(char); saveCharacters(); renderChatSettingsScreen(); applyChatStyles(char.id);
            }
         }
    });
    updateLiveStyles();
}

function renderCharacterSettings() {
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) return;
    initializeDataDefaults(char);
    const ta = char.timeAwareness;
    const currentPlan = char.schedules.plans[char.schedules.activePlanIndex];

    const formContainer = document.getElementById('character-form');
    formContainer.innerHTML = `
        <div class="setting-section">
            <div class="avatar-setting">
                <img id="char-avatar-preview" src="${char.avatar || 'https://placehold.co/100x100/ffffff/89b0d6?text=Avatar'}" alt="角色头像">
                <input type="file" id="char-avatar-upload" accept="image/*">
                <div>点击头像上传或输入URL</div>
                <input type="text" id="char-avatar-url" class="themed-input" placeholder="或者在此处粘贴图片URL" value="${char.avatar && char.avatar.startsWith('http') ? char.avatar : ''}">
            </div>
        </div>

        <div class="setting-section">
            <h3>基本信息</h3>
            <div class="form-group"><label for="char-name">姓名 (角色自己知道的名字)</label><input type="text" id="char-name" required value="${char.name || ''}"></div>
            <div class="form-group"><label for="char-nickname">角色备注 (你对TA的称呼)</label><input type="text" id="char-nickname" placeholder="例如：我的小可爱" value="${char.nickname || ''}"></div>
            <div class="form-group"><label for="char-birthdate">生日 (年龄: ${calculateAge(char.birthdate)})</label><input type="date" id="char-birthdate" required value="${char.birthdate || ''}"></div>
            <div class="form-group"><label for="char-persona">人物设定</label><textarea id="char-persona" placeholder="...">${char.persona || ''}</textarea></div>
        </div>
        
        <!-- 【新增】知识库选择器 -->
        <div class="setting-section">
            <h3>知识库 (来自Reminder)</h3>
            <p class="setting-description">从Reminder App中选择条目，作为此角色的永久记忆和设定补充。</p>
            <div id="reminder-items-selector" class="reminder-selector-container">
                <p class="loading-text">正在加载知识库条目...</p>
            </div>
        </div>

        <div class="setting-section">
            <h3>世界感知</h3>
            <div class="setting-group-toggle">
                <label for="time-awareness-enabled">感知实时时间</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="time-awareness-enabled" ${ta.enabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="form-group">
                <label for="char-timezone">角色的时区</label>
                <select id="char-timezone" class="themed-input">${generateSelectOptions(TIMEZONES, ta.charTimezone)}</select>
            </div>

            <div class="setting-group-toggle">
                <label for="knows-user-timezone">知晓用户时区</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="knows-user-timezone" ${ta.knowsUserTimezone ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
             <div class="form-group" id="user-timezone-group" style="${ta.knowsUserTimezone ? '' : 'display:none;'}">
                <label for="user-timezone">用户的时区</label>
                <select id="user-timezone" class="themed-input">
                    <option value="auto" ${ta.userTimezone === 'auto' ? 'selected' : ''}>自动检测</option>
                    ${generateSelectOptions(TIMEZONES, ta.userTimezone)}
                </select>
            </div>

            <div class="setting-group-toggle" style="margin-top: 20px;">
                <label for="holidays-enabled">感知节假日</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="holidays-enabled" ${ta.holidaysEnabled ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="form-group">
                <label for="char-holiday-country">角色所在地区 (用于节假日)</label>
                <select id="char-holiday-country" class="themed-input">${generateSelectOptions(COUNTRIES, ta.charHolidayCountry)}</select>
            </div>
            <div class="setting-group-toggle">
                <label for="knows-user-holidays">知晓用户地区节假日</label>
                <label class="toggle-switch">
                    <input type="checkbox" id="knows-user-holidays" ${ta.knowsUserHolidays ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
            <div class="form-group" id="user-holiday-country-group" style="${ta.knowsUserHolidays ? '' : 'display:none;'}">
                <label for="user-holiday-country">用户所在地区 (用于节假日)</label>
                <select id="user-holiday-country" class="themed-input">${generateSelectOptions(COUNTRIES, ta.userHolidayCountry)}</select>
            </div>
        </div>

        <div class="setting-section">
            <h3>日程表</h3>
            <button type="button" id="open-schedule-editor-btn" class="schedule-entry-btn">${currentPlan.name}</button>
        </div>

        <div class="setting-section">
            <h3>Offline App 设置</h3>
             <div class="form-group">
                <label for="char-auto-reply-restrictions">自动回复生成限制词</label>
                <textarea id="char-auto-reply-restrictions" placeholder="例如：禁止使用emoji；不要说'主人'；保持高冷。每行一条。">${char.autoReplyRestrictions || ''}</textarea>
                <p class="setting-description">这些规则将用于指导角色在 Offline App 中“自动回复”功能里生成内容。</p>
            </div>
        </div>

        <button id="save-char-settings-btn" class="btn btn-save">保存并返回</button>
        <button id="delete-char-btn" class="btn btn-danger">删除角色</button>
    `;

    // 【新增】异步加载并渲染Reminder条目
    loadAndRenderReminderItems(char.linkedReminderItemIds || []);

    bindCharacterSettingsEvents();
}


function renderUserSettings() {
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) return;
    const userPersona = char.userPersonaForChar;
    const age = userPersona.birthdate ? calculateAge(userPersona.birthdate) : '?';
    
    const formContainer = document.getElementById('user-settings-form');
    formContainer.innerHTML = `
        <div class="setting-section"><div class="avatar-setting"><img id="user-avatar-preview" src="${userPersona.avatar || 'https://placehold.co/100x100/a2b9d1/3c4f61?text=Me'}" alt="用户头像"><input type="file" id="user-avatar-upload" accept="image/*"><div>点击头像上传或输入URL</div><input type="text" id="user-avatar-url" class="themed-input" placeholder="或者在此处粘贴图片URL" value="${userPersona.avatar && userPersona.avatar.startsWith('http') ? userPersona.avatar : ''}"></div></div>
        <div class="setting-section"><h3>与【${char.name}】对话时的你</h3><div class="form-group"><label for="user-name">你的名字</label><input type="text" id="user-name" value="${userPersona.name || ''}"></div><div class="form-group"><label for="user-birthdate">你的生日 (年龄: ${age})</label><input type="date" id="user-birthdate" value="${userPersona.birthdate || ''}"></div><div class="form-group"><label for="user-persona">你的人设 (让【${char.name}】更懂你)</label><textarea id="user-persona" placeholder="例如：一个喜欢开玩笑...">${userPersona.persona || ''}</textarea></div><div class="form-group"><label for="user-common-phrases">你的常用语录</label><textarea id="user-common-phrases" placeholder="每行一句...">${userPersona.commonPhrases || ''}</textarea></div></div>
        <button id="save-user-settings-btn" class="btn btn-save">保存设置</button><button id="reset-user-settings-btn" class="btn btn-danger">重置此角色的“我的设置”</button>
    `;
    bindUserSettingsEvents();
}

function renderScheduleEditor() {
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) return;
    const currentPlan = char.schedules.plans[char.schedules.activePlanIndex];
    const container = document.getElementById('schedule-editor-content');

    let planManagerHTML = `<h4>管理方案</h4><div class="schedule-plan-manager"><select id="plan-select" class="themed-input">${char.schedules.plans.map((p, i) => `<option value="${i}" ${i === char.schedules.activePlanIndex ? 'selected' : ''}>${p.name}</option>`).join('')}</select><button type="button" id="new-plan-btn" class="btn-icon">+</button><button type="button" id="delete-plan-btn" class="btn-icon">-</button></div>`;
    let timedEventsHTML = '<h4>日程 (时间段)</h4><div id="timed-events-list">';
    currentPlan.timedEvents.forEach((event, index) => {
        timedEventsHTML += `<div class="timed-event-item"><div class="time-range"><input type="time" class="timed-start-time" data-index="${index}" value="${event.startTime || ''}"><span>-</span><input type="time" class="timed-end-time" data-index="${index}" value="${event.endTime || ''}"></div><input type="text" class="event-input timed-event-desc" placeholder="事件描述" data-index="${index}" value="${event.event || ''}"><button type="button" class="delete-btn delete-timed-event-btn" data-index="${index}">-</button></div>`;
    });
    timedEventsHTML += '</div><button type="button" id="add-timed-event-btn" class="btn-add">+ 添加日程</button>';
    let specificEventsHTML = '<h4>具体时间补充</h4><div id="specific-events-list">';
    currentPlan.specificEvents.forEach((event, index) => {
        specificEventsHTML += `<div class="specific-event-item"><input type="time" class="specific-time-input" data-index="${index}" value="${event.time || ''}"><input type="text" class="event-input specific-event-desc" placeholder="事件描述" data-index="${index}" value="${event.event || ''}"><button type="button" class="delete-btn delete-specific-event-btn" data-index="${index}">-</button></div>`;
    });
    specificEventsHTML += '</div><button type="button" id="add-specific-event-btn" class="btn-add">+ 补充具体时间</button>';
    container.innerHTML = planManagerHTML + timedEventsHTML + specificEventsHTML;
}

function bindCharacterSettingsEvents() {
    const form = document.getElementById('character-form');
    if (!form) return;
    form.querySelector('#char-avatar-preview').addEventListener('click', () => form.querySelector('#char-avatar-upload').click());
    form.querySelector('#char-avatar-upload').addEventListener('change', (e) => {
        if(e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => { form.querySelector('#char-avatar-preview').src = event.target.result; form.querySelector('#char-avatar-url').value = ''; };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    document.getElementById('open-schedule-editor-btn').addEventListener('click', () => {
        renderScheduleEditor(); bindScheduleEditorEvents(); document.getElementById('schedule-editor-overlay').classList.remove('hidden');
    });

    // 【修改】世界感知设置的交互
    const knowsUserTimezoneToggle = form.querySelector('#knows-user-timezone');
    if (knowsUserTimezoneToggle) {
        knowsUserTimezoneToggle.addEventListener('change', (e) => {
            document.getElementById('user-timezone-group').style.display = e.target.checked ? '' : 'none';
        });
    }

    const knowsUserHolidaysToggle = form.querySelector('#knows-user-holidays');
    if (knowsUserHolidaysToggle) {
        knowsUserHolidaysToggle.addEventListener('change', (e) => {
            document.getElementById('user-holiday-country-group').style.display = e.target.checked ? '' : 'none';
        });
    }

    form.querySelector('#save-char-settings-btn').addEventListener('click', () => saveCharacterSettings(form));
    form.querySelector('#delete-char-btn').addEventListener('click', () => deleteCharacter());
}

function bindScheduleEditorEvents() {
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) return;
    const editor = document.getElementById('schedule-editor-content');

    const updateAndRerender = () => { saveCharacters(); renderScheduleEditor(); bindScheduleEditorEvents(); };

    document.getElementById('schedule-editor-close-btn').addEventListener('click', () => {
        document.getElementById('schedule-editor-overlay').classList.add('hidden'); renderCharacterSettings(); 
    });
    
    editor.addEventListener('click', (e) => {
        if (e.target.id === 'new-plan-btn') { const name = prompt("新方案名称:", "新日程"); if (name) { char.schedules.plans.push({ name, timedEvents: [], specificEvents: [] }); char.schedules.activePlanIndex = char.schedules.plans.length - 1; updateAndRerender(); } }
        else if (e.target.id === 'delete-plan-btn') { if (char.schedules.plans.length > 1 && confirm('确定删除当前方案吗？')) { char.schedules.plans.splice(char.schedules.activePlanIndex, 1); char.schedules.activePlanIndex = 0; updateAndRerender(); } }
        else if (e.target.id === 'add-timed-event-btn') { char.schedules.plans[char.schedules.activePlanIndex].timedEvents.push({ startTime: '', endTime: '', event: '' }); updateAndRerender(); }
        else if (e.target.id === 'add-specific-event-btn') { char.schedules.plans[char.schedules.activePlanIndex].specificEvents.push({ time: '', event: '' }); updateAndRerender(); }
        else if (e.target.classList.contains('delete-timed-event-btn')) { char.schedules.plans[char.schedules.activePlanIndex].timedEvents.splice(parseInt(e.target.dataset.index, 10), 1); updateAndRerender(); }
        else if (e.target.classList.contains('delete-specific-event-btn')) { char.schedules.plans[char.schedules.activePlanIndex].specificEvents.splice(parseInt(e.target.dataset.index, 10), 1); updateAndRerender(); }
    });

    editor.addEventListener('change', (e) => {
        const plan = char.schedules.plans[char.schedules.activePlanIndex]; const index = parseInt(e.target.dataset.index, 10);
        if (e.target.id === 'plan-select') { char.schedules.activePlanIndex = parseInt(e.target.value, 10); updateAndRerender(); }
        else if (e.target.classList.contains('timed-start-time')) { plan.timedEvents[index].startTime = e.target.value; }
        else if (e.target.classList.contains('timed-end-time')) { plan.timedEvents[index].endTime = e.target.value; }
        else if (e.target.classList.contains('timed-event-desc')) { plan.timedEvents[index].event = e.target.value; }
        else if (e.target.classList.contains('specific-time-input')) { plan.specificEvents[index].time = e.target.value; }
        else if (e.target.classList.contains('specific-event-desc')) { plan.specificEvents[index].event = e.target.value; }
        saveCharacters();
    });
}

function bindUserSettingsEvents() {
    const form = document.getElementById('user-settings-form');
    if (!form) return;
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) return;

    form.querySelector('#user-avatar-preview').addEventListener('click', () => form.querySelector('#user-avatar-upload').click());
    form.querySelector('#user-avatar-upload').addEventListener('change', (e) => {
        if(e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => { form.querySelector('#user-avatar-preview').src = event.target.result; form.querySelector('#user-avatar-url').value = ''; };
            reader.readAsDataURL(e.target.files[0]);
        }
    });
    form.querySelector('#user-avatar-url').addEventListener('input', (e) => { if (e.target.value.trim()) form.querySelector('#user-avatar-preview').src = e.target.value.trim(); });
    form.querySelector('#user-birthdate').addEventListener('change', (e) => { e.target.previousElementSibling.textContent = `你的生日 (年龄: ${calculateAge(e.target.value)})`; });
    
    form.querySelector('#save-user-settings-btn').addEventListener('click', () => { 
        char.userPersonaForChar = {
            name: form.querySelector('#user-name').value.trim(), avatar: form.querySelector('#user-avatar-preview').src, birthdate: form.querySelector('#user-birthdate').value,
            persona: form.querySelector('#user-persona').value.trim(), commonPhrases: form.querySelector('#user-common-phrases').value.trim()
        };
        saveCharacters(); alert('你的设置已保存！'); renderChatInterface(); showScreen('chat-interface');
    });

    form.querySelector('#reset-user-settings-btn').addEventListener('click', () => { 
        if (confirm(`确定要重置与【${char.name}】对话时的“我的设置”吗？`)) {
            delete char.userPersonaForChar; initializeDataDefaults(char); saveCharacters(); renderUserSettings(); alert('设置已重置。');
        }
    });
}


function deleteCharacter() {
    if (confirm('确定要删除这个角色吗？')) {
        const charIndex = characters.findIndex(c => c.id === activeCharacterId);
        if (charIndex > -1) {
            characters.splice(charIndex, 1); saveCharacters(); activeCharacterId = null; renderChatList(); showScreen('chat-list');
        }
    }
}

function calculateAge(birthdateString) {
    if (!birthdateString) return '?';
    const birthDate = new Date(birthdateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
}

// --- 【修改】内存分析功能 ---

/**
 * 辅助函数：获取字符串的字节大小
 * @param {string} str 
 * @returns {number} 字节数
 */
function getBytesSize(str) {
    return new Blob([str]).size;
}

/**
 * 辅助函数：格式化字节数为可读单位 (KB, MB, GB)
 * @param {number} bytes 
 * @returns {string} 格式化后的字符串
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


/**
 * 渲染内存分析屏幕 (逻辑已重构)
 */
function renderMemoryAnalysisScreen() {
    const container = document.getElementById('memory-analysis-content');
    container.innerHTML = '正在分析...';

    // 1. 数据收集与计算
    const apiSettingsStr = localStorage.getItem(API_SETTINGS_KEY) || '';
    const charactersStr = localStorage.getItem(CHARACTERS_KEY) || '[]';
    // 【新增】获取 Reminder App 数据
    const reminderDataStr = localStorage.getItem('bluecoze_reminder_app_data') || '{}';
    
    const apiSize = getBytesSize(apiSettingsStr);
    const reminderAppSize = getBytesSize(reminderDataStr);
    const localChars = JSON.parse(charactersStr);
    const localReminders = JSON.parse(reminderDataStr);

    let totalCozeSize = 0;
    let totalOfflineSize = 0;
    let cozeCharDetails = [];
    let offlineCharDetails = [];

    // 2. 遍历所有角色，分离并计算Coze和Offline数据
    localChars.forEach(char => {
        // Coze (在线) 数据
        const chatHistorySize = getBytesSize(JSON.stringify(char.chatHistory || []));
        const settingsSize = getBytesSize(JSON.stringify(char.chatSettings || {}) + JSON.stringify(char.userPersonaForChar || {}));
        const personaSize = getBytesSize(JSON.stringify({p: char.persona, n: char.name, a: char.avatar, b: char.birthdate}));
        const schedulesSize = getBytesSize(JSON.stringify(char.schedules || {}));
        const charCozeTotal = chatHistorySize + settingsSize + personaSize + schedulesSize;
        totalCozeSize += charCozeTotal;

        if (charCozeTotal > 0) {
            cozeCharDetails.push({
                id: char.id, name: char.name || '未命名角色', avatar: char.avatar || 'https://placehold.co/100x100/ffffff/89b0d6?text=?', totalSize: charCozeTotal,
                breakdown: [
                    { label: '聊天记录', size: chatHistorySize, color: '#f28b82' },
                    { label: '角色与聊天设置', size: settingsSize, color: '#fdd663' },
                    { label: '核心设定', size: personaSize, color: '#f08ab1' },
                    { label: '日程表', size: schedulesSize, color: '#ada9fc' },
                ].sort((a,b) => b.size - a.size)
            });
        }

        // Offline 数据
        const autoRepliesSize = getBytesSize(JSON.stringify(char.autoReplies || []));
        const randomInfoSize = getBytesSize(JSON.stringify(char.randomInfo || []));
        const charOfflineTotal = autoRepliesSize + randomInfoSize;
        totalOfflineSize += charOfflineTotal;
        
        if (charOfflineTotal > 0) {
            offlineCharDetails.push({
                id: char.id, name: char.name || '未命名角色', avatar: char.avatar || 'https://placehold.co/100x100/ffffff/89b0d6?text=?', totalSize: charOfflineTotal,
                breakdown: [
                    { label: '随机信息', size: randomInfoSize, color: '#81c995' },
                    { label: '自动回复', size: autoRepliesSize, color: '#7b95e0' },
                ].sort((a,b) => b.size - a.size)
            });
        }
    });

    // 【新增】计算 Reminder App 详细数据
    const reminderDetails = {
        totalSize: reminderAppSize,
        breakdown: []
    };
    if (localReminders.categories && localReminders.items) {
        reminderDetails.breakdown = localReminders.categories.map(category => {
            const itemsInCategory = localReminders.items.filter(item => item.category === category);
            return {
                label: category,
                size: getBytesSize(JSON.stringify(itemsInCategory)),
                color: '#ffab40' // 使用统一的颜色
            };
        }).sort((a, b) => b.size - a.size);
    }
    
    // 按总大小排序
    cozeCharDetails.sort((a, b) => b.totalSize - a.totalSize);
    offlineCharDetails.sort((a, b) => b.totalSize - a.totalSize);

    // 3. 准备饼图数据
    const analysisData = [
        { label: 'Coze App', size: totalCozeSize, color: '#89b0d6' },
        { label: 'Offline App', size: totalOfflineSize, color: '#ada9fc' },
        // 【新增】Reminder App 加入饼图
        { label: 'Reminder App', size: reminderAppSize, color: '#ffab40' },
        { label: 'API 设置', size: apiSize, color: '#60c5a0' },
    ].filter(item => item.size > 0); // 只显示有数据的部分

    // 4. 渲染HTML
    let legendHTML = analysisData.map(item => `
        <div class="memory-legend-item">
            <div class="memory-legend-color" style="background-color: ${item.color};"></div>
            <div class="memory-legend-label">${item.label}</div>
            <div class="memory-legend-value">${formatBytes(item.size)}</div>
        </div>
    `).join('');

    const buildCharCardsHTML = (charDetails) => {
        if (charDetails.length === 0) return '<p class="empty-list-info" style="padding: 10px 0;">此应用暂无数据</p>';
        return charDetails.map(char => {
            let itemsHTML = char.breakdown.map(item => `
                <li class="memory-item">
                    <div class="memory-item-label">
                        <span>${item.label}</span>
                        <span class="value">${formatBytes(item.size)}</span>
                    </div>
                    <div class="memory-item-bar">
                        <div class="memory-item-bar-fill" style="width: ${char.totalSize > 0 ? (item.size / char.totalSize * 100) : 0}%; background-color: ${item.color};"></div>
                    </div>
                </li>
            `).join('');

            return `
                <div class="memory-char-card">
                    <div class="memory-char-header">
                        <div class="memory-header-title">
                            <img src="${char.avatar}" alt="${char.name}">
                            <span>${char.name}</span>
                        </div>
                        <span class="memory-header-value">${formatBytes(char.totalSize)}</span>
                    </div>
                    <ul class="memory-item-list">${itemsHTML}</ul>
                </div>
            `;
        }).join('');
    };

    // 【新增】渲染Reminder App详细信息的函数
    const buildReminderDetailsHTML = (details) => {
        if (details.totalSize === 0) return '<p class="empty-list-info" style="padding: 10px 0;">此应用暂无数据</p>';
        let itemsHTML = details.breakdown.map(item => `
            <li class="memory-item">
                <div class="memory-item-label">
                    <span>${item.label}</span>
                    <span class="value">${formatBytes(item.size)}</span>
                </div>
                <div class="memory-item-bar">
                    <div class="memory-item-bar-fill" style="width: ${details.totalSize > 0 ? (item.size / details.totalSize * 100) : 0}%; background-color: ${item.color};"></div>
                </div>
            </li>
        `).join('');
        return `<div class="memory-char-card"><ul class="memory-item-list">${itemsHTML}</ul></div>`;
    };


    container.innerHTML = `
        <div class="memory-summary-card">
            <div id="memory-chart-container">
                <canvas id="memory-chart"></canvas>
            </div>
            <div class="memory-legend">
                ${legendHTML}
            </div>
        </div>
        <div class="memory-details-list">
            <div class="memory-app-card">
                <div class="memory-app-header">
                    <span>Coze App 详细数据</span>
                    <span class="memory-header-value">${formatBytes(totalCozeSize)}</span>
                </div>
                ${buildCharCardsHTML(cozeCharDetails)}
            </div>
            <div class="memory-app-card">
                <div class="memory-app-header">
                    <span>Offline App 详细数据</span>
                    <span class="memory-header-value">${formatBytes(totalOfflineSize)}</span>
                </div>
                ${buildCharCardsHTML(offlineCharDetails)}
            </div>
            <!-- 【新增】Reminder App 详情卡片 -->
            <div class="memory-app-card">
                <div class="memory-app-header">
                    <span>Reminder App 详细数据</span>
                    <span class="memory-header-value">${formatBytes(reminderAppSize)}</span>
                </div>
                ${buildReminderDetailsHTML(reminderDetails)}
            </div>
        </div>
    `;

    // 5. 渲染图表
    if (analysisData.length > 0) {
        const ctx = document.getElementById('memory-chart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: analysisData.map(d => d.label),
                datasets: [{
                    data: analysisData.map(d => d.size),
                    backgroundColor: analysisData.map(d => d.color),
                    borderWidth: 2,
                    borderColor: 'var(--light-blue-bg)',
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: true, cutout: '60%',
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.label}: ${formatBytes(context.parsed)}`
                        }
                    }
                }
            }
        });
    } else {
        document.getElementById('memory-chart-container').innerHTML = '<p class="empty-list-info" style="padding: 40px 0;">无数据可供分析</p>';
    }
}

/**
 * 【新增】加载并渲染Reminder条目到角色设置页
 * @param {string[]} selectedIds - 当前角色已选择的条目ID数组
 */
function loadAndRenderReminderItems(selectedIds) {
    const container = document.getElementById('reminder-items-selector');
    if (!container) return;

    // 从 localStorage 加载 Reminder 数据
    const reminderDataJSON = localStorage.getItem('bluecoze_reminder_app_data');
    const reminderData = reminderDataJSON ? JSON.parse(reminderDataJSON) : { categories: [], items: [] };

    if (!reminderData.items || reminderData.items.length === 0) {
        container.innerHTML = '<p class="empty-text">Reminder App中还没有条目</p>';
        return;
    }

    container.innerHTML = ''; // 清空加载中提示

    const typeMap = { 'worldview': '世界观', 'prompt': '提示词', 'chat_hint': '聊天提示' };

    reminderData.categories.forEach(category => {
        const itemsInCategory = reminderData.items.filter(item => item.category === category);
        if (itemsInCategory.length === 0) return;

        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'reminder-category-group';

        const categoryHeader = document.createElement('div');
        categoryHeader.className = 'reminder-category-header';
        
        const categoryCheckboxId = `cat-sel-${category.replace(/\s/g, '-')}`;
        categoryHeader.innerHTML = `
            <label class="custom-checkbox-label" for="${categoryCheckboxId}">
                <input type="checkbox" id="${categoryCheckboxId}" data-category="${category}">
                <span class="checkbox-box"><span class="checkbox-tick"></span></span>
                <span>${category} (全选)</span>
            </label>
        `;
        categoryGroup.appendChild(categoryHeader);

        const itemsList = document.createElement('div');
        itemsList.className = 'reminder-items-list';
        
        itemsInCategory.forEach(item => {
            const isChecked = selectedIds.includes(item.id);
            const itemCheckboxId = `item-sel-${item.id}`;
            const itemRow = document.createElement('div');
            itemRow.className = 'reminder-item-row';
            itemRow.innerHTML = `
                <label class="custom-checkbox-label" for="${itemCheckboxId}">
                    <input type="checkbox" id="${itemCheckboxId}" value="${item.id}" ${isChecked ? 'checked' : ''}>
                    <span class="checkbox-box"><span class="checkbox-tick"></span></span>
                    <span>${item.name}</span>
                    <span class="item-type-tag">${typeMap[item.type] || item.type}</span>
                </label>
            `;
            itemsList.appendChild(itemRow);
        });

        categoryGroup.appendChild(itemsList);
        container.appendChild(categoryGroup);
    });

    // 添加全选/取消全选的逻辑
    container.querySelectorAll('input[data-category]').forEach(catCheckbox => {
        catCheckbox.addEventListener('change', (e) => {
            const category = e.target.dataset.category;
            const isChecked = e.target.checked;
            const itemsInCategory = reminderData.items.filter(item => item.category === category);
            itemsInCategory.forEach(item => {
                const itemCheckbox = container.querySelector(`input[value="${item.id}"]`);
                if (itemCheckbox) itemCheckbox.checked = isChecked;
            });
        });
    });
}

function saveCharacterSettings(form) {
    const char = characters.find(c => c.id === activeCharacterId);
    if (!char) return;
    char.name = form.querySelector('#char-name').value.trim() || '未命名';
    char.nickname = form.querySelector('#char-nickname').value.trim();
    char.avatar = form.querySelector('#char-avatar-preview').src;
    char.birthdate = form.querySelector('#char-birthdate').value;
    char.persona = form.querySelector('#char-persona').value;
    char.autoReplyRestrictions = form.querySelector('#char-auto-reply-restrictions').value.trim();
    
    // 【修改】保存世界感知设置
    char.timeAwareness = {
        enabled: form.querySelector('#time-awareness-enabled').checked,
        charTimezone: form.querySelector('#char-timezone').value,
        knowsUserTimezone: form.querySelector('#knows-user-timezone').checked,
        userTimezone: form.querySelector('#user-timezone').value,
        holidaysEnabled: form.querySelector('#holidays-enabled').checked,
        charHolidayCountry: form.querySelector('#char-holiday-country').value,
        userHolidayCountry: form.querySelector('#user-holiday-country').value,
        knowsUserHolidays: form.querySelector('#knows-user-holidays').checked
    };

    // 【新增】保存关联的Reminder条目
    const selectedReminderIds = [];
    const reminderCheckboxes = form.querySelectorAll('#reminder-items-selector input[type="checkbox"]');
    reminderCheckboxes.forEach(checkbox => {
        // 只收集条目的checkbox，忽略分类的全选checkbox
        if (checkbox.checked && checkbox.value) {
            selectedReminderIds.push(checkbox.value);
        }
    });
    char.linkedReminderItemIds = selectedReminderIds;

    saveCharacters();
    alert('角色设置已保存！'); renderChatInterface(); renderChatList(); showScreen('chat-interface');
}
