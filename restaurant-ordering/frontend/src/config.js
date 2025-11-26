// API configuration
const getApiUrl = () => {
  // 如果设置了环境变量，使用环境变量的值
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }

  // 获取当前访问的主机名
  const hostname = window.location.hostname;
  
  // 如果是通过 localtunnel 访问
  if (hostname.includes('loca.lt')) {
    return 'https://restaurant-api.loca.lt';
  }
  
  // 如果是通过 ngrok 访问
  if (hostname.includes('ngrok')) {
    return `https://${hostname.replace('-3000', '-3001')}`;
  }
  
  // 如果是localhost访问
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  // 如果是局域网IP访问，使用相同的IP
  if (hostname.match(/^\d+\.\d+\.\d+\.\d+$/)) {
    return `http://${hostname}:3001`;
  }
  
  // 默认fallback到localhost
  return 'http://localhost:3001';
};

const config = {
  API_URL: getApiUrl()
};

console.log('🌐 API配置:', config.API_URL);

export default config; 