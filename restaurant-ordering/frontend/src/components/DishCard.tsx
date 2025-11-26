import React from 'react';
import { Dish } from '../types';
import { useCart } from '../contexts/CartContext';

interface DishCardProps {
  dish: Dish;
  discountInfo?: {
    discountedPrice: number;
    originalPrice: number;
    discountRate: number;
    savedAmount: number;
  };
}

const DishCard: React.FC<DishCardProps> = ({ dish, discountInfo }) => {
  const { addToCart } = useCart();
  
  const finalPrice = discountInfo ? discountInfo.discountedPrice : dish.price;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        <img
          src={dish.image}
          alt={dish.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/300x200?text=' + encodeURIComponent(dish.name);
          }}
        />
        {discountInfo ? (
          <div className="absolute top-2 right-2 space-y-1">
            <div className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
              {discountInfo.discountRate}% OFF
            </div>
            <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              💗{discountInfo.discountedPrice}
            </div>
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold">
            💗{dish.price}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{dish.name}</h3>
        <p className="text-gray-600 text-sm mb-3">{dish.description}</p>
        
        {discountInfo && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-red-600 font-medium">特价优惠</span>
              <span className="text-green-600 font-bold">省💗{discountInfo.savedAmount}</span>
            </div>
            <div className="flex items-center mt-1">
              <span className="text-red-600 font-bold">💗{discountInfo.discountedPrice}</span>
              <span className="text-gray-400 line-through text-sm ml-2">💗{discountInfo.originalPrice}</span>
            </div>
          </div>
        )}
        
        <button
          onClick={() => addToCart({ ...dish, price: finalPrice })}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 transform hover:scale-105"
        >
          加入购物车
        </button>
      </div>
    </div>
  );
};

export default DishCard; 