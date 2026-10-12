// ===== 1. 状态初始化与本地存储 =====
// 读取本地数据或使用默认状态
const storageKey = 'your-card-site-v1';

const defaultState = {
  moeCount: 0,   // 摸鱼计数
  workCount: 0,  // 工作计数
  statusText: '等待你的记录...'
};

// 从 localStorage 读取，如果没有则使用默认状态
let state = JSON.parse(localStorage.getItem(storageKey)) || { ...defaultState };

// ===== 2. 保存状态函数 =====
function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    showToast('✅ 数据已保存到本地');
  } catch (e) {
    showToast('❌ 保存失败：存储空间不足', 'error');
  }
}

// ===== 3. 数据导出函数 =====
function exportData() {
  const dataStr = JSON.stringify(state);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'card-site-backup.json';
  a.click();
  
  // 清理 URL 对象
  setTimeout(() => URL.revokeObjectURL(url), 100);
  
  showToast('📁 备份文件已下载到默认保存位置');
}

// ===== 4. 数据导入函数 =====
function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      
      // 基本验证：确保必要属性存在
      if (imported.moeCount !== undefined && imported.workCount !== undefined) {
        state = { ...state, ...imported };
        saveState();
        updateUI();
        showToast('✅ 数据导入成功');
      } else {
        showToast('❌ 无效的备份文件：缺少必要数据', 'error');
      }
    } catch (err) {
      showToast('❌ 文件解析错误：可能不是有效的备份', 'error');
    }
  };
  
  reader.readAsText(file);
}

// ===== 5. UI 更新函数 =====
function updateUI() {
  // 更新计数显示
  document.getElementById('moeCount').textContent = state.moeCount;
  document.getElementById('workCount').textContent = state.workCount;
  
  // 更新状态文字
  const statusEl = document.getElementById('statusText');
  statusEl.textContent = state.moeCount > 0 || state.workCount > 0 
    ? `今天已记录 ${state.moeCount} 次摸鱼，${state.workCount} 次工作` 
    : '点击上方按钮开始记录';
}

// ===== 6. 事件绑定 =====
document.addEventListener('DOMContentLoaded', () => {
  // 初始化 UI
  updateUI();
  
  // 按钮事件
  document.getElementById('moeBtn').addEventListener('click', () => {
    state.moeCount++;
    saveState();
    updateUI();
  });
  
  document.getElementById('workBtn').addEventListener('click', () => {
    state.workCount++;
    saveState();
    updateUI();
  });
  
  // 设置按钮（打开模态框）
  document.getElementById('settingsBtn').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'flex';
  });
  
  // 导出按钮
  document.getElementById('exportBtn').addEventListener('click', exportData);
  
  // 导入按钮 - 点击选择文件
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  
  // 隐藏的文件输入框
  const importFile = document.getElementById('importFile');
  importFile.addEventListener('change', importData);
  
  // 关闭模态框
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal').style.display = 'none';
    });
  });
  
  // 点击模态框外部关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  });
});

// ===== 7. 简单的提示功能 =====
function showToast(message, type = 'success') {
  // 移除旧的提示（如果存在）
  const oldToast = document.querySelector('.toast');
  if (oldToast) oldToast.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  // 样式
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.left = '50%';
  toast.style.transform = 'translateX(-50%)';
  toast.style.padding = '12px 24px';
  toast.style.borderRadius = '24px';
  toast.style.color = 'white';
  toast.style.background = type === 'success' ? 'var(--primary)' : '#e74c3c';
  toast.style.zIndex = '1000';
  toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
  toast.style.transition = 'opacity 0.3s';
  
  document.body.appendChild(toast);
  
  // 3秒后消失
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}