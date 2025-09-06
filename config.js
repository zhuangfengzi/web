// 阿里云RTC Web配置文件
// 测试环境配置（生产环境请使用安全的API获取）

window.ALIYUN_CONFIG = {
    // 直接返回AppID（仅限测试环境）
    getAppId: function() {
        // 请将这里替换为您的实际AppID
        // 例如: return 'abc123def456';
        return 'c5f0f9596feb4afc842dada86443c09d'; // 请替换为真实AppID
    },
    
    // 安全获取AppID（生产环境建议使用）
    fetchAppIdSecurely: async function() {
        try {
            // 从您的安全API端点获取临时AppID
            const response = await fetch('/api/rtc-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    referrer: document.referrer,
                    timestamp: Date.now()
                })
            });
            
            const config = await response.json();
            return config.appId;
        } catch (error) {
            console.error('获取配置失败:', error);
            return ''; // 失败时返回空，阻止使用
        }
    }
};