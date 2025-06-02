<template>
  <div id="app">
    <!-- 应用头部 -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title">
          <Cpu class="app-icon" />
          CPU指令执行可视化模拟器
        </h1>
        <div class="header-actions">
          <button @click="toggleTheme" class="btn btn-outline">
            <component :is="isDarkMode ? Sun : Moon" class="icon" />
            {{ isDarkMode ? '浅色' : '深色' }}
          </button>
          <button @click="showHelp = true" class="btn btn-outline">
            <HelpCircle class="icon" />
            帮助
          </button>
          <button @click="showAbout = true" class="btn btn-outline">
            <Info class="icon" />
            关于
          </button>
        </div>
      </div>
    </header>

    <!-- 主要内容区域 -->
    <main class="app-main">
      <CPUSimulator />
    </main>

    <!-- 帮助对话框 -->
    <div v-if="showHelp" class="modal-overlay" @click="showHelp = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>使用帮助</h2>
          <button @click="showHelp = false" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="help-content">
            <section class="help-section">
              <h3>快速开始</h3>
              <ol>
                <li>在左侧控制面板输入汇编指令，如 <code>ADD R0, R1, R2</code></li>
                <li>点击"执行"按钮或按回车键执行指令</li>
                <li>观察中央的CPU架构图和执行流水线的状态变化</li>
                <li>查看右侧的寄存器、内存和控制信号的实时状态</li>
              </ol>
            </section>

            <section class="help-section">
              <h3>支持的指令</h3>
              <div class="instruction-help">
                <div class="instruction-category">
                  <h4>算术指令</h4>
                  <ul>
                    <li><code>ADD Rd, Rs1, Rs2</code> - 加法运算</li>
                    <li><code>SUB Rd, Rs1, Rs2</code> - 减法运算</li>
                    <li><code>MUL Rd, Rs1, Rs2</code> - 乘法运算</li>
                    <li><code>DIV Rd, Rs1, Rs2</code> - 除法运算</li>
                  </ul>
                </div>

                <div class="instruction-category">
                  <h4>数据传送指令</h4>
                  <ul>
                    <li><code>MOV Rd, source</code> - 数据移动</li>
                    <li><code>LOAD Rd, address</code> - 从内存加载</li>
                    <li><code>STORE Rs, address</code> - 存储到内存</li>
                  </ul>
                </div>

                <div class="instruction-category">
                  <h4>控制指令</h4>
                  <ul>
                    <li><code>CMP Rs1, Rs2</code> - 比较指令</li>
                    <li><code>JMP address</code> - 无条件跳转</li>
                    <li><code>JZ address</code> - 零标志跳转</li>
                    <li><code>JNZ address</code> - 非零标志跳转</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="help-section">
              <h3>寻址模式</h3>
              <ul>
                <li><strong>立即数:</strong> <code>#10</code> - 直接使用数值10</li>
                <li><strong>寄存器:</strong> <code>R1</code> - 使用寄存器R1的值</li>
                <li><strong>直接寻址:</strong> <code>1000</code> - 使用内存地址1000的值</li>
                <li><strong>间接寻址:</strong> <code>[R1]</code> - 使用R1中地址指向的内存值</li>
              </ul>
            </section>

            <section class="help-section">
              <h3>界面说明</h3>
              <ul>
                <li><strong>控制面板:</strong> 左侧区域，用于输入指令和控制执行</li>
                <li><strong>CPU架构图:</strong> 中央上方，显示CPU各部件的连接和状态</li>
                <li><strong>执行流水线:</strong> 中央下方，显示五级流水线的执行过程</li>
                <li><strong>寄存器视图:</strong> 右侧上方，显示所有寄存器的状态</li>
                <li><strong>内存视图:</strong> 右侧中间，显示内存内容</li>
                <li><strong>控制信号:</strong> 右侧下方，显示各种控制信号状态</li>
              </ul>
            </section>

            <section class="help-section">
              <h3>预设示例</h3>
              <p>在控制面板中选择"预设指令示例"可以快速体验不同类型的指令执行过程：</p>
              <ul>
                <li><strong>基本算术运算:</strong> 演示加减乘除操作</li>
                <li><strong>内存操作:</strong> 演示加载和存储指令</li>
                <li><strong>条件跳转:</strong> 演示比较和跳转指令</li>
                <li><strong>循环计算:</strong> 演示简单循环结构</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>

    <!-- 关于对话框 -->
    <div v-if="showAbout" class="modal-overlay" @click="showAbout = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>关于项目</h2>
          <button @click="showAbout = false" class="btn-close">
            <X class="icon" />
          </button>
        </div>
        <div class="modal-body">
          <div class="about-content">
            <div class="project-info">
              <h3>CPU指令执行可视化模拟器</h3>
              <p>这是一个基于Vue 3和TypeScript开发的CPU指令执行可视化教学工具。</p>
              
              <h4>主要功能</h4>
              <ul>
                <li>实时可视化CPU指令执行过程</li>
                <li>五级流水线执行步骤详细展示</li>
                <li>寄存器和内存状态实时监控</li>
                <li>控制信号状态和时序图显示</li>
                <li>支持多种汇编指令和寻址模式</li>
                <li>预设指令示例快速体验</li>
              </ul>

              <h4>技术栈</h4>
              <ul>
                <li>Vue 3 - 前端框架</li>
                <li>TypeScript - 类型安全</li>
                <li>Vite - 构建工具</li>
                <li>SVG - 图形绘制</li>
                <li>CSS3 - 样式和动画</li>
              </ul>

              <h4>教育价值</h4>
              <p>本模拟器适用于计算机组成原理、计算机体系结构等课程的教学，帮助学生：</p>
              <ul>
                <li>理解CPU内部结构和工作原理</li>
                <li>掌握指令执行的五个基本阶段</li>
                <li>学习不同类型指令的执行过程</li>
                <li>了解控制信号的作用和时序</li>
                <li>体验流水线技术的优势</li>
              </ul>
            </div>

            <div class="version-info">
              <h4>版本信息</h4>
              <p>版本: v1.0.0</p>
              <p>构建时间: {{ new Date().toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载指示器 -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>正在初始化模拟器...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Cpu, Sun, Moon, HelpCircle, Info, X } from 'lucide-vue-next'
import CPUSimulator from './components/CPUSimulator.vue'

// 响应式数据
const isDarkMode = ref(false)
const showHelp = ref(false)
const showAbout = ref(false)
const isLoading = ref(true)

// 生命周期
onMounted(() => {
  // 检查用户的主题偏好
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDarkMode.value = true
    document.documentElement.classList.add('dark')
  }

  // 模拟加载过程
  setTimeout(() => {
    isLoading.value = false
  }, 1500)
})

// 方法
function toggleTheme() {
  isDarkMode.value = !isDarkMode.value
  
  if (isDarkMode.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
}
</script>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 75%, #f5576c 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  color: var(--text-color, #2c3e50);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(222, 226, 230, 0.3);
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.app-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
}

.app-icon {
  width: 2rem;
  height: 2rem;
  color: #007bff;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.app-main {
  flex: 1;
  padding: 0;
  max-width: 100%;
  margin: 0 auto;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #dee2e6;
  background: #f8f9fa;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.3s ease;
}

.btn-close:hover {
  background: #e9ecef;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

/* 帮助内容样式 */
.help-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.help-section h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  border-bottom: 2px solid #007bff;
  padding-bottom: 0.5rem;
}

.help-section h4 {
  margin: 1rem 0 0.5rem 0;
  color: #495057;
}

.help-section ul,
.help-section ol {
  margin: 0;
  padding-left: 1.5rem;
}

.help-section li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.instruction-help {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

.instruction-category {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #007bff;
}

.instruction-category h4 {
  margin-top: 0;
  color: #007bff;
}

code {
  background: #e9ecef;
  padding: 0.125rem 0.25rem;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #e83e8c;
}

/* 关于内容样式 */
.about-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.project-info h3 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.project-info h4 {
  margin: 1.5rem 0 0.75rem 0;
  color: #007bff;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.25rem;
}

.project-info p {
  line-height: 1.6;
  margin-bottom: 1rem;
}

.project-info ul {
  margin: 0;
  padding-left: 1.5rem;
}

.project-info li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.version-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #28a745;
}

.version-info h4 {
  margin: 0 0 0.5rem 0;
  color: #28a745;
}

.version-info p {
  margin: 0.25rem 0;
  font-family: 'Courier New', monospace;
  color: #6c757d;
}

/* 加载样式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 深色主题 */
:global(.dark) {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
}

:global(.dark) .app-header {
  background: #2d2d2d;
  border-bottom-color: #404040;
}

:global(.dark) .app-title {
  color: #e0e0e0;
}

:global(.dark) .modal-content {
  background: #2d2d2d;
  color: #e0e0e0;
}

:global(.dark) .modal-header {
  background: #1a1a1a;
  border-bottom-color: #404040;
}

:global(.dark) .modal-header h2 {
  color: #e0e0e0;
}

:global(.dark) .instruction-category,
:global(.dark) .version-info {
  background: #1a1a1a;
}

:global(.dark) code {
  background: #404040;
  color: #ffc107;
}

.icon {
  width: 1rem;
  height: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
  
  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .instruction-help {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    margin: 0.5rem;
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body {
    padding: 1rem;
  }
}
</style>
