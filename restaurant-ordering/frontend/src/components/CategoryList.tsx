import React from 'react';
import { Category } from '../types';

interface CategoryListProps {
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-64 bg-gray-50 p-4 h-screen overflow-y-auto">
      <h2 className="text-xl font-bold mb-4 text-gray-800">菜品分类</h2>
      <div className="space-y-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 flex items-center space-x-3 ${
              selectedCategory === category.id
                ? 'bg-orange-500 text-white shadow-lg transform scale-105'
                : 'bg-white hover:bg-orange-100 text-gray-700 hover:shadow-md'
            }`}
          >
            <span className="text-2xl">{category.icon}</span>
            <span className="font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryList; 