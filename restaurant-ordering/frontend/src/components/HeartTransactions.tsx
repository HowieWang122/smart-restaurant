import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
  id: number;
  oldValue: number;
  newValue: number;
  changeAmount: number;
  type: 'order' | 'recharge' | 'other';
  description: string;
  relatedId: number | null;
  createdAt: string;
}

interface RechargeRequest {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  processedAt: string | null;
  processedBy: string | null;
  actualAmount?: number;
  originalAmount?: number;
}

interface HeartTransactionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const HeartTransactions: React.FC<HeartTransactionsProps> = ({ isOpen, onClose }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [rechargeRequests, setRechargeRequests] = useState<RechargeRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadAllRecords();
    }
  }, [isOpen]);

  const loadAllRecords = async () => {
    setLoading(true);
    try {
      // 同时获取心动值流水和充值申请记录
      const [transactionsResponse, rechargeResponse] = await Promise.all([
        axios.get('/api/heart-transactions'),
        axios.get('/api/recharge-requests')
      ]);
      
      setTransactions(transactionsResponse.data);
      setRechargeRequests(rechargeResponse.data);
    } catch (error) {
      console.error('加载记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string, isRejected?: boolean) => {
    switch (type) {
      case 'order':
        return 'Order Payment';
      case 'recharge':
        return isRejected ? 'Recharge Rejected' : 'Recharge Received';
      default:
        return 'Other';
    }
  };

  const getTypeIcon = (type: string, isRejected?: boolean) => {
    switch (type) {
      case 'order':
        return '🛒';
      case 'recharge':
        return isRejected ? '❌' : '💰';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString('zh-CN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 合并所有记录并按时间排序
  const getAllRecords = () => {
    const allRecords: any[] = [];
    
    // 添加心动值变动记录
    transactions.forEach(transaction => {
      allRecords.push({
        ...transaction,
        recordType: 'transaction'
      });
    });
    
    // 添加被拒绝的充值申请记录
    rechargeRequests
      .filter(request => request.status === 'rejected')
      .forEach(request => {
        allRecords.push({
          id: `reject-${request.id}`,
          type: 'recharge',
          description: `Recharge application rejected - Application ID#${request.id}`,
          changeAmount: 0,
          amount: request.amount,
          createdAt: request.processedAt || request.createdAt,
          recordType: 'rejected',
          originalRequest: request
        });
      });
    
    // 按时间倒序排列
    return allRecords.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  if (!isOpen) return null;

  const allRecords = getAllRecords();

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999]" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[65vh] sm:max-h-[70vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-pink-600">💓 Heart Value Transaction Records</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 mt-2">View your heart value change history and recharge application records</p>
          </div>
          
          <div className="p-6 overflow-y-auto max-h-[calc(65vh-160px)] sm:max-h-[calc(70vh-160px)]">
            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <p className="mt-2 text-gray-600">Loading...</p>
              </div>
            ) : allRecords.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💸</div>
                <p className="text-gray-600">No records yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allRecords.map((record) => {
                  const isRejected = record.recordType === 'rejected';
                  
                  return (
                    <div
                      key={record.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        isRejected
                          ? 'border-gray-500 bg-gray-50'
                          : record.changeAmount > 0
                          ? 'border-green-500 bg-green-50'
                          : 'border-red-500 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getTypeIcon(record.type, isRejected)}</span>
                          <div>
                            <div className="font-semibold text-gray-800">
                              {getTypeLabel(record.type, isRejected)}
                            </div>
                            <div className="text-sm text-gray-600">
                              {record.description}
                            </div>
                            {isRejected && (
                              <div className="text-xs text-gray-500 mt-1">
                                Application time: {formatDate(record.originalRequest.createdAt)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {isRejected ? (
                            <div className="text-lg font-bold text-gray-600">
                              💓{record.amount} (Rejected)
                            </div>
                          ) : (
                            <>
                              <div className={`text-lg font-bold ${
                                record.changeAmount > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {record.changeAmount > 0 ? '+' : ''}💓{record.changeAmount}
                              </div>
                              <div className="text-sm text-gray-500">
                                Balance: 💓{record.newValue}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 flex justify-between">
                        <span>
                          {isRejected ? `Application ID: #${record.originalRequest.id}` : `Transaction ID: #${record.id}`}
                        </span>
                        <span>{formatDate(record.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <span className="inline-flex items-center mr-4">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Income
                </span>
                <span className="inline-flex items-center mr-4">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Expense
                </span>
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-gray-500 rounded-full mr-2"></span>
                  Rejected
                </span>
              </div>
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeartTransactions; 