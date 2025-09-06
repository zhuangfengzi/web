// Web端阿里云RTC配置
// 临时开发配置 - 生产环境请使用安全的配置管理

window.ALIYUN_CONFIG = {
    // 开发环境配置获取AppID
    getAppId: function() {
        // 1. 优先从URL参数获取（开发测试用）
        const urlParams = new URLSearchParams(window.location.search);
        const appIdFromUrl = urlParams.get('appId');
        
        if (appIdFromUrl) {
            console.log('使用URL参数AppID:', appIdFromUrl.substring(0, 8) + '***');
            return appIdFromUrl;
        }
        
        // 2. 从localStorage获取（用户保存的配置）
        const savedAppId = localStorage.getItem('ali_rtc_app_id');
        if (savedAppId) {
            console.log('使用本地保存的AppID:', savedAppId.substring(0, 8) + '***');
            return savedAppId;
        }
        
        // 3. 提示用户输入AppID
        this.promptForAppId();
        return '';
    },
    
    // 提示用户输入AppID
    promptForAppId: function() {
        const appId = prompt('请输入您的阿里云RTC AppID\n\n获取方式：\n1. 登录阿里云控制台\n2. 进入实时音视频通信RTC产品页\n3. 在应用管理中查看AppID');
        
        if (appId && appId.trim()) {
            // 保存到localStorage供下次使用
            localStorage.setItem('ali_rtc_app_id', appId.trim());
            console.log('AppID已保存，请刷新页面');
            // 刷新页面以重新初始化
            window.location.reload();
        } else {
            console.error('AppID为空，无法初始化RTC');
            this.showConfigError();
        }
    },
    
    // 显示配置错误信息
    showConfigError: function() {
        document.body.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                background: #1a1a2e; 
                color: white; 
                font-family: Arial, sans-serif;
                flex-direction: column;
                text-align: center;
                padding: 20px;
            ">
                <h2 style="color: #ff6b6b; margin-bottom: 20px;">⚠️ 配置错误</h2>
                <p style="margin-bottom: 15px;">未找到有效的阿里云RTC AppID</p>
                <p style="margin-bottom: 20px; color: #ccc;">请通过以下方式之一提供AppID：</p>
                <ul style="text-align: left; color: #ccc; line-height: 1.6;">
                    <li>在URL中添加参数：?appId=您的AppID</li>
                    <li>点击下方按钮手动输入AppID</li>
                </ul>
                <button onclick="window.ALIYUN_CONFIG.promptForAppId()" style="
                    background: #4CAF50; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 16px;
                    margin-top: 20px;
                ">
                    输入AppID
                </button>
                <button onclick="window.ALIYUN_CONFIG.clearConfig()" style="
                    background: #666; 
                    color: white; 
                    border: none; 
                    padding: 8px 16px; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    font-size: 14px;
                    margin-top: 10px;
                ">
                    清除已保存配置
                </button>
            </div>
        `;
    },
    
    // 清除保存的配置
    clearConfig: function() {
        localStorage.removeItem('ali_rtc_app_id');
        alert('配置已清除');
        window.location.reload();
    },
    
    // 调试信息
    getDebugInfo: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const savedAppId = localStorage.getItem('ali_rtc_app_id');
        const urlAppId = urlParams.get('appId');
        
        return {
            url_appId: urlAppId ? urlAppId.substring(0, 8) + '***' : 'null',
            saved_appId: savedAppId ? savedAppId.substring(0, 8) + '***' : 'null',
            hostname: window.location.hostname,
            userAgent: navigator.userAgent,
            timestamp: new Date().toISOString()
        };
    }
};

// 检查阿里云RTC SDK是否加载
function checkRTCSDK() {
    if (typeof AliRTCSdk === 'undefined') {
        console.error('阿里云RTC SDK未加载，可能是网络问题');
        document.body.innerHTML = `
            <div style="
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                background: #1a1a2e; 
                color: white; 
                font-family: Arial, sans-serif;
                flex-direction: column;
                text-align: center;
                padding: 20px;
            ">
                <h2 style="color: #ff6b6b; margin-bottom: 20px;">🌐 网络连接错误</h2>
                <p style="margin-bottom: 15px;">阿里云RTC SDK加载失败</p>
                <p style="margin-bottom: 20px; color: #ccc;">可能的原因：</p>
                <ul style="text-align: left; color: #ccc; line-height: 1.6;">
                    <li>网络连接问题</li>
                    <li>CDN服务不可用</li>
                    <li>防火墙或代理阻止访问</li>
                </ul>
                <button onclick="window.location.reload()" style="
                    background: #4CAF50; 
                    color: white; 
                    border: none; 
                    padding: 12px 24px; 
                    border-radius: 8px; 
                    cursor: pointer; 
                    font-size: 16px;
                    margin-top: 20px;
                ">
                    重新加载
                </button>
            </div>
        `;
    }
}

// 页面加载后检查SDK
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkRTCSDK, 2000); // 给SDK 2秒加载时间
});