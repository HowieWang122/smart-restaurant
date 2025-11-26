import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserMenu from './UserMenu';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();

  const openAdminPanel = () => {
    // 在当前页面跳转到本地管理面板
    window.location.href = 'http://localhost:3001/admin/';
  };

  const openRemoteAdmin = () => {
    window.open('http://localhost:3001/admin/admin-remote.html', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center">
            <div className="text-2xl mr-3">👑</div>
            <h1 className="text-2xl font-bold text-purple-600">管理员控制台</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              欢迎，
            </div>
            <UserMenu username={user?.username || 'admin'} theme="purple" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">🏪 Kristy专属大饭店</h2>
          <p className="text-xl text-gray-600">管理员后台管理系统</p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* 本地管理面板 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4">🖥️</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">本地管理面板</h3>
              <p className="text-gray-600 mb-6">
                管理订单、充值申请、用户数据等核心业务功能
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  订单管理与处理
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  充值申请审核
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  用户心动值管理
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  数据统计与分析
                </li>
              </ul>
              <button
                onClick={openAdminPanel}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                进入本地管理面板
              </button>
            </div>
          </div>

          {/* 远程管理面板 */}
          <div className="bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">远程管理面板</h3>
              <p className="text-gray-600 mb-6">
                提供远程访问功能，支持外网管理和监控
              </p>
              <ul className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  远程订单监控
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  实时数据同步
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  移动端优化界面
                </li>
                <li className="flex items-center">
                  <span className="text-green-500 mr-2">✓</span>
                  外网访问支持
                </li>
              </ul>
              <button
                onClick={openRemoteAdmin}
                className="w-full bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                进入远程管理面板
              </button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-12 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">系统状态</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="text-lg font-semibold text-gray-800">实时监控</h4>
              <p className="text-sm text-gray-600">系统运行正常</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">🔒</div>
              <h4 className="text-lg font-semibold text-gray-800">安全状态</h4>
              <p className="text-sm text-gray-600">所有系统安全</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h4 className="text-lg font-semibold text-gray-800">性能状态</h4>
              <p className="text-sm text-gray-600">运行流畅</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard; 