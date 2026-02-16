// --- 主屏幕功能：时钟、小组件 ---

function initializeMainScreenFeatures() {
    // 1. 时钟更新
    function updateClock() {
        const now = new Date();
        document.getElementById('current-time').textContent = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        document.getElementById('current-date').textContent = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 星期${weekdays[now.getDay()]}`;
    }
    updateClock();
    setInterval(updateClock, 60000);

    // 2. 图片小组件上传功能
    const imageWidgetContainer = document.getElementById('image-widget-container');
    const imageUploadInput = document.getElementById('image-upload-input');
    const imagePreview = document.getElementById('image-preview');

    imageWidgetContainer.addEventListener('click', () => imageUploadInput.click());
    
    imageUploadInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => { imagePreview.src = e.target.result; };
            reader.readAsDataURL(file);
        }
    });
}