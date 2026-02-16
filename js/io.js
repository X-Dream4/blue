// 文件: js/io.js (全新)

function initializeImportExport() {

    const exportBtn = document.getElementById('export-data-btn');
    const importBtn = document.getElementById('import-data-btn');
    const importFileInput = document.getElementById('import-file-input');

    // --- 导出功能 ---
    exportBtn.addEventListener('click', () => {
        try {
            // 【BUG修复】不再导出已废弃的 userSettings
            const allData = {
                apiSettings: localStorage.getItem(API_SETTINGS_KEY),
                characters: localStorage.getItem(CHARACTERS_KEY)
            };

            // 清理null值，避免导出的JSON中出现 "null" 字符串
            for (const key in allData) {
                if (allData[key] === null) {
                    delete allData[key];
                }
            }

            const jsonString = JSON.stringify(allData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().slice(0, 10);
            link.href = url;
            link.download = `BlueCoze_Backup_${timestamp}.json`;
            
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            URL.revokeObjectURL(url);
            alert('数据已成功导出！');

        } catch (error) {
            console.error('导出数据失败:', error);
            alert(`导出失败: ${error.message}`);
        }
    });

    // --- 导入功能 ---
    importBtn.addEventListener('click', () => {
        // 触发隐藏的文件输入框
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const parsedData = JSON.parse(content);

                // 验证文件基本结构
                if (typeof parsedData.apiSettings === 'undefined' && typeof parsedData.characters === 'undefined') {
                    throw new Error('这不是一个有效的备份文件。');
                }

                if (confirm('警告：导入将覆盖当前所有角色、聊天记录和设置。此操作不可撤销！确定要继续吗？')) {
                    // 【BUG修复】不再处理已废弃的 userSettings
                    localStorage.removeItem(API_SETTINGS_KEY);
                    localStorage.removeItem(CHARACTERS_KEY);
                    // localStorage.removeItem(USER_SETTINGS_KEY); // 此行已无用

                    // 导入新数据（如果存在）
                    if (parsedData.apiSettings) {
                        localStorage.setItem(API_SETTINGS_KEY, parsedData.apiSettings);
                    }
                    if (parsedData.characters) {
                        localStorage.setItem(CHARACTERS_KEY, parsedData.characters);
                    }

                    alert('数据导入成功！应用即将刷新。');
                    // 强制刷新页面以应用所有更改
                    window.location.reload();
                }

            } catch (error) {
                console.error('导入数据失败:', error);
                alert(`导入失败: ${error.message}`);
            } finally {
                // 重置文件输入框，以便可以再次选择同一个文件
                importFileInput.value = '';
            }
        };

        reader.onerror = () => {
            alert('读取文件时出错。');
            importFileInput.value = '';
        };

        reader.readAsText(file);
    });
}
