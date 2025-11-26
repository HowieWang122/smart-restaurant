import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';
import { CustomerInfo } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onOpenRecharge: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, onSuccess, onOpenRecharge }) => {
  const { cartItems, getTotalPrice, heartValue, canAfford, fetchHeartValue } = useCart();
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    taste: '',
    expectedTime: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // 处理充值申请跳转
  const handleRechargeClick = () => {
    onClose(); // 关闭当前模态框
    onOpenRecharge(); // 打开header的充值申请模态框
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const totalPrice = getTotalPrice();
    
    // 心动值足够时才检查表单完整性
    if (!customerInfo.taste || !customerInfo.expectedTime) {
      alert('请填写口味和期望时间');
      return;
    }

    setLoading(true);
    
    try {
      const response = await axios.post('/api/orders', {
        items: cartItems,
        total: totalPrice,
        customerInfo,
      });

      if (response.data.success) {
        // 重新获取心动值（订单成功后后端会自动扣除）
        await fetchHeartValue();
        alert(`订单提交成功！订单号：${response.data.orderId}\n已扣除💓${totalPrice}心动值`);
        onSuccess();
      }
    } catch (error) {
      alert('订单提交失败，请重试');
      console.error('Order submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">确认订单</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  口味 *
                </label>
                <input
                  type="text"
                  value={customerInfo.taste}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, taste: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="如：微辣、不辣、重辣等"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  期望时间 *
                </label>
                <input
                  type="text"
                  value={customerInfo.expectedTime}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, expectedTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="如：12:30、尽快、晚上7点等"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  备注
                </label>
                <textarea
                  value={customerInfo.notes}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
                  placeholder="其他要求或说明"
                  rows={3}
                />
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              {/* 心动值余额显示 */}
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">当前心动值</span>
                <span className="text-lg font-semibold text-pink-600">
                  💓{heartValue}
                </span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">订单总计</span>
                <span className="text-xl font-bold text-orange-500">
                  💗{getTotalPrice()}
                </span>
              </div>
              
              {/* 心动值状态提示 */}
              {!canAfford(getTotalPrice()) && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p className="text-sm">
                    ❌ 心动值不足！还需要💓{getTotalPrice() - heartValue}
                  </p>
                </div>
              )}
              
              {canAfford(getTotalPrice()) && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                  <p className="text-sm">
                    ✅ 心动值充足！下单后剩余💓{heartValue - getTotalPrice()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                disabled={loading}
              >
                取消
              </button>
              {!canAfford(getTotalPrice()) ? (
                <button
                  type="button"
                  onClick={handleRechargeClick}
                  className="flex-1 bg-pink-500 hover:bg-pink-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
                  disabled={loading}
                >
                  申请充值💓
                </button>
              ) : (
                <button
                  type="submit"
                  className={`flex-1 font-bold py-2 px-4 rounded-lg transition-colors duration-200 ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 hover:bg-orange-600'
                  } text-white`}
                  disabled={loading}
                >
                  {loading ? '提交中...' : '确认下单'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default CheckoutModal; 