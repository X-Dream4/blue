// 文件: js/offline-app-core.js (新)

// 全局变量，用于追踪在Offline App中当前选中的角色
let activeOfflineCharacterId = null;

/**
 * 渲染Offline App的角色选择列表。
 */
function renderOfflineCharacterList() {
    loadCharacters(); 
    const container = document.getElementById('offline-character-grid-container');
    container.innerHTML = '';
    
    if (!characters || characters.length === 0) {
        container.innerHTML = '<p style="text-align:center; opacity:0.7; grid-column: 1 / -1;">没有可用的角色。请先在Coze中创建角色。</p>';
        return;
    }

    characters.forEach(char => {
        const charEl = document.createElement('div');
        charEl.className = 'offline-char-capsule';
        charEl.dataset.id = char.id;
        const displayName = char.nickname || char.name;
        
        charEl.innerHTML = `
            <img src="${char.avatar || 'https://placehold.co/100x100/ffffff/89b0d6?text=?'}" alt="${displayName}">
            <span class="name">${displayName}</span>
        `;
        
        charEl.addEventListener('click', () => {
            activeOfflineCharacterId = char.id;
            document.getElementById('offline-hub-char-name').textContent = displayName;
            showScreen('offlineCharacterHub');
        });
        
        container.appendChild(charEl);
    });
}
