import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import CategoryList from './components/CategoryList';
import DishCard from './components/DishCard';
import Cart from './components/Cart';
import RechargeRequestModal from './components/RechargeRequestModal';
import HeartTransactions from './components/HeartTransactions';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import UserMenu from './components/UserMenu';
import { Category, Dish } from './types';
import { useCart } from './contexts/CartContext';

const AppContent: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showCart, setShowCart] = useState(false);
  const [showRecharge, setShowRecharge] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [dailyDiscounts, setDailyDiscounts] = useState<any>(null);
  const [isPersonalizedDiscounts, setIsPersonalizedDiscounts] = useState(false);
  const [isRefreshingDiscounts, setIsRefreshingDiscounts] = useState(false);
  const { user, isLoading } = useAuth();
  const { getTotalItems, heartValue, fetchHeartValue } = useCart();

  useEffect(() => {
    fetchMenu();
  }, [user]);

  const fetchMenu = async () => {
    try {
      const response = await axios.get('/api/menu');
      const { categories, dishes, dailyDiscounts, isPersonalized } = response.data;
      setCategories(categories);
      setDishes(dishes);
      setDailyDiscounts(dailyDiscounts);
      setIsPersonalizedDiscounts(isPersonalized || false);
      if (categories.length > 0) {
        setSelectedCategory(categories[0].id);
      }
    } catch (error) {
      console.error('Error fetching menu:', error);
    }
  };

  const refreshDiscounts = async () => {
    if (isRefreshingDiscounts) return;
    
    setIsRefreshingDiscounts(true);
    try {
      const response = await axios.post('/api/refresh-discounts');
      const { discountData, message } = response.data;
      
      setDailyDiscounts(discountData);
      setIsPersonalizedDiscounts(true); // Manually refreshed discounts are always personalised
      fetchHeartValue(); // Refresh heart value display
      
      alert(message);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to refresh personalised discounts, please try again later';
      alert(errorMessage);
    } finally {
      setIsRefreshingDiscounts(false);
    }
  };

  const filteredDishes = dishes.filter(dish => dish.categoryId === selectedCategory);

  // Get discount information for dishes
  const getDishDiscountInfo = (dishId: number) => {
    if (!dailyDiscounts || !dailyDiscounts.discountedItems) return undefined;
    return dailyDiscounts.discountedItems.find((item: any) => item.id === dishId);
  };

  // Show loading animation if authentication is loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
          <p className="text-gray-600">Loading, please wait...</p>
        </div>
      </div>
    );
  }

  // Show login form if not logged in
  if (!user) {
    return <LoginForm />;
  }

  // Show admin interface if admin account
  if (user.isAdmin) {
    return <AdminDashboard />;
  }

  // Regular user shows ordering interface
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-30">
        <div className="flex justify-between items-center px-6 py-4">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-orange-600">Kristy's Exclusive Restaurant</h1>
            <UserMenu username={user.username} />
          </div>
          <div className="flex items-center space-x-4">
            {/* Heart value display */}
            <div className="flex items-center bg-pink-100 px-4 py-2 rounded-lg">
              <span className="text-pink-600 font-semibold mr-2">Heart Value</span>
              <span className="text-xl font-bold text-pink-600">💓{heartValue}</span>
              <div className="ml-2 flex space-x-2">
                <button
                  onClick={() => setShowTransactions(true)}
                  className="bg-pink-400 hover:bg-pink-500 text-white px-2 py-1 rounded text-sm transition-colors duration-200"
                >
                  History
                </button>
                <button
                  onClick={() => setShowRecharge(true)}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-2 py-1 rounded text-sm transition-colors duration-200"
                >
                  Recharge
                </button>
              </div>
            </div>
            
            {/* Personalised discount indicator and refresh button */}
            <div className="flex items-center space-x-2">
              {isPersonalizedDiscounts && dailyDiscounts?.discountedItems?.length > 0 && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center">
                  <span className="mr-1">✨</span>
                  Personalised Discounts
                </div>
              )}
              <button
                onClick={refreshDiscounts}
                disabled={isRefreshingDiscounts || heartValue < 100}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isRefreshingDiscounts || heartValue < 100
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105'
                }`}
              >
                {isRefreshingDiscounts ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Refreshing...
                  </span>
                ) : (
                  `🎲 Refresh Personalised Discounts (💓100)`
                )}
              </button>
            </div>
            
            {/* Shopping cart button */}
            <button
              onClick={() => setShowCart(true)}
              className="relative bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Cart
                {getTotalItems() > 0 && (
                  <span className="ml-2 bg-white text-orange-500 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {getTotalItems()}
                  </span>
                )}
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Category Sidebar */}
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              {categories.find(c => c.id === selectedCategory)?.name || 'Dish List'}
            </h2>
            <div className="flex items-center justify-between mt-1">
              <p className="text-gray-600">Total {filteredDishes.length} dishes</p>
              {isPersonalizedDiscounts && dailyDiscounts?.discountedItems?.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-700">
                  <span className="font-semibold">🎯 Exclusive Benefits:</span>
                  You have {dailyDiscounts.discountedItems.length} personalised discounts, updated daily
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDishes.map((dish) => {
              const discountInfo = getDishDiscountInfo(dish.id);
              return (
                <DishCard 
                  key={dish.id} 
                  dish={dish} 
                  discountInfo={discountInfo}
                />
              );
            })}
          </div>
        </main>
      </div>

      {/* Cart Sidebar */}
      <Cart 
        isOpen={showCart} 
        onClose={() => setShowCart(false)} 
        onOpenRecharge={() => {
          // Close cart, open header recharge request
          setShowCart(false);
          setShowRecharge(true);
        }}
      />
      
      {/* Recharge request modal */}
      <RechargeRequestModal 
        isOpen={showRecharge} 
        onClose={() => setShowRecharge(false)} 
        currentHeartValue={heartValue}
        onSuccess={() => {
          setShowRecharge(false);
          fetchHeartValue(); // Refresh heart value display
        }}
      />
      
      {/* Heart value transaction history modal */}
      <HeartTransactions 
        isOpen={showTransactions} 
        onClose={() => setShowTransactions(false)} 
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppContent />
      </CartProvider>
    </AuthProvider>
  );
}

export default App; 