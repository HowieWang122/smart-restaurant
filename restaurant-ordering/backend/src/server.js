const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

// 导入认证路由
const authRoutes = require('./routes/auth');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 使用认证路由
app.use('/api/auth', authRoutes);

// 数据目录（允许通过环境变量覆盖，便于持久化）
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../data');
const resolveDataPath = (...segments) => path.join(DATA_DIR, ...segments);
fs.mkdirSync(DATA_DIR, { recursive: true });

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// 条形码用户查找API
app.get('/api/user/barcode/:barcodeData', (req, res) => {
  try {
    const { barcodeData } = req.params;
    
    // 读取用户数据
    const usersFilePath = resolveDataPath('users.json');
    let users = [];
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      users = JSON.parse(data);
    } catch (error) {
      console.error('读取用户数据失败:', error);
      return res.status(500).json({ message: '服务器错误' });
    }
    
    // 查找匹配条形码的用户
    // 这里假设条形码数据就是用户ID或用户名
    const user = users.find(u => 
      u.id === barcodeData || 
      u.username === barcodeData ||
      u.barcodeId === barcodeData  // 如果用户有专门的条形码ID
    );
    
    if (user) {
      // 返回用户信息（不含密码）
      const userWithoutPassword = { ...user };
      delete userWithoutPassword.password;
      
      res.json(userWithoutPassword);
    } else {
      res.status(404).json({ message: '未找到对应的用户' });
    }
  } catch (error) {
    console.error('条形码用户查找失败:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 静态文件服务（用于提供菜品图片）
app.use('/images', express.static(resolveDataPath('images')));

// 提供管理后台页面（仅暴露需要的文件）
const adminHtmlPath = path.join(__dirname, 'admin.html');
const adminRemoteHtmlPath = path.join(__dirname, 'admin-remote.html');

app.get(['/admin', '/admin/'], (req, res) => {
  res.sendFile(adminHtmlPath);
});

app.get('/admin/admin.html', (req, res) => {
  res.sendFile(adminHtmlPath);
});

app.get('/admin/admin-remote.html', (req, res) => {
  res.sendFile(adminRemoteHtmlPath);
});

// 初始化订单文件
const ordersFile = resolveDataPath('orders.json');
if (!fs.existsSync(ordersFile)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(ordersFile, JSON.stringify([]));
}

// 初始化充值申请文件
const rechargeRequestsFile = resolveDataPath('recharge-requests.json');
if (!fs.existsSync(rechargeRequestsFile)) {
  fs.writeFileSync(rechargeRequestsFile, JSON.stringify([]));
}

// 初始化心动值文件
const heartValueFile = resolveDataPath('heart-value.json');
if (!fs.existsSync(heartValueFile)) {
  fs.writeFileSync(heartValueFile, JSON.stringify({ value: 100 })); // 初始心动值为100
}

// 初始化心动值流水文件
const heartTransactionsFile = resolveDataPath('heart-transactions.json');
if (!fs.existsSync(heartTransactionsFile)) {
  fs.writeFileSync(heartTransactionsFile, JSON.stringify([]));
}

// 初始化每日折扣文件 - 新的用户专属折扣系统
const dailyDiscountsFile = resolveDataPath('daily-discounts.json');
if (!fs.existsSync(dailyDiscountsFile)) {
  // 初始化用户专属折扣数据结构
  const defaultDiscounts = {
    userDiscounts: {}, // 每个用户的专属折扣
    globalLastCheck: new Date().toDateString() // 全局检查日期
  };
  fs.writeFileSync(dailyDiscountsFile, JSON.stringify(defaultDiscounts, null, 2));
}

// 生成用户专属随机折扣商品
function generateUserDiscounts(userId) {
  const allDishes = [
    { id: 1, categoryId: 'pork', name: '红烧肉', price: 48 },
    { id: 2, categoryId: 'pork', name: '糖醋排骨', price: 58 },
    { id: 3, categoryId: 'pork', name: '回锅肉', price: 38 },
    { id: 4, categoryId: 'pork', name: '东坡肉', price: 68 },
    { id: 5, categoryId: 'chicken', name: '宫保鸡丁', price: 42 },
    { id: 6, categoryId: 'chicken', name: '辣子鸡', price: 48 },
    { id: 7, categoryId: 'chicken', name: '口水鸡', price: 38 },
    { id: 8, categoryId: 'chicken', name: '黄焖鸡', price: 45 },
    { id: 9, categoryId: 'beef', name: '水煮牛肉', price: 68 },
    { id: 10, categoryId: 'beef', name: '红烧牛腩', price: 78 },
    { id: 11, categoryId: 'beef', name: '黑椒牛柳', price: 88 },
    { id: 12, categoryId: 'beef', name: '番茄牛腩', price: 72 },
    { id: 13, categoryId: 'seafood', name: '清蒸鲈鱼', price: 98 },
    { id: 14, categoryId: 'seafood', name: '蒜蓉粉丝蒸扇贝', price: 68 },
    { id: 15, categoryId: 'seafood', name: '白灼虾', price: 88 },
    { id: 16, categoryId: 'seafood', name: '香辣蟹', price: 128 },
    { id: 17, categoryId: 'vegetable', name: '麻婆豆腐', price: 28 },
    { id: 18, categoryId: 'vegetable', name: '地三鲜', price: 32 },
    { id: 19, categoryId: 'vegetable', name: '蒜蓉西兰花', price: 26 },
    { id: 20, categoryId: 'vegetable', name: '干煸四季豆', price: 28 }
  ];
  
  // 使用用户ID作为随机种子，确保同一用户每天的折扣相同，但不同用户不同
  const userSeed = parseInt(userId.slice(-6)) || 1; // 取用户ID后6位作为种子
  const today = new Date().toDateString();
  const dateSeed = today.split(' ').join('').length; // 日期种子
  
  // 自定义随机数生成器（基于种子）
  let seed = userSeed + dateSeed;
  function seededRandom() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  
  // 随机选择3-5个商品进行折扣
  const discountCount = Math.floor(seededRandom() * 3) + 3; // 3-5个
  
  // 使用种子随机选择商品
  const shuffled = [...allDishes];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(seededRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const selectedDishes = shuffled.slice(0, discountCount);
  
  // 为每个商品设置随机折扣（6-8折）
  const discountedItems = selectedDishes.map(dish => {
    const discountRate = Math.floor(seededRandom() * 3) + 6; // 6-8折
    const discountedPrice = Math.floor(dish.price * discountRate / 10);
    const savedAmount = dish.price - discountedPrice;
    
    return {
      id: dish.id,
      name: dish.name,
      originalPrice: dish.price,
      discountedPrice: discountedPrice,
      discountRate: discountRate * 10, // 60%-80%
      savedAmount: savedAmount
    };
  });
  
  return discountedItems;
}

// 获取或生成用户的每日折扣
function getUserDailyDiscounts(userId) {
  let discountData = {};
  try {
    discountData = JSON.parse(fs.readFileSync(dailyDiscountsFile, 'utf8'));
  } catch (error) {
    discountData = {
      userDiscounts: {},
      globalLastCheck: new Date().toDateString()
    };
  }
  
  const today = new Date().toDateString();
  
  // 检查是否需要为该用户生成新的折扣
  if (!discountData.userDiscounts[userId] || 
      discountData.userDiscounts[userId].lastRefreshDate !== today) {
    
    // 为用户生成新的每日折扣
    discountData.userDiscounts[userId] = {
      discountedItems: generateUserDiscounts(userId),
      lastRefreshDate: today,
      refreshCount: discountData.userDiscounts[userId]?.refreshCount || 0
    };
    
    // 保存更新后的折扣数据
    fs.writeFileSync(dailyDiscountsFile, JSON.stringify(discountData, null, 2));
    
    console.log(`📅 为用户 ${userId} 生成每日专属折扣`);
  }
  
  return discountData.userDiscounts[userId];
}

// 获取菜单数据（支持用户专属折扣）
app.get('/api/menu', (req, res) => {
  // 尝试获取用户信息（如果提供了token）
  let userId = null;
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (token) {
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, 'your-secret-key');
      userId = decoded.id;
    } catch (error) {
      // 忽略token错误，继续返回无折扣的菜单
    }
  }

  // 获取用户专属折扣（如果用户已登录）
  let userDiscountData = null;
  if (userId) {
    userDiscountData = getUserDailyDiscounts(userId);
  }
  
  const menuData = {
    categories: [
      { id: 'pork', name: '猪肉类', icon: '🐷' },
      { id: 'chicken', name: '鸡肉类', icon: '🐔' },
      { id: 'beef', name: '牛肉类', icon: '🐄' },
      { id: 'seafood', name: '海鲜类', icon: '🦐' },
      { id: 'vegetable', name: '素食类', icon: '🥬' },
      { id: 'drink', name: '饮品类', icon: '🥤' }
    ],
    dishes: [
      // 猪肉类
      { id: 1, categoryId: 'pork', name: '红烧肉', price: 48, image: '/images/hongshaorou.jpg', description: '肥而不腻，入口即化' },
      { id: 2, categoryId: 'pork', name: '糖醋排骨', price: 58, image: '/images/tangcupaigu.jpg', description: '酸甜可口，老少皆宜' },
      { id: 3, categoryId: 'pork', name: '回锅肉', price: 38, image: '/images/huiguorou.jpg', description: '川味经典，香辣下饭' },
      { id: 4, categoryId: 'pork', name: '东坡肉', price: 68, image: '/images/dongporou.jpg', description: '肥而不腻，软糯香甜' },
      
      // 鸡肉类
      { id: 5, categoryId: 'chicken', name: '宫保鸡丁', price: 42, image: '/images/gongbaojiding.jpg', description: '麻辣鲜香，口感丰富' },
      { id: 6, categoryId: 'chicken', name: '辣子鸡', price: 48, image: '/images/laziji.jpg', description: '麻辣鲜香，外酥里嫩' },
      { id: 7, categoryId: 'chicken', name: '口水鸡', price: 38, image: '/images/koushuiji.jpg', description: '麻辣鲜香，开胃下饭' },
      { id: 8, categoryId: 'chicken', name: '黄焖鸡', price: 45, image: '/images/huangmenji.jpg', description: '鲜嫩多汁，营养丰富' },
      
      // 牛肉类
      { id: 9, categoryId: 'beef', name: '水煮牛肉', price: 68, image: '/images/shuizhuniurou.jpg', description: '麻辣鲜香，肉质鲜嫩' },
      { id: 10, categoryId: 'beef', name: '红烧牛腩', price: 78, image: '/images/hongshaoniunan.jpg', description: '软烂入味，汤汁浓郁' },
      { id: 11, categoryId: 'beef', name: '黑椒牛柳', price: 88, image: '/images/heijiaoliuliu.jpg', description: '嫩滑多汁，黑椒香浓' },
      { id: 12, categoryId: 'beef', name: '番茄牛腩', price: 72, image: '/images/fanqieniunan.jpg', description: '酸甜开胃，营养丰富' },
      
      // 海鲜类
      { id: 13, categoryId: 'seafood', name: '清蒸鲈鱼', price: 98, image: '/images/qingzhengluyu.jpg', description: '鲜嫩无比，原汁原味' },
      { id: 14, categoryId: 'seafood', name: '蒜蓉粉丝蒸扇贝', price: 68, image: '/images/shanbei.jpg', description: '蒜香扑鼻，鲜美可口' },
      { id: 15, categoryId: 'seafood', name: '白灼虾', price: 88, image: '/images/baizhuoxia.jpg', description: '鲜甜爽脆，原汁原味' },
      { id: 16, categoryId: 'seafood', name: '香辣蟹', price: 128, image: '/images/xianglaxie.jpg', description: '香辣诱人，肉质饱满' },
      
      // 素食类
      { id: 17, categoryId: 'vegetable', name: '麻婆豆腐', price: 28, image: '/images/mapodoufu.jpg', description: '麻辣鲜香，豆腐嫩滑' },
      { id: 18, categoryId: 'vegetable', name: '地三鲜', price: 32, image: '/images/disanxian.jpg', description: '东北名菜，营养丰富' },
      { id: 19, categoryId: 'vegetable', name: '蒜蓉西兰花', price: 26, image: '/images/xilanhua.jpg', description: '清爽健康，蒜香扑鼻' },
      { id: 20, categoryId: 'vegetable', name: '干煸四季豆', price: 28, image: '/images/sijidou.jpg', description: '香脆可口，下饭神器' },
      
      // 饮品类
      { id: 21, categoryId: 'drink', name: '鲜榨橙汁', price: 18, image: '/images/chengzhi.jpg', description: '新鲜现榨，维C满满' },
      { id: 22, categoryId: 'drink', name: '冰柠檬茶', price: 15, image: '/images/ningmengcha.jpg', description: '酸甜解渴，清新爽口' },
      { id: 23, categoryId: 'drink', name: '奶茶', price: 20, image: '/images/naicha.jpg', description: '丝滑香醇，甜度适中' },
      { id: 24, categoryId: 'drink', name: '可乐', price: 10, image: '/images/kele.jpg', description: '经典碳酸饮料' }
    ],
    // 返回用户专属折扣或空折扣数据
    dailyDiscounts: userDiscountData || { discountedItems: [] },
    // 添加用户信息（用于前端识别是否为专属折扣）
    isPersonalized: !!userId,
    userId: userId
  };
  
  if (userId && userDiscountData) {
    console.log(`🎯 用户 ${userId} 获取专属折扣菜单，共 ${userDiscountData.discountedItems.length} 项折扣`);
  }
  
  res.json(menuData);
});

// 刷新用户专属每日折扣
app.post('/api/refresh-discounts', authRoutes.verifyToken, (req, res) => {
  const { id: userId, username } = req.user;
  const REFRESH_COST = 100; // 刷新需要100心动值
  
  try {
    // 检查用户心动值是否足够
    const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
    const user = usersData.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    if (user.heartValue < REFRESH_COST) {
      return res.status(400).json({ 
        success: false, 
        message: `心动值不足！刷新折扣需要💓${REFRESH_COST}，当前只有💓${user.heartValue}` 
      });
    }
    
    // 生成新的用户专属折扣商品
    const newDiscountedItems = generateUserDiscounts(userId);
    
    // 读取当前折扣数据
    let discountData = {};
    try {
      discountData = JSON.parse(fs.readFileSync(dailyDiscountsFile, 'utf8'));
    } catch (error) {
      discountData = {
        userDiscounts: {},
        globalLastCheck: new Date().toDateString()
      };
    }
    
    // 确保用户数据存在
    if (!discountData.userDiscounts) {
      discountData.userDiscounts = {};
    }
    
    // 更新用户的折扣数据
    const today = new Date().toDateString();
    discountData.userDiscounts[userId] = {
      discountedItems: newDiscountedItems,
      lastRefreshDate: today,
      refreshCount: (discountData.userDiscounts[userId]?.refreshCount || 0) + 1,
      lastRefreshTime: new Date().toISOString(),
      lastRefreshBy: username
    };
    
    // 保存折扣数据
    fs.writeFileSync(dailyDiscountsFile, JSON.stringify(discountData, null, 2));
    
    // 扣除心动值并记录流水
    const newHeartValue = user.heartValue - REFRESH_COST;
    updateHeartValue(userId, newHeartValue, `刷新专属每日折扣 - 消费💓${REFRESH_COST}`, 'other', null);
    
    console.log(`🔄 用户 ${username} 刷新了专属每日折扣，消费💓${REFRESH_COST}`);
    
    res.json({ 
      success: true, 
      message: `专属折扣已刷新！消费💓${REFRESH_COST}`,
      discountData: discountData.userDiscounts[userId],
      newHeartValue: newHeartValue
    });
    
  } catch (error) {
    console.error('刷新专属折扣失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 提交订单
app.post('/api/orders', authRoutes.verifyToken, (req, res) => {
  const { items, total, customerInfo } = req.body;
  const { id: userId, username } = req.user;
  
  // 获取用户数据，检查心动值是否足够
  const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
  const user = usersData.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ success: false, message: '用户不存在' });
  }
  
  if (user.heartValue < total) {
    return res.status(400).json({ 
      success: false, 
      message: `心动值不足！需要💓${total}，当前只有💓${user.heartValue}` 
    });
  }
  
  const order = {
    id: Date.now(),
    userId,
    username,
    items,
    total,
    customerInfo,
    status: 'pending',
    createdAt: new Date().toISOString()
  };
  
  // 读取现有订单
  const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  orders.push(order);
  
  // 保存订单
  fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
  
  // 扣除心动值
  const newHeartValue = user.heartValue - total;
  updateHeartValue(userId, newHeartValue, `订单支付 - 订单号#${order.id}`, 'order', order.id);
  
  console.log('新订单收到:', order);
  
  res.json({ success: true, orderId: order.id });
});

// 获取所有订单（后台管理用）
app.get('/api/orders', (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  res.json(orders);
});

// 更新订单状态
app.put('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  
  if (orderIndex !== -1) {
    orders[orderIndex].status = status;
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    res.json({ success: true });
  } else {
    res.status(404).json({ success: false, message: '订单未找到' });
  }
});

// 删除订单（永久删除）
app.delete('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  
  const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  const orderIndex = orders.findIndex(o => o.id === parseInt(id));
  
  if (orderIndex !== -1) {
    const deletedOrder = orders[orderIndex];
    orders.splice(orderIndex, 1); // 从数组中永久删除订单
    fs.writeFileSync(ordersFile, JSON.stringify(orders, null, 2));
    
    console.log('订单已删除:', deletedOrder);
    res.json({ success: true, message: '订单已永久删除' });
  } else {
    res.status(404).json({ success: false, message: '订单未找到' });
  }
});

// 获取当前心动值 - 现在根据用户ID获取
app.get('/api/heart-value', authRoutes.verifyToken, (req, res) => {
  const { id } = req.user;
  
  // 从用户数据中读取心动值
  const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
  const user = usersData.find(u => u.id === id);
  
  if (!user) {
    return res.status(404).json({ message: '用户不存在' });
  }
  
  res.json({ heartValue: user.heartValue });
});

// 清理孤儿流水记录（充值申请已删除但流水记录还在）
function cleanupOrphanTransactions() {
  const transactions = JSON.parse(fs.readFileSync(heartTransactionsFile, 'utf8'));
  const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
  
  const requestIds = new Set(requests.map(r => r.id));
  
  const validTransactions = transactions.filter(transaction => {
    // 保留非充值类型的流水记录
    if (transaction.type !== 'recharge') {
      return true;
    }
    // 保留有对应充值申请记录的流水
    return requestIds.has(transaction.relatedId);
  });
  
  // 如果有孤儿记录被清理，更新文件
  if (validTransactions.length !== transactions.length) {
    fs.writeFileSync(heartTransactionsFile, JSON.stringify(validTransactions, null, 2));
    console.log(`清理了 ${transactions.length - validTransactions.length} 条孤儿流水记录`);
  }
}

// 获取心动值流水记录
app.get('/api/heart-transactions', authRoutes.verifyToken, (req, res) => {
  // 每次获取流水时先清理孤儿记录
  cleanupOrphanTransactions();
  
  const { id: userId } = req.user;
  
  const transactions = JSON.parse(fs.readFileSync(heartTransactionsFile, 'utf8'));
  // 按用户ID筛选并按时间倒序排列
  const userTransactions = transactions
    .filter(transaction => transaction.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
  res.json(userTransactions);
});

// 更新心动值（仅供内部使用）
function updateHeartValue(userId, newValue, description = '', type = 'other', relatedId = null) {
  // 读取用户数据
  const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
  const userIndex = usersData.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    console.error(`用户不存在，ID: ${userId}`);
    return false;
  }
  
  const user = usersData[userIndex];
  const oldValue = user.heartValue;
  const changeAmount = newValue - oldValue;
  
  // 更新用户心动值
  usersData[userIndex].heartValue = newValue;
  fs.writeFileSync(resolveDataPath('users.json'), JSON.stringify(usersData, null, 2));
  
  // 记录流水
  const transaction = {
    id: Date.now(),
    userId,
    username: user.username,
    oldValue,
    newValue,
    changeAmount,
    type, // 'order', 'recharge', 'other'
    description,
    relatedId,
    createdAt: new Date().toISOString()
  };
  
  const transactions = JSON.parse(fs.readFileSync(heartTransactionsFile, 'utf8'));
  transactions.push(transaction);
  fs.writeFileSync(heartTransactionsFile, JSON.stringify(transactions, null, 2));
  
  console.log(`心动值流水记录: ${oldValue} → ${newValue} (${changeAmount > 0 ? '+' : ''}${changeAmount}) - ${description} - 用户: ${user.username}`);
  return true;
}

// 提交充值申请
app.post('/api/recharge-requests', authRoutes.verifyToken, (req, res) => {
  const { amount } = req.body;
  const { id: userId, username } = req.user;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ success: false, message: '充值金额必须大于0' });
  }
  
  const request = {
    id: Date.now(),
    userId,
    username,
    amount: parseInt(amount),
    status: 'pending', // pending, approved, rejected
    createdAt: new Date().toISOString(),
    processedAt: null,
    processedBy: null
  };
  
  // 读取现有申请
  const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
  requests.push(request);
  
  // 保存申请
  fs.writeFileSync(rechargeRequestsFile, JSON.stringify(requests, null, 2));
  
  console.log('新充值申请:', request);
  
  res.json({ success: true, requestId: request.id, message: '充值申请已提交，请等待审核' });
});

// 获取所有充值申请（后台管理用）
app.get('/api/recharge-requests', (req, res) => {
  const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
  res.json(requests);
});

// 处理充值申请
app.put('/api/recharge-requests/:id', (req, res) => {
  const { id } = req.params;
  const { status, processedBy, approvedAmount } = req.body; // status: 'approved' 或 'rejected'
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: '无效的处理状态' });
  }
  
  const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
  const requestIndex = requests.findIndex(r => r.id === parseInt(id));
  
  if (requestIndex === -1) {
    return res.status(404).json({ success: false, message: '充值申请未找到' });
  }
  
  const request = requests[requestIndex];
  
  if (request.status !== 'pending') {
    return res.status(400).json({ success: false, message: '该申请已被处理' });
  }
  
  // 确定实际充值金额（如果提供了approvedAmount就用它，否则用原始金额）
  const actualAmount = status === 'approved' && approvedAmount !== undefined 
    ? parseInt(approvedAmount) 
    : request.amount;
  
  // 更新申请状态
  const updatedRequest = {
    ...request,
    status,
    processedAt: new Date().toISOString(),
    processedBy: processedBy || '管理员'
  };
  
  // 如果批准时使用了不同金额，记录实际批准金额
  if (status === 'approved' && approvedAmount !== undefined && actualAmount !== request.amount) {
    updatedRequest.actualAmount = actualAmount;
    updatedRequest.originalAmount = request.amount;
  }
  
  requests[requestIndex] = updatedRequest;
  
  // 如果批准，增加心动值
  if (status === 'approved') {
    // 获取用户当前的心动值
    const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
    const user = usersData.find(u => u.id === request.userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const newHeartValue = user.heartValue + actualAmount;
    
    const description = actualAmount !== request.amount 
      ? `充值申请批准 - 申请ID#${request.id} (原申请💓${request.amount}, 实际批准💓${actualAmount})`
      : `充值申请批准 - 申请ID#${request.id}`;
      
    updateHeartValue(request.userId, newHeartValue, description, 'recharge', request.id);
    console.log(`充值申请已批准: 原申请💓${request.amount}, 实际充值💓${actualAmount}`);
  } else {
    console.log(`充值申请已拒绝: 申请充值💓${request.amount}`);
  }
  
  // 保存更新后的申请
  fs.writeFileSync(rechargeRequestsFile, JSON.stringify(requests, null, 2));
  
  const message = status === 'approved' 
    ? `申请已批准${actualAmount !== request.amount ? `, 实际充值💓${actualAmount}` : ''}`
    : '申请已拒绝';
    
  res.json({ 
    success: true, 
    message,
    actualAmount: status === 'approved' ? actualAmount : undefined
  });
});

// 删除充值申请记录（永久删除）
app.delete('/api/recharge-requests/:id', (req, res) => {
  const { id } = req.params;
  const requestId = parseInt(id);
  
  const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
  const requestIndex = requests.findIndex(r => r.id === requestId);
  
  if (requestIndex !== -1) {
    const deletedRequest = requests[requestIndex];
    requests.splice(requestIndex, 1); // 从数组中永久删除记录
    fs.writeFileSync(rechargeRequestsFile, JSON.stringify(requests, null, 2));
    
    // 同时删除相关的心动值流水记录
    const transactions = JSON.parse(fs.readFileSync(heartTransactionsFile, 'utf8'));
    const filteredTransactions = transactions.filter(transaction => 
      !(transaction.type === 'recharge' && transaction.relatedId === requestId)
    );
    
    // 如果有流水记录被删除，更新文件
    if (filteredTransactions.length !== transactions.length) {
      fs.writeFileSync(heartTransactionsFile, JSON.stringify(filteredTransactions, null, 2));
      console.log(`已删除充值申请 #${requestId} 相关的心动值流水记录`);
    }
    
    console.log('充值申请记录已删除:', deletedRequest);
    res.json({ success: true, message: '充值申请记录及相关流水已永久删除' });
  } else {
    res.status(404).json({ success: false, message: '充值申请记录未找到' });
  }
});

// 中间件：检查是否管理员
const isAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: '需要管理员权限' });
  }
};

// 管理员获取所有用户
app.get('/api/admin/users', authRoutes.verifyToken, isAdmin, (req, res) => {
  const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
  
  // 返回用户信息（不包含密码）
  const usersWithoutPassword = usersData.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  
  res.json(usersWithoutPassword);
});

// 管理员获取所有用户详细信息（包含密码 - 仅供管理使用，安全风险需注意）
app.get('/api/admin/users-full', authRoutes.verifyToken, isAdmin, (req, res) => {
  const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
  
  // ⚠️ 安全警告：此API返回包含密码哈希的完整用户信息
  // 在生产环境中，建议移除此功能或加强访问控制
  console.log('⚠️ 管理员正在访问包含密码的用户数据');
  
  res.json(usersData);
});

const adminPanelMiddlewares = [authRoutes.verifyToken, isAdmin];

// 管理后台专用用户API
app.get('/api/admin-panel/users', adminPanelMiddlewares, (req, res) => {
  const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
  
  console.log(`⚠️ 管理后台正在访问用户数据，操作人: ${req.user?.username}`);
  
  res.json(usersData);
});

// 管理后台删除用户
app.delete('/api/admin-panel/users/:id', adminPanelMiddlewares, (req, res) => {
  const { id } = req.params;
  
  try {
    // 读取用户数据
    const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
    const userIndex = usersData.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const deletedUser = usersData[userIndex];
    
    // 不允许删除管理员账号
    if (deletedUser.isAdmin) {
      return res.status(403).json({ success: false, message: '不允许删除管理员账号' });
    }
    
    // 删除用户
    usersData.splice(userIndex, 1);
    fs.writeFileSync(resolveDataPath('users.json'), JSON.stringify(usersData, null, 2));
    
    // 删除相关数据
    // 删除用户相关的订单
    const ordersFile = resolveDataPath('orders.json');
    if (fs.existsSync(ordersFile)) {
      const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
      const filteredOrders = orders.filter(order => order.userId !== id);
      fs.writeFileSync(ordersFile, JSON.stringify(filteredOrders, null, 2));
    }
    
    // 删除用户相关的充值申请
    const rechargeRequestsFile = resolveDataPath('recharge-requests.json');
    if (fs.existsSync(rechargeRequestsFile)) {
      const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
      const filteredRequests = requests.filter(request => request.userId !== id);
      fs.writeFileSync(rechargeRequestsFile, JSON.stringify(filteredRequests, null, 2));
    }
    
    // 删除用户相关的心动值流水
    const heartTransactionsFile = resolveDataPath('heart-transactions.json');
    if (fs.existsSync(heartTransactionsFile)) {
      const transactions = JSON.parse(fs.readFileSync(heartTransactionsFile, 'utf8'));
      const filteredTransactions = transactions.filter(transaction => transaction.userId !== id);
      fs.writeFileSync(heartTransactionsFile, JSON.stringify(filteredTransactions, null, 2));
    }
    
    console.log(`管理员删除用户账号: ${deletedUser.username} (ID: ${id})`);
    res.json({ success: true, message: '用户账号及所有相关数据已删除' });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 管理后台修改用户信息
app.put('/api/admin-panel/users/:id', adminPanelMiddlewares, (req, res) => {
  const { id } = req.params;
  const { username, password, heartValue } = req.body;
  
  try {
    // 读取用户数据
    const usersData = JSON.parse(fs.readFileSync(resolveDataPath('users.json'), 'utf8'));
    const userIndex = usersData.findIndex(u => u.id === id);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    const user = usersData[userIndex];
    const oldHeartValue = user.heartValue;
    let changes = [];
    
    // 修改用户名
    if (username && username !== user.username) {
      // 检查用户名是否已存在
      const existingUser = usersData.find(u => u.username === username && u.id !== id);
      if (existingUser) {
        return res.status(400).json({ success: false, message: '用户名已存在' });
      }
      const oldUsername = user.username;
      user.username = username;
      changes.push(`用户名: ${oldUsername} → ${username}`);
    }
    
    // 修改密码
    if (password) {
      const bcrypt = require('bcryptjs');
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(password, salt);
      user.password = hashedPassword;
      changes.push('密码已更新');
    }
    
    // 修改心动值
    if (heartValue !== undefined && heartValue !== oldHeartValue) {
      const newHeartValue = parseInt(heartValue);
      if (isNaN(newHeartValue) || newHeartValue < 0) {
        return res.status(400).json({ success: false, message: '心动值必须是非负整数' });
      }
      
      user.heartValue = newHeartValue;
      changes.push(`心动值: 💓${oldHeartValue} → 💓${newHeartValue}`);
      
      // 记录心动值流水
      const changeAmount = newHeartValue - oldHeartValue;
      const description = `管理员调整心动值 (${changeAmount > 0 ? '+' : ''}${changeAmount})`;
      updateHeartValue(id, newHeartValue, description, 'admin', null);
    }
    
    // 保存更新
    usersData[userIndex] = user;
    fs.writeFileSync(resolveDataPath('users.json'), JSON.stringify(usersData, null, 2));
    
    console.log(`管理员修改用户信息: ${user.username} (ID: ${id}) - ${changes.join(', ')}`);
    res.json({ success: true, message: '用户信息已更新', changes });
  } catch (error) {
    console.error('修改用户信息失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 管理员获取所有交易记录
app.get('/api/admin/heart-transactions', authRoutes.verifyToken, isAdmin, (req, res) => {
  const transactions = JSON.parse(fs.readFileSync(heartTransactionsFile, 'utf8'));
  transactions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(transactions);
});

// 管理员获取所有充值请求
app.get('/api/admin/recharge-requests', authRoutes.verifyToken, isAdmin, (req, res) => {
  const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
  requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(requests);
});

// 管理员获取所有订单
app.get('/api/admin/orders', authRoutes.verifyToken, isAdmin, (req, res) => {
  const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(orders);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  console.log(`局域网访问：可通过本机IP地址访问`);
}); 