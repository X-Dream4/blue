// --- API设置页面的所有逻辑 ---

function initializeApiSettings() {
    // 加载已保存的设置
    function loadApiSettings() {
        const savedSettings = localStorage.getItem(API_SETTINGS_KEY);
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            const form = DOM.apiForm;
            form.url.value = settings.url || '';
            form.key.value = settings.key || '';
            if (settings.models && settings.models.length > 0) {
                form.modelSelect.innerHTML = '';
                settings.models.forEach(modelId => form.modelSelect.add(new Option(modelId, modelId)));
                form.modelSelect.value = settings.selectedModel || '';
            }
        }
    }

    // 打开/关闭模态框
    document.getElementById('api-settings-option').addEventListener('click', () => {
        DOM.modalOverlay.classList.remove('hidden');
        DOM.apiSettingsModal.classList.remove('hidden');
    });

    const closeModal = () => {
        DOM.modalOverlay.classList.add('hidden');
        DOM.apiSettingsModal.classList.add('hidden');
    };
    document.getElementById('close-modal-btn').addEventListener('click', closeModal);
    DOM.modalOverlay.addEventListener('click', closeModal);

    // 拉取模型列表
    DOM.apiForm.fetchBtn.addEventListener('click', async () => {
        const form = DOM.apiForm;
        const url = form.url.value.trim();
        const key = form.key.value.trim();
        if (!url || !key) {
            alert('请先输入API地址和密钥！');
            return;
        }

        const modelsUrl = url.endsWith('/') ? `${url}v1/models` : `${url}/v1/models`;
        form.fetchBtn.textContent = '拉取中...';
        form.fetchBtn.disabled = true;

        try {
            const response = await fetch(modelsUrl, { headers: { 'Authorization': `Bearer ${key}` } });
            if (!response.ok) throw new Error(`网络请求失败: ${response.status}`);
            
            const data = await response.json();
            const models = data.data;
            if (!models || models.length === 0) {
                alert('未能获取到模型列表，请检查API地址和密钥。');
                return;
            }

            form.modelSelect.innerHTML = '';
            models.forEach(model => form.modelSelect.add(new Option(model.id, model.id)));
            alert('模型列表拉取成功！');
        } catch (error) {
            alert(`拉取模型失败: ${error.message}`);
        } finally {
            form.fetchBtn.textContent = '拉取';
            form.fetchBtn.disabled = false;
        }
    });

    // 保存设置
    DOM.apiForm.form.addEventListener('submit', (event) => {
        event.preventDefault();
        const form = DOM.apiForm;
        const availableModels = Array.from(form.modelSelect.options).map(opt => opt.value);
        const settings = {
            url: form.url.value.trim(),
            key: form.key.value.trim(),
            selectedModel: form.modelSelect.value,
            models: availableModels
        };
        localStorage.setItem(API_SETTINGS_KEY, JSON.stringify(settings));
        alert('API设置已保存！');
        closeModal();
    });

    // 初始化时加载数据
    loadApiSettings();
}
