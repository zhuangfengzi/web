// 阿里云RTC Web端配置管理
window.ALIYUN_CONFIG = {
    // 环境检测
    isDevelopment: () => {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    },
    
    // 获取AppID的方法
    getAppId: async function(encodedAppId = null) {
        try {
            // 0. 优先使用从URL解码的AppID
            if (encodedAppId) {
                try {
                    const decodedAppId = this.decodeAppIdFromVersion(encodedAppId);
                    if (decodedAppId) {
                        console.log('使用URL中的隐晦AppID');
                        return decodedAppId;
                    }
                } catch (e) {
                    console.warn('解码隐晦AppID失败:', e);
                }
            }
            
            // 1. 开发环境：从URL参数获取
            if (this.isDevelopment()) {
                const urlAppId = this.getAppIdFromUrl();
                if (urlAppId) {
                    console.log('开发环境：使用URL参数AppID');
                    return urlAppId;
                }
            }
            
            // 2. 从本地存储获取
            const savedAppId = this.getAppIdFromStorage();
            if (savedAppId) {
                console.log('使用本地保存的AppID');
                return savedAppId;
            }
            
            // 3. 用户手动输入
            return await this.promptForAppId();
            
        } catch (error) {
            console.error('获取AppID失败:', error);
            return await this.promptForAppId();
        }
    },
    
    // 从版本号格式解码AppID（这是一个简单的模拟实现）
    decodeAppIdFromVersion: function(version) {
        // 这里需要和Flutter端的_encodeAppId方法对应
        // 但是由于Flutter端的编码是基于时间戳的，在Web端无法反向解码
        // 所以这里返回null，让其使用其他方式获取AppID
        console.log('隐晦AppID解码暂未实现，使用其他方式获取AppID');
        return null;
    },
    
    // 从URL参数获取AppID
    getAppIdFromUrl: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('appId');
    },
    
    // 从本地存储获取AppID
    getAppIdFromStorage: function() {
        try {
            return localStorage.getItem('ali_rtc_app_id');
        } catch (error) {
            console.warn('无法访问本地存储:', error);
            return null;
        }
    },
    
    // 保存AppID到本地存储
    saveAppIdToStorage: function(appId) {
        try {
            localStorage.setItem('ali_rtc_app_id', appId);
            return true;
        } catch (error) {
            console.warn('无法保存到本地存储:', error);
            return false;
        }
    },
    
    // 用户手动输入AppID
    promptForAppId: async function() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed; top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(0,0,0,0.8); display: flex; align-items: center;
                justify-content: center; z-index: 9999;
                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            `;
            
            overlay.innerHTML = `
                <div style="
                    background: #16213E; padding: 30px; border-radius: 15px;
                    max-width: 400px; width: 90%; text-align: center; color: white;
                ">
                    <h2 style="margin-bottom: 20px; color: #4CAF50;">🔑 阿里云RTC AppID</h2>
                    <p style="margin-bottom: 20px; line-height: 1.6; opacity: 0.9;">
                        请输入您的阿里云RTC AppID<br>
                        <small>可在阿里云控制台 > 音视频通信RTC > 应用管理中获取</small>
                    </p>
                    <input type="text" id="appIdInput" placeholder="请输入AppID" style="
                        width: 100%; padding: 12px; border: 1px solid #333;
                        border-radius: 8px; background: rgba(255,255,255,0.1);
                        color: white; font-size: 16px; margin-bottom: 20px; outline: none;
                    ">
                    <div style="display: flex; gap: 10px;">
                        <button id="cancelBtn" style="
                            flex: 1; padding: 12px; border: 1px solid #666;
                            border-radius: 8px; background: transparent;
                            color: white; cursor: pointer;
                        ">取消</button>
                        <button id="confirmBtn" style="
                            flex: 1; padding: 12px; border: none; border-radius: 8px;
                            background: #4CAF50; color: white; cursor: pointer; font-weight: bold;
                        ">确认</button>
                    </div>
                    <p style="margin-top: 15px; font-size: 12px; opacity: 0.7;">
                        AppID将保存在本地，下次访问时自动使用
                    </p>
                </div>
            `;
            
            document.body.appendChild(overlay);
            
            const input = document.getElementById('appIdInput');
            const confirmBtn = document.getElementById('confirmBtn');
            const cancelBtn = document.getElementById('cancelBtn');
            
            setTimeout(() => input.focus(), 100);
            
            const handleConfirm = () => {
                const appId = input.value.trim();
                if (appId) {
                    this.saveAppIdToStorage(appId);
                    document.body.removeChild(overlay);
                    resolve(appId);
                } else {
                    input.style.borderColor = '#e74c3c';
                    input.placeholder = 'AppID不能为空';
                }
            };
            
            const handleCancel = () => {
                document.body.removeChild(overlay);
                resolve('');
            };
            
            confirmBtn.onclick = handleConfirm;
            cancelBtn.onclick = handleCancel;
            input.onkeypress = (e) => e.key === 'Enter' && handleConfirm();
        });
    },
    
    // 清除保存的配置
    clearConfig: function() {
        try {
            localStorage.removeItem('ali_rtc_app_id');
            console.log('配置已清除');
            return true;
        } catch (error) {
            console.error('清除配置失败:', error);
            return false;
        }
    }
};