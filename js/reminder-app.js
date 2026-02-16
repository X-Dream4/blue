// 文件: js/reminder-app.js (全新)

const REMINDER_APP_KEY = 'bluecoze_reminder_app_data';
let reminderData = { categories: [], items: [] };
let currentEditingItemId = null; // 用于跟踪正在编辑的条目ID

/**
 * 初始化 Reminder App
 */
function initializeReminderApp() {
    loadReminderData();

    // 从主屏幕点击图标进入
    document.getElementById('reminder-app-icon').addEventListener('click', (event) => {
        event.preventDefault();
        renderReminderListScreen();
        showScreen('reminderAppList');
    });

    // 从列表页返回主屏幕
    document.getElementById('reminder-list-back-btn').addEventListener('click', () => {
        showScreen('main');
    });

    // 从编辑页返回列表页
    document.getElementById('reminder-editor-back-btn').addEventListener('click', () => {
        currentEditingItemId = null; // 清除编辑状态
        renderReminderListScreen();
        showScreen('reminderAppList');
    });

    // 点击“新建条目”按钮
    document.getElementById('add-new-reminder-item-btn').addEventListener('click', () => {
        currentEditingItemId = null;
        renderItemEditorScreen();
        showScreen('reminderItemEditor');
    });

    // 点击“新建分类”按钮
    document.getElementById('add-new-reminder-category-btn').addEventListener('click', () => {
        const newCategory = prompt('请输入新的分类名称：');
        if (newCategory && newCategory.trim() !== '') {
            if (reminderData.categories.includes(newCategory.trim())) {
                alert('该分类已存在！');
                return;
            }
            reminderData.categories.push(newCategory.trim());
            saveReminderData();
            renderReminderListScreen(); // 刷新列表以显示新分类
        }
    });

    // 保存条目的表单提交事件
    document.getElementById('reminder-editor-form').addEventListener('submit', (event) => {
        event.preventDefault();
        const form = event.target;
        const itemName = form.itemName.value.trim();
        if (!itemName) {
            alert('条目名称不能为空！');
            return;
        }

        if (currentEditingItemId) {
            // 更新现有条目
            const item = reminderData.items.find(i => i.id === currentEditingItemId);
            if (item) {
                item.name = itemName;
                item.category = form.itemCategory.value;
                item.type = form.itemType.value;
                item.content = form.itemContent.value.trim();
            }
        } else {
            // 创建新条目
            const newItem = {
                id: `reminder_${Date.now()}`,
                name: itemName,
                category: form.itemCategory.value,
                type: form.itemType.value,
                content: form.itemContent.value.trim()
            };
            reminderData.items.push(newItem);
        }

        saveReminderData();
        alert('条目已保存！');
        currentEditingItemId = null; // 清除编辑状态
        renderReminderListScreen();
        showScreen('reminderAppList');
    });
}

/**
 * 加载数据
 */
function loadReminderData() {
    const data = localStorage.getItem(REMINDER_APP_KEY);
    reminderData = data ? JSON.parse(data) : { categories: ['默认分类'], items: [] };
    if (!reminderData.categories || reminderData.categories.length === 0) {
        reminderData.categories = ['默认分类'];
    }
}

/**
 * 保存数据
 */
function saveReminderData() {
    localStorage.setItem(REMINDER_APP_KEY, JSON.stringify(reminderData));
}

/**
 * 渲染主列表屏幕
 */
function renderReminderListScreen() {
    loadReminderData();
    const container = document.getElementById('reminder-list-container');
    container.innerHTML = ''; // 清空内容

    if (reminderData.items.length === 0) {
        container.innerHTML = '<p class="empty-list-info">还没有任何条目，点击“+”新建一个吧！</p>';
    } else {
        // 按分类分组
        const groupedItems = reminderData.categories.reduce((acc, category) => {
            acc[category] = reminderData.items.filter(item => item.category === category);
            return acc;
        }, {});

        // 渲染每个分类和其下的条目
        reminderData.categories.forEach(category => {
            const items = groupedItems[category];
            if (!items) return;

            const categorySection = document.createElement('div');
            categorySection.className = 'reminder-category-section';

            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'reminder-category-header';
            categoryHeader.innerHTML = `<span>${category}</span><button class="delete-category-btn" data-category="${category}">×</button>`;
            categorySection.appendChild(categoryHeader);

            categoryHeader.querySelector('.delete-category-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const catToDelete = e.target.dataset.category;
                 if (reminderData.categories.length <= 1) {
                    alert('至少需要保留一个分类！');
                    return;
                }
                if (confirm(`确定要删除“${catToDelete}”分类吗？该分类下的所有条目将被移动到“默认分类”。`)) {
                    // 将条目移动到默认分类
                    reminderData.items.forEach(item => {
                        if (item.category === catToDelete) {
                            item.category = '默认分类';
                        }
                    });
                    // 删除分类
                    reminderData.categories = reminderData.categories.filter(c => c !== catToDelete);
                    saveReminderData();
                    renderReminderListScreen();
                }
            });


            const itemList = document.createElement('div');
            itemList.className = 'reminder-item-list';
            categorySection.appendChild(itemList);

            if (items.length > 0) {
                items.forEach(item => {
                    const itemEl = document.createElement('div');
                    itemEl.className = 'reminder-item';
                    itemEl.dataset.id = item.id;
                    itemEl.textContent = item.name;
                    itemEl.addEventListener('click', () => {
                        currentEditingItemId = item.id;
                        renderItemEditorScreen();
                        showScreen('reminderItemEditor');
                    });
                    itemList.appendChild(itemEl);
                });
            } else {
                itemList.innerHTML = '<p class="empty-category-info">此分类下无条目</p>';
            }

            container.appendChild(categorySection);
        });
    }
}

/**
 * 渲染条目编辑器屏幕
 */
function renderItemEditorScreen() {
    const form = document.getElementById('reminder-editor-form');
    const title = document.getElementById('reminder-editor-title');
    const deleteBtn = document.getElementById('delete-reminder-item-btn');

    // 填充分类下拉菜单
    const categorySelect = form.itemCategory;
    categorySelect.innerHTML = reminderData.categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');

    if (currentEditingItemId) {
        // 编辑模式
        const item = reminderData.items.find(i => i.id === currentEditingItemId);
        if (item) {
            title.textContent = '编辑条目';
            form.itemName.value = item.name;
            form.itemCategory.value = item.category;
            form.itemType.value = item.type;
            form.itemContent.value = item.content;
            deleteBtn.classList.remove('hidden');

            deleteBtn.onclick = () => {
                if (confirm('确定要删除这个条目吗？')) {
                    reminderData.items = reminderData.items.filter(i => i.id !== currentEditingItemId);
                    saveReminderData();
                    currentEditingItemId = null;
                    renderReminderListScreen();
                    showScreen('reminderAppList');
                }
            };

        }
    } else {
        // 新建模式
        title.textContent = '新建条目';
        form.reset();
        deleteBtn.classList.add('hidden');
        deleteBtn.onclick = null;
    }
}

