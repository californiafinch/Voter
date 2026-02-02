// 同步脚本：将 intVoter.html 的内容复制到 index.html
// 确保两个文件保持同步，避免 GitHub Pages 显示不一致的问题

const fs = require('fs');
const path = require('path');

// 文件路径
const intVoterPath = path.join(__dirname, 'intVoter.html');
const indexPath = path.join(__dirname, 'index.html');

console.log('开始同步 HTML 文件...');

// 读取 intVoter.html 文件内容
fs.readFile(intVoterPath, 'utf8', (err, data) => {
    if (err) {
        console.error('读取 intVoter.html 文件失败:', err);
        process.exit(1);
    }

    // 写入 index.html 文件
    fs.writeFile(indexPath, data, 'utf8', (err) => {
        if (err) {
            console.error('写入 index.html 文件失败:', err);
            process.exit(1);
        }

        console.log('✅ HTML 文件同步成功！');
        console.log(`📄 intVoter.html 的内容已复制到 index.html`);
        console.log(`📅 同步时间: ${new Date().toLocaleString()}`);
    });
});

// 验证同步结果
function verifySync() {
    console.log('\n验证同步结果...');
    
    const intVoterContent = fs.readFileSync(intVoterPath, 'utf8');
    const indexContent = fs.readFileSync(indexPath, 'utf8');
    
    if (intVoterContent === indexContent) {
        console.log('✅ 验证通过：两个文件内容完全相同');
    } else {
        console.error('❌ 验证失败：两个文件内容不同');
        process.exit(1);
    }
}

// 延迟验证，确保文件写入完成
setTimeout(verifySync, 1000);