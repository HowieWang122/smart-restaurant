const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 密钥，优先使用环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'kristy-restaurant-jwt-secret';

// 用户数据文件路径
const usersFilePath = path.join(__dirname, '../../data/users.json');
const heartValuesFilePath = path.join(__dirname, '../../data/heart-values.json');

// 确保文件存在
const ensureFileExists = (filePath, defaultContent = '[]') => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent, 'utf8');
    console.log(`已创建文件: ${filePath}`);
  }
};

// 初始化文件
ensureFileExists(usersFilePath, JSON.stringify([]));

// 读取用户数据
const getUsers = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read user data:', error);
    return [];
  }
};

// 保存用户数据
const saveUsers = (users) => {
  try {
    fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2), 'utf8');
  } catch (error) {
    console.error('Failed to save user data:', error);
  }
};

// 读取心动值数据
const getHeartValues = () => {
  try {
    const data = fs.readFileSync(heartValuesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to read heart value data:', error);
    return { value: 0 };
  }
};

// 初始化管理员账户
const initAdminUser = () => {
  const users = getUsers();
  const adminExists = users.some(user => user.username === 'admin');
  
  if (!adminExists) {
    // 生成密码哈希
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync('kristy', salt);
    
    // 创建管理员用户
    const adminUser = {
      id: Date.now().toString(),
      username: 'admin',
      password: hashedPassword,
      isAdmin: true,
      heartValue: 9999,
      createdAt: new Date().toISOString()
    };
    
    users.push(adminUser);
    saveUsers(users);
    console.log('已初始化管理员账户');
  }
};

// 应用启动时初始化管理员账户
initAdminUser();

// 注册新用户
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // 检查用户名是否已存在
    const users = getUsers();
    if (users.some(user => user.username === username)) {
      return res.status(400).json({ message: '用户名已存在' });
    }
    
    // 创建新用户
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);
    
    const newUser = {
      id: Date.now().toString(),
      username,
      password: hashedPassword,
      isAdmin: false,
      heartValue: 100, // 新用户初始心动值
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, isAdmin: newUser.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（不含密码）
    const userWithoutPassword = { ...newUser };
    delete userWithoutPassword.password;
    
    res.status(201).json({
      message: '注册成功',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Registration failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: '用户名和密码不能为空' });
    }
    
    // 查找用户
    const users = getUsers();
    const user = users.find(u => u.username === username);
    
    // 如果用户不存在，提示注册
    if (!user) {
      return res.status(404).json({ message: '用户名不存在，请注册' });
    }
    
    // 验证密码
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }
    
    // 生成JWT令牌
    const token = jwt.sign(
      { id: user.id, username: user.username, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // 返回用户信息（不含密码）
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    res.json({
      message: '登录成功',
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 中间件：验证令牌
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: '未提供认证令牌' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: '无效或过期的令牌' });
  }
};

// 获取当前用户信息
router.get('/me', verifyToken, (req, res) => {
  try {
    // 获取完整的用户信息
    const users = getUsers();
    const user = users.find(u => u.id === req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 返回用户信息（不含密码）
    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;
    
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Failed to get user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// 更改密码
router.put('/change-password', verifyToken, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: '请提供当前密码和新密码' });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: '新密码至少需要6位' });
    }
    
    // 获取用户数据
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 验证当前密码
    const isCurrentPasswordValid = bcrypt.compareSync(oldPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({ success: false, message: '当前密码错误' });
    }
    
    // 生成新密码哈希
    const salt = bcrypt.genSaltSync(10);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);
    
    // 更新密码
    const userIndex = users.findIndex(u => u.id === userId);
    users[userIndex].password = hashedNewPassword;
    
    // 保存到文件
    saveUsers(users);
    
    console.log(`用户 ${user.username} 修改了密码`);
    
    res.json({ success: true, message: '密码修改成功' });
  } catch (error) {
    console.error('Password change failed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 删除账号
router.delete('/delete-account', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const username = req.user.username;
    
    // 不允许删除管理员账号
    if (req.user.isAdmin) {
      return res.status(403).json({ success: false, message: '不允许删除管理员账号' });
    }
    
    // 获取用户数据
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }
    
    // 删除用户账号
    users.splice(userIndex, 1);
    saveUsers(users);
    
    // 删除相关数据文件
    const dataDir = path.join(__dirname, '../../data');
    
    // 删除用户相关的订单
    const ordersFile = path.join(dataDir, 'orders.json');
    if (fs.existsSync(ordersFile)) {
      const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf8'));
      const filteredOrders = orders.filter(order => order.userId !== userId);
      fs.writeFileSync(ordersFile, JSON.stringify(filteredOrders, null, 2));
    }
    
    // 删除用户相关的充值申请
    const rechargeRequestsFile = path.join(dataDir, 'recharge-requests.json');
    if (fs.existsSync(rechargeRequestsFile)) {
      const requests = JSON.parse(fs.readFileSync(rechargeRequestsFile, 'utf8'));
      const filteredRequests = requests.filter(request => request.userId !== userId);
      fs.writeFileSync(rechargeRequestsFile, JSON.stringify(filteredRequests, null, 2));
    }
    
    // 删除用户相关的心动值流水
    const heartTransactionsFile = path.join(dataDir, 'heart-transactions.json');
    if (fs.existsSync(heartTransactionsFile)) {
      const transactions = JSON.parse(fs.readFileSync(heartTransactionsFile, 'utf8'));
      const filteredTransactions = transactions.filter(transaction => transaction.userId !== userId);
      fs.writeFileSync(heartTransactionsFile, JSON.stringify(filteredTransactions, null, 2));
    }
    
    console.log(`用户账号已永久删除: ${username} (ID: ${userId})`);
    console.log('已删除该用户的所有相关数据：订单、充值申请、心动值流水');
    
    res.json({ success: true, message: '账号及所有相关数据已永久删除' });
  } catch (error) {
    console.error('Account deletion failed:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// 导出验证令牌中间件，以便在其他路由中使用
router.verifyToken = verifyToken;

module.exports = router; 