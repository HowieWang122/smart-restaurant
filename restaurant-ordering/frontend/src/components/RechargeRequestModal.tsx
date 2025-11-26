import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';

interface RechargeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHeartValue: number;
  onSuccess: () => void;
}

const RechargeRequestModal: React.FC<RechargeRequestModalProps> = ({ 
  isOpen, 
  onClose, 
  currentHeartValue, 
  onSuccess
}) => {
  const { submitRechargeRequest } = useCart();
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rechargeAmount = parseInt(amount);
    
    if (!rechargeAmount || rechargeAmount <= 0) {
      alert('请输入有效的充值金额');
      return;
    }

    setLoading(true);
    
    try {
      const success = await submitRechargeRequest(rechargeAmount);
      
      if (success) {
        alert(`充值申请已提交成功！\n申请金额：💓${rechargeAmount}\n请等待管理员审核`);
        setAmount('');
        onSuccess();
      } else {
        alert('提交申请失败，请重试');
      }
    } catch (error) {
      alert('提交申请失败，请检查网络连接');
      console.error('Recharge request error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 只允许输入数字
    if (/^\d*$/.test(value)) {
      setAmount(value);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-4 text-pink-600">申请充值心动值</h2>
          <p className="text-gray-600 mb-6">当前心动值：💓{currentHeartValue}</p>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  充值金额 * (仅限数字)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={amount}
                    onChange={handleAmountChange}
                    placeholder="请输入充值金额"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-pink-500"
                    required
                  />
                  <span className="absolute right-3 top-2 text-pink-500 font-semibold">💓</span>
                </div>
                {amount && (
                  <p className="text-sm text-gray-500 mt-1">
                    充值后将拥有：💓{currentHeartValue + parseInt(amount || '0')}
                  </p>
                )}
              </div>


            </div>

            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <span className="font-semibold">注意：</span>
                充值申请提交后需要管理员审核，审核通过后心动值才会到账。请耐心等待。
              </p>
            </div>

            <div className="flex space-x-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                {loading ? '提交中...' : '提交申请'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default RechargeRequestModal; 