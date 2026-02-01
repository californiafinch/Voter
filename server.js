require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// 响应时间中间件
app.use((req, res, next) => {
    const start = Date.now();
    // 使用res.writableEnded检查响应是否已经发送
    res.on('finish', () => {
        try {
            // 只在响应可写时设置头
            if (!res.headersSent) {
                const duration = Date.now() - start;
                res.setHeader('X-Response-Time', `${duration}ms`);
            }
        } catch (error) {
            // 忽略设置头时的错误
            console.error('设置响应头时出错:', error);
        }
    });
    next();
});

// 请求日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 简单的响应大小优化
app.use((req, res, next) => {
    // 设置响应头，启用浏览器缓存
    if (req.method === 'GET' && req.url.match(/\.(js|css|html|png|jpg|jpeg|gif|ico)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
    }
    next();
});

// 中间件配置
// 允许所有来源的请求
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 预检请求结果缓存24小时
}));

// 处理预检请求
app.options('*', cors());

// 解析JSON请求体
app.use(express.json({ limit: '1mb' }));

// 解析URL编码的请求体
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 静态文件服务
app.use(express.static('.', {
    maxAge: '1d', // 静态文件缓存1天
    etag: true, // 启用ETag
    lastModified: true // 启用Last-Modified
}));

// 根路径路由
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});



// 错误处理中间件
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 只在本地开发环境中启动服务器
if (require.main === module) {
    // 监听所有网络接口，允许移动端访问
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`服务器运行在 http://localhost:${PORT}`);
        console.log(`移动端可通过 http://[服务器IP]:${PORT} 访问`);
    });
}

// 本地开发服务器，不需要 Vercel 导出
