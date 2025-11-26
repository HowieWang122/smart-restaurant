import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [adminMode, setAdminMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 在管理员模式下不处理普通表单提交
    if (adminMode) {
      return;
    }
    
    setLoading(true);
    setMessage('');

    if (!username.trim() || !password.trim()) {
      setMessage('请填写完整信息');
      setLoading(false);
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setMessage('两次输入的密码不一致');
      setLoading(false);
      return;
    }

    if (!isLogin && password.length < 6) {
      setMessage('密码长度至少6位');
      setLoading(false);
      return;
    }

    try {
      const result = isLogin 
        ? await login(username, password)
        : await register(username, password);
      
      if (!result.success) {
        setMessage(result.message);
      }
    } catch (error) {
      setMessage('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setPassword('');
    setConfirmPassword('');
  };
  
  // 管理员登录处理
  const handleAdminLogin = async () => {
    setLoading(true);
    setMessage('');
    
    if (!password) {
      setMessage('请输入密码');
      setLoading(false);
      return;
    }
    
    try {
      // 密码是kristy，用户名是admin
      if (password === 'kristy') {
        // 直接使用硬编码的管理员凭据 (admin/kristy)
        console.log('尝试管理员登录: admin/' + password);
        const result = await login('admin', 'kristy');
        console.log('登录结果:', result);
        
        if (!result.success) {
          setMessage(result.message || '登录失败，请联系系统管理员');
        }
      } else {
        setMessage('密码不正确');
      }
    } catch (error: any) {
      console.error('管理员登录错误:', error);
      setMessage('登录失败，请稍后重试 (错误: ' + (error.message || '未知错误') + ')');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-50 to-purple-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🍽️</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Kristy专属大饭店</h1>
          <p className="text-gray-600">
            {isLogin ? '欢迎回来，开始您的美食之旅' : '注册账户，享受专属美食体验'}
          </p>
        </div>

        {/* Regular Form (hidden in admin mode) */}
        {!adminMode && (
          <>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  用户名
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  placeholder="请输入用户名"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                  placeholder="请输入密码"
                  disabled={loading}
                />
              </div>

              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors duration-200"
                    placeholder="请再次输入密码"
                    disabled={loading}
                  />
                </div>
              )}

              {message && (
                <div className={`p-3 rounded-lg text-sm ${
                  message.includes('成功') 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    {isLogin ? '登录中...' : '注册中...'}
                  </div>
                ) : (
                  isLogin ? '立即登录' : '立即注册'
                )}
              </button>
            </form>

            {/* Toggle Mode */}
            <div className="mt-6 text-center">
              <span className="text-gray-600">
                {isLogin ? '还没有账户？' : '已有账户？'}
              </span>
              <button
                onClick={toggleMode}
                className="ml-2 text-orange-600 hover:text-orange-700 font-medium transition-colors duration-200"
                disabled={loading}
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
            </div>
          </>
        )}

        {/* Admin Hint */}
        {isLogin && !adminMode && (
          <div 
            className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg cursor-pointer hover:bg-purple-100 transition-colors duration-200"
            onClick={() => setAdminMode(true)}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">👑</div>
              <p className="text-sm text-purple-700">
                <strong>管理员入口</strong>
              </p>
              <p className="text-xs text-purple-600 mt-1">
                点击进入管理员登录
              </p>
            </div>
          </div>
        )}
        
        {/* Admin Login Mode */}
        {adminMode && (
          <div className="mt-6 space-y-6">
            <div className="text-center">
              <div className="text-2xl mb-2">👑</div>
              <h3 className="text-xl font-bold text-purple-700">管理员登录</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                管理员密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                placeholder="请输入管理员密码"
                disabled={loading}
              />
            </div>
            
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('成功') 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}
            
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setAdminMode(false);
                  setPassword('');
                  setMessage('');
                }}
                className="w-1/2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-all duration-200"
                disabled={loading}
              >
                返回
              </button>
              
              <button
                type="button"
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    登录中...
                  </div>
                ) : '登录'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginForm; 