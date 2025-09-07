// 媒体配置管理器
window.ALIYUN_CONFIG = {
    // 环境检测
    isDevelopment: () => {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    },
    
    // 获取应用标识
    getAppId: async function(encodedAppId = null) {
        try {
            // 优先使用编码参数
            if (encodedAppId) {
                try {
                    const decodedAppId = this.decodeAppIdFromVersion(encodedAppId);
                    if (decodedAppId) {
                        console.log('使用编码标识');
                        return decodedAppId;
                    }
                } catch (e) {
                    console.warn('解码失败:', e);
                }
            }
            
            // 开发环境参数获取
            if (this.isDevelopment()) {
                const urlAppId = this.getAppIdFromUrl();
                if (urlAppId) {
                    console.log('开发环境：使用URL参数');
                    return urlAppId;
                }
            }
            
            // 本地缓存获取
            const savedAppId = this.getAppIdFromStorage();
            if (savedAppId) {
                console.log('使用本地缓存');
                return savedAppId;
            }
            
            // 用户输入
            return await this.promptForAppId();
            
        } catch (error) {
            console.error('获取标识失败:', error);
            return await this.promptForAppId();
        }
    },
    
    // 获取访问凭证
    getToken: function() {
        try {
            // URL参数获取
            const urlParams = new URLSearchParams(window.location.search);
            const urlToken = urlParams.get('token');
            if (urlToken) {
                console.log('使用URL凭证');
                return urlToken;
            }
            
            // 本地存储获取
            const savedToken = localStorage.getItem('media_access_key');
            if (savedToken) {
                console.log('使用缓存凭证');
                return savedToken;
            }
            
            console.log('无访问凭证');
            return null;
        } catch (error) {
            console.warn('凭证获取失败:', error);
            return null;
        }
    },
    
    // 保存访问凭证
    saveTokenToStorage: function(token) {
        try {
            localStorage.setItem('media_access_key', token);
            return true;
        } catch (error) {
            console.warn('无法保存凭证:', error);
            return false;
        }
    },
    
    // 版本参数解析
    decodeAppIdFromVersion: function(version) {
        try {
            console.log('尝试解析版本:', version);
            // 解析格式: major.minor.data
            const parts = version.split('.');
            if (parts.length !== 3) {
                console.warn('版本格式错误，跳过解析');
                return null;
            }
            
            const encodedData = parts[2];
            if (!encodedData || encodedData.length < 8) {
                console.warn('数据段太短，跳过解析');
                return null;
            }
            
            // 恢复数据格式
            let dataString = encodedData;
            while (dataString.length % 4 !== 0) {
                dataString += '=';
            }
            
            // 解析数据
            const decodedData = atob(dataString);
            if (decodedData && decodedData.length >= 8) {
                console.log('成功解析数据:', decodedData);
                return decodedData;
            }
            
            console.warn('解析后的数据无效');
            return null;
            
        } catch (error) {
            console.warn('数据解析失败:', error.message);
            return null;
        }
    },
    
    // URL参数获取
    getAppIdFromUrl: function() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('appId');
    },
    
    // 本地存储获取
    getAppIdFromStorage: function() {
        try {
            return localStorage.getItem('media_app_id');
        } catch (error) {
            console.warn('无法访问本地存储:', error);
            return null;
        }
    },
    
    // 本地存储保存
    saveAppIdToStorage: function(appId) {
        try {
            localStorage.setItem('media_app_id', appId);
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
                        <small>可在阿里云控制台 > 音视频通信RTC > 应用管理中获取</small><br>
                        <small style="color: #f39c12;">请在Flutter应用的设置对话框中配置AppID</small><br>
                <small style="color: #ff6b6b;">注意：Web端需要有效的Token进行身份验证，测试环境会自动生成临时Token</small>
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
            localStorage.removeItem('media_app_id');
            localStorage.removeItem('media_access_key');
            console.log('配置已清除');
            return true;
        } catch (error) {
            console.error('清除配置失败:', error);
            return false;
        }
    }
};