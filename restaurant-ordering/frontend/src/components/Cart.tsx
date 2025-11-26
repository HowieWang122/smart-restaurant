import React, { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import CheckoutModal from './CheckoutModal';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRecharge: () => void;
}

const Cart: React.FC<CartProps> = ({ isOpen, onClose, onOpenRecharge }) => {
  const { cartItems, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 h-screen w-96 bg-white shadow-xl z-50 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">购物车</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              购物车是空的
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">{item.name}</h4>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      删除
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-orange-500 font-bold">💗{item.price}</div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full"
                      >
                        -
                      </button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="border-t p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold">总计</span>
              <span className="text-xl font-bold text-orange-500">
                💗{getTotalPrice()}
              </span>
            </div>
            <button
              onClick={() => setShowCheckout(true)}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
            >
              去结算
            </button>
          </div>
        )}
      </div>

      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onSuccess={() => {
          setShowCheckout(false);
          onClose();
          clearCart();
        }}
        onOpenRecharge={() => {
          setShowCheckout(false);
          onClose();
          onOpenRecharge();
        }}
      />
    </>
  );
};

export default Cart; 