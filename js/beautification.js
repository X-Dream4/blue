// 文件: js/beautification.js (全新)

const BEAUTIFICATION_SETTINGS_KEY = 'bluecoze_beautification_settings';

const defaultBeautificationSettings = {
    wallpaper: '',
    theme: {
        background: '#bad7f2', // 默认主题背景色
        text: '#3a5f82',       // 默认主题文字颜色
    },
    font: {
        name: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        url: '',
    },
    icons: {
        chat: 'https://placehold.co/130x130/ffffff/89b0d6?text=Coze',
        reminder: 'https://placehold.co/130x130/ffffff/89b0d6?text=Reminder',
        offline: 'https://placehold.co/130x130/ffffff/89b0d6?text=Offline',
        notes: 'https://placehold.co/130x130/ffffff/89b0d6?text=Notes',
        weather: 'https://placehold.co/130x130/ffffff/89b0d6?text=Weather',
        photos: 'https://placehold.co/130x130/ffffff/89b0d6?text=Photos',
        maps: 'https://placehold.co/130x130/ffffff/89b0d6?text=Maps',
        settings: 'https://placehold.co/130x130/ffffff/89b0d6?text=Settings',
    }
};

let beautificationSettings = {};

/**
 * 初始化屏幕美化功能
 */
function initializeBeautification() {
    // 导航
    document.getElementById('beautification-option').addEventListener('click', () => {
        renderBeautificationScreen();
        showScreen('beautification');
    });
    document.getElementById('beautification-back-btn').addEventListener('click', () => {
        showScreen('settings');
    });

    // 加载并应用设置
    loadBeautificationSettings();
}

/**
 * 加载设置
 */
function loadBeautificationSettings() {
    const saved = localStorage.getItem(BEAUTIFICATION_SETTINGS_KEY);
    beautificationSettings = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(defaultBeautificationSettings));
    applyBeautificationSettings();
}

/**
 * 保存设置
 */
function saveBeautificationSettings() {
    localStorage.setItem(BEAUTIFICATION_SETTINGS_KEY, JSON.stringify(beautificationSettings));
    alert('美化设置已保存！');
    applyBeautificationSettings();
}

/**
 * 将设置应用到界面
 */
function applyBeautificationSettings() {
    const styleTag = document.getElementById('dynamic-theme-styles');
    const mainScreen = document.getElementById('main-screen');

    // 1. 应用壁纸
    mainScreen.style.backgroundImage = beautificationSettings.wallpaper ? `url('${beautificationSettings.wallpaper}')` : '';

    // 2. 应用App图标
    for (const app in beautificationSettings.icons) {
        const imgEl = document.getElementById(`img-icon-${app}`);
        if (imgEl) {
            imgEl.src = beautificationSettings.icons[app];
        }
    }

    // 3. 应用主题色和字体
    let cssString = `
        :root {
            --light-blue-bg: ${beautificationSettings.theme.background};
            --light-blue-text: ${beautificationSettings.theme.text};
        }
        body, input, textarea, button, select {
            font-family: '${beautificationSettings.font.name}', sans-serif;
        }
    `;
    if (beautificationSettings.font.url) {
        // 如果是Google Font URL，尝试解析并注入
        if (beautificationSettings.font.url.includes('fonts.googleapis.com')) {
             if (!document.querySelector(`link[href="${beautificationSettings.font.url}"]`)) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = beautificationSettings.font.url;
                document.head.appendChild(link);
            }
        } else { // 否则认为是字体文件URL
             cssString += `
                @font-face {
                    font-family: '${beautificationSettings.font.name}';
                    src: url('${beautificationSettings.font.url}');
                }
            `;
        }
    }
    styleTag.innerHTML = cssString;
}

/**
 * 渲染美化设置屏幕
 */
function renderBeautificationScreen() {
    const container = document.getElementById('beautification-form-container');
    
    let iconsHTML = '';
    for (const app in beautificationSettings.icons) {
        const appName = app.charAt(0).toUpperCase() + app.slice(1);
        iconsHTML += `
            <div class="app-icon-setting-item">
                <img id="preview-icon-${app}" src="${beautificationSettings.icons[app]}" alt="${appName} icon">
                <div class="app-icon-inputs">
                    <label>${appName}</label>
                    <input type="file" class="hidden" id="upload-icon-${app}" data-app="${app}" accept="image/*">
                    <input type="text" class="themed-input" id="url-icon-${app}" data-app="${app}" value="${beautificationSettings.icons[app]}" placeholder="粘贴图片URL">
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="setting-section">
            <h3>主屏幕壁纸</h3>
            <div id="wallpaper-preview" class="background-setting-preview" style="background-image: url('${beautificationSettings.wallpaper}')">
                ${beautificationSettings.wallpaper ? '' : '点击或输入URL设置壁纸'}
            </div>
            <input type="file" id="wallpaper-upload" class="hidden" accept="image/*">
            <input type="text" id="wallpaper-url" class="themed-input" placeholder="或者在此处粘贴图片URL" value="${beautificationSettings.wallpaper}">
        </div>

        <div class="setting-section">
            <h3>主题颜色</h3>
            <div class="color-setting">
                <label for="theme-color-picker">背景色</label>
                <input type="color" id="theme-color-picker" value="${beautificationSettings.theme.background}">
            </div>
        </div>

        <div class="setting-section">
            <h3>全局字体</h3>
            <div class="form-group">
                <label for="font-name-input">字体名称 (需与字体文件或URL对应)</label>
                <input type="text" id="font-name-input" class="themed-input" placeholder="例如: 'Source Han Sans'" value="${beautificationSettings.font.name}">
            </div>
             <div class="form-group">
                <label for="font-url-input">字体URL (例如Google Fonts链接或字体文件URL)</label>
                <input type="text" id="font-url-input" class="themed-input" placeholder="https://fonts.googleapis.com/..." value="${beautificationSettings.font.url}">
                 <p class="setting-description">本地字体文件上传仅在当前会话有效，刷新后将失效。推荐使用URL。</p>
                <input type="file" id="font-upload-input" accept=".ttf,.otf,.woff,.woff2">
            </div>
        </div>

        <div class="setting-section">
            <h3>App 图标</h3>
            <div class="app-icon-setting-list">${iconsHTML}</div>
        </div>
        
        <button id="save-beautification-btn" class="btn btn-save">保存美化设置</button>
        <button id="reset-beautification-btn" class="btn btn-danger">重置为默认</button>
    `;

    bindBeautificationEvents();
}

/**
 * 绑定美化设置页的事件
 */
function bindBeautificationEvents() {
    const container = document.getElementById('beautification-form-container');

    // --- 通用文件/URL处理函数 ---
    const handleFileUpload = (event, previewElement, urlElement) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            if (previewElement.tagName === 'IMG') {
                previewElement.src = result;
            } else {
                previewElement.style.backgroundImage = `url(${result})`;
            }
            if (urlElement) urlElement.value = result; // 将DataURL存入，以便保存
        };
        reader.readAsDataURL(file);
    };
    
    // --- 壁纸 ---
    const wallpaperPreview = container.querySelector('#wallpaper-preview');
    const wallpaperUpload = container.querySelector('#wallpaper-upload');
    const wallpaperUrl = container.querySelector('#wallpaper-url');
    wallpaperPreview.addEventListener('click', () => wallpaperUpload.click());
    wallpaperUpload.addEventListener('change', (e) => handleFileUpload(e, wallpaperPreview, wallpaperUrl));
    wallpaperUrl.addEventListener('input', () => {
        wallpaperPreview.style.backgroundImage = `url('${wallpaperUrl.value}')`;
    });

    // --- App 图标 ---
    container.querySelectorAll('.app-icon-setting-item img').forEach(preview => {
        const app = preview.id.replace('preview-icon-', '');
        preview.addEventListener('click', () => document.getElementById(`upload-icon-${app}`).click());
    });
    container.querySelectorAll('.app-icon-setting-list input[type="file"]').forEach(upload => {
        const app = upload.dataset.app;
        const preview = document.getElementById(`preview-icon-${app}`);
        const urlInput = document.getElementById(`url-icon-${app}`);
        upload.addEventListener('change', (e) => handleFileUpload(e, preview, urlInput));
    });
    container.querySelectorAll('.app-icon-setting-list input[type="text"]').forEach(urlInput => {
        const app = urlInput.dataset.app;
        const preview = document.getElementById(`preview-icon-${app}`);
        urlInput.addEventListener('input', () => { preview.src = urlInput.value; });
    });

    // --- 字体 ---
    const fontUploadInput = container.querySelector('#font-upload-input');
    const fontUrlInput = container.querySelector('#font-url-input');
    fontUploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if(file) {
            // 使用 Object URL，仅限本次会话
            const fontUrl = URL.createObjectURL(file);
            fontUrlInput.value = fontUrl;
        }
    });

    // --- 保存和重置 ---
    container.querySelector('#save-beautification-btn').addEventListener('click', () => {
        // 壁纸
        beautificationSettings.wallpaper = container.querySelector('#wallpaper-url').value;
        // 主题色
        const bgHex = container.querySelector('#theme-color-picker').value;
        beautificationSettings.theme.background = bgHex;
        beautificationSettings.theme.text = getContrastingTextColor(bgHex);
        // 字体
        beautificationSettings.font.name = container.querySelector('#font-name-input').value.trim();
        beautificationSettings.font.url = container.querySelector('#font-url-input').value.trim();
        // App图标
        for (const app in beautificationSettings.icons) {
            beautificationSettings.icons[app] = container.querySelector(`#url-icon-${app}`).value;
        }
        saveBeautificationSettings();
    });

    container.querySelector('#reset-beautification-btn').addEventListener('click', () => {
        if (confirm('确定要重置所有美化设置吗？此操作不可撤销。')) {
            beautificationSettings = JSON.parse(JSON.stringify(defaultBeautificationSettings));
            saveBeautificationSettings();
            renderBeautificationScreen(); // 重新渲染以显示默认值
        }
    });
}

/**
 * 根据背景色计算合适的文字颜色
 * @param {string} hexColor - #RRGGBB 格式的颜色
 * @returns {string} - '#000000' 或 '#FFFFFF'
 */
function getContrastingTextColor(hexColor) {
    if (!hexColor || hexColor.length < 7) return '#000000';
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return (yiq >= 128) ? '#333333' : '#FFFFFF';
}
