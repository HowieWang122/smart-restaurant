import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

interface UserMenuProps {
  username: string;
  theme?: 'orange' | 'purple';
}

interface PasswordChangeData {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const UserMenu: React.FC<UserMenuProps> = ({ username, theme = 'orange' }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { logout, user } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('新密码和确认密码不一致');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('新密码至少需要6位');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put('/api/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        alert('密码修改成功！请重新登录');
        logout();
      }
    } catch (error: any) {
      setError(error.response?.data?.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    // 检查是否为管理员账号
    if (user?.isAdmin) {
      alert('⚠️ 无法删除管理员账号\n\n管理员账号受系统保护，无法被删除。');
      return;
    }

    const confirmation = window.confirm(
      '⚠️ 警告！\n\n删除账号将会：\n• 永久删除您的账号\n• 删除所有订单记录\n• 删除所有充值记录\n• 删除所有心动值流水\n• 此操作不可撤销！\n\n确定要删除账号吗？'
    );

    if (!confirmation) return;

    const secondConfirmation = window.confirm(
      '最后确认：真的要永久删除账号吗？\n\n此操作无法撤销！'
    );

    if (!secondConfirmation) return;

    try {
      const response = await axios.delete('/api/auth/delete-account');
      
      if (response.data.success) {
        alert('账号已永久删除');
        logout();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || '删除账号失败');
    }
  };

  const resetPasswordForm = () => {
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setError('');
  };

  // 根据主题获取样式
  const getThemeStyles = () => {
    if (theme === 'purple') {
      return {
        button: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
        submitBtn: 'bg-purple-500 hover:bg-purple-600',
        focusBorder: 'focus:border-purple-500'
      };
    }
    return {
      button: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      submitBtn: 'bg-orange-500 hover:bg-orange-600',
      focusBorder: 'focus:border-orange-500'
    };
  };

  const themeStyles = getThemeStyles();

  return (
    <>
      <div className="relative ml-3" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`${themeStyles.button} text-xs font-semibold px-3 py-2 rounded-full transition-colors duration-200 flex items-center gap-1`}
        >
          {username}
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
            <button
              onClick={() => {
                setShowPasswordModal(true);
                setIsDropdownOpen(false);
                resetPasswordForm();
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              更改密码
            </button>
            
            <button
              onClick={() => {
                logout();
                setIsDropdownOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              退出登录
            </button>

            <hr className="my-1" />
            
            <button
              onClick={() => {
                handleDeleteAccount();
                setIsDropdownOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${
                user?.isAdmin 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-red-600 hover:bg-red-50'
              }`}
              disabled={user?.isAdmin}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除账号{user?.isAdmin && ' (不可删除)'}
            </button>
          </div>
        )}
      </div>

      {/* 密码修改模态框 */}
      {showPasswordModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowPasswordModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
              <h2 className="text-xl font-bold mb-4 text-gray-800">更改密码</h2>
              
              <form onSubmit={handlePasswordChange}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      当前密码 *
                    </label>
                    <input
                      type="password"
                      value={passwordData.oldPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${themeStyles.focusBorder}`}
                      placeholder="请输入当前密码"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      新密码 *
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${themeStyles.focusBorder}`}
                      placeholder="请输入新密码（至少6位）"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      确认新密码 *
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none ${themeStyles.focusBorder}`}
                      placeholder="请再次输入新密码"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex space-x-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                    disabled={loading}
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 ${themeStyles.submitBtn} text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200`}
                    disabled={loading}
                  >
                    {loading ? '修改中...' : '确认修改'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default UserMenu; 