<template>
  <div class="control-signals-view">
    <div class="signals-container">
      <h4>控制信号状态</h4>
      
      <!-- 主要控制信号 -->
      <div class="signal-group">
        <h5>内存控制信号</h5>
        <div class="signal-list">
          <div class="signal-item" :class="{ active: signals.memRead }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.memRead }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">MemRead</span>
              <span class="signal-desc">内存读取使能</span>
            </div>
            <div class="signal-value">{{ signals.memRead ? '1' : '0' }}</div>
          </div>
          
          <div class="signal-item" :class="{ active: signals.memWrite }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.memWrite }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">MemWrite</span>
              <span class="signal-desc">内存写入使能</span>
            </div>
            <div class="signal-value">{{ signals.memWrite ? '1' : '0' }}</div>
          </div>
        </div>
      </div>

      <!-- 寄存器控制信号 -->
      <div class="signal-group">
        <h5>寄存器控制信号</h5>
        <div class="signal-list">
          <div class="signal-item" :class="{ active: signals.regWrite }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.regWrite }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">RegWrite</span>
              <span class="signal-desc">寄存器写入使能</span>
            </div>
            <div class="signal-value">{{ signals.regWrite ? '1' : '0' }}</div>
          </div>
          
          <div class="signal-item" :class="{ active: signals.regDst }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.regDst }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">RegDst</span>
              <span class="signal-desc">目标寄存器选择</span>
            </div>
            <div class="signal-value">{{ signals.regDst ? '1' : '0' }}</div>
          </div>
          
          <div class="signal-item" :class="{ active: signals.memToReg }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.memToReg }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">MemToReg</span>
              <span class="signal-desc">内存到寄存器</span>
            </div>
            <div class="signal-value">{{ signals.memToReg ? '1' : '0' }}</div>
          </div>
        </div>
      </div>

      <!-- ALU控制信号 -->
      <div class="signal-group">
        <h5>ALU控制信号</h5>
        <div class="signal-list">
          <div class="signal-item" :class="{ active: signals.aluOp !== 'NOP' }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.aluOp !== 'NOP' }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">ALUOp</span>
              <span class="signal-desc">ALU操作选择</span>
            </div>
            <div class="signal-value">{{ signals.aluOp }}</div>
          </div>
        </div>
      </div>

      <!-- 程序计数器控制信号 -->
      <div class="signal-group">
        <h5>程序计数器控制</h5>
        <div class="signal-list">
          <div class="signal-item" :class="{ active: signals.pcWrite }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.pcWrite }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">PCWrite</span>
              <span class="signal-desc">PC写入使能</span>
            </div>
            <div class="signal-value">{{ signals.pcWrite ? '1' : '0' }}</div>
          </div>
          
          <div class="signal-item" :class="{ active: signals.jump }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.jump }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">Jump</span>
              <span class="signal-desc">无条件跳转</span>
            </div>
            <div class="signal-value">{{ signals.jump ? '1' : '0' }}</div>
          </div>
          
          <div class="signal-item" :class="{ active: signals.branch }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.branch }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">Branch</span>
              <span class="signal-desc">条件跳转</span>
            </div>
            <div class="signal-value">{{ signals.branch ? '1' : '0' }}</div>
          </div>
        </div>
      </div>

      <!-- 指令寄存器控制 -->
      <div class="signal-group">
        <h5>指令寄存器控制</h5>
        <div class="signal-list">
          <div class="signal-item" :class="{ active: signals.irWrite }">
            <div class="signal-indicator">
              <div class="signal-dot" :class="{ on: signals.irWrite }"></div>
            </div>
            <div class="signal-info">
              <span class="signal-name">IRWrite</span>
              <span class="signal-desc">指令寄存器写入</span>
            </div>
            <div class="signal-value">{{ signals.irWrite ? '1' : '0' }}</div>
          </div>
        </div>
      </div>

      <!-- 信号时序图 -->
      <div class="signal-timing">
        <h5>信号时序</h5>
        <div class="timing-container">
          <div class="timing-header">
            <div class="time-axis">
              <div v-for="i in 8" :key="i" class="time-tick">
                T{{ i }}
              </div>
            </div>
          </div>
          
          <div class="timing-signals">
            <div 
              v-for="signalName in signalNames" 
              :key="signalName"
              class="timing-signal"
            >
              <div class="signal-label">{{ signalName }}</div>
              <div class="signal-waveform">
                <div 
                  v-for="cycle in 8" 
                  :key="cycle"
                  class="waveform-segment"
                  :class="{ 
                    high: isSignalHighAtCycle(signalName, cycle),
                    transition: hasTransitionAtCycle(signalName, cycle)
                  }"
                >
                  <div class="segment-line"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 控制字生成器 -->
      <div class="control-word">
        <h5>控制字</h5>
        <div class="control-word-display">
          <div class="word-binary">
            <span class="bit-group">{{ getControlWordBinary().slice(0, 4) }}</span>
            <span class="bit-group">{{ getControlWordBinary().slice(4, 8) }}</span>
            <span class="bit-group">{{ getControlWordBinary().slice(8, 12) }}</span>
            <span class="bit-group">{{ getControlWordBinary().slice(12, 16) }}</span>
          </div>
          <div class="word-hex">
            HEX: {{ getControlWordHex() }}
          </div>
          <div class="word-description">
            <div class="bit-mapping">
              <div class="bit-item">
                <span class="bit-pos">[0]</span>
                <span class="bit-name">MemRead</span>
              </div>
              <div class="bit-item">
                <span class="bit-pos">[1]</span>
                <span class="bit-name">MemWrite</span>
              </div>
              <div class="bit-item">
                <span class="bit-pos">[2]</span>
                <span class="bit-name">RegWrite</span>
              </div>
              <div class="bit-item">
                <span class="bit-pos">[3]</span>
                <span class="bit-name">RegDst</span>
              </div>
              <div class="bit-item">
                <span class="bit-pos">[4]</span>
                <span class="bit-name">MemToReg</span>
              </div>
              <div class="bit-item">
                <span class="bit-pos">[5]</span>
                <span class="bit-name">Jump</span>
              </div>
              <div class="bit-item">
                <span class="bit-pos">[6]</span>
                <span class="bit-name">Branch</span>
              </div>
              <div class="bit-item">
                <span class="bit-pos">[7]</span>
                <span class="bit-name">PCWrite</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 信号统计 -->
      <div class="signal-stats">
        <h5>信号统计</h5>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">活跃信号数:</span>
            <span class="stat-value">{{ activeSignalCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">控制字值:</span>
            <span class="stat-value">{{ getControlWordDecimal() }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">信号变化:</span>
            <span class="stat-value">{{ signalChangeCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ControlSignals } from '../types/cpu'

interface Props {
  signals: ControlSignals
}

const props = defineProps<Props>()

// 响应式数据
const signalChangeCount = ref(0)
const signalHistory = ref<ControlSignals[]>([])

// 信号名称列表
const signalNames = [
  'MemRead', 'MemWrite', 'RegWrite', 'PCWrite', 
  'Jump', 'Branch', 'IRWrite', 'ALUOp'
]

// 计算属性
const activeSignalCount = computed(() => {
  let count = 0
  if (props.signals.memRead) count++
  if (props.signals.memWrite) count++
  if (props.signals.regWrite) count++
  if (props.signals.pcWrite) count++
  if (props.signals.irWrite) count++
  if (props.signals.regDst) count++
  if (props.signals.memToReg) count++
  if (props.signals.jump) count++
  if (props.signals.branch) count++
  if (props.signals.aluOp !== 'NOP') count++
  return count
})

// 监听信号变化
watch(() => props.signals, (newSignals, oldSignals) => {
  if (oldSignals) {
    signalChangeCount.value++
    signalHistory.value.push({ ...newSignals })
    
    // 保持历史记录不超过8个周期
    if (signalHistory.value.length > 8) {
      signalHistory.value = signalHistory.value.slice(-8)
    }
  }
}, { deep: true })

// 方法
function getControlWordBinary(): string {
  let word = 0
  if (props.signals.memRead) word |= 0x01
  if (props.signals.memWrite) word |= 0x02
  if (props.signals.regWrite) word |= 0x04
  if (props.signals.regDst) word |= 0x08
  if (props.signals.memToReg) word |= 0x10
  if (props.signals.jump) word |= 0x20
  if (props.signals.branch) word |= 0x40
  if (props.signals.pcWrite) word |= 0x80
  
  return word.toString(2).padStart(16, '0')
}

function getControlWordHex(): string {
  let word = 0
  if (props.signals.memRead) word |= 0x01
  if (props.signals.memWrite) word |= 0x02
  if (props.signals.regWrite) word |= 0x04
  if (props.signals.regDst) word |= 0x08
  if (props.signals.memToReg) word |= 0x10
  if (props.signals.jump) word |= 0x20
  if (props.signals.branch) word |= 0x40
  if (props.signals.pcWrite) word |= 0x80
  
  return '0x' + word.toString(16).toUpperCase().padStart(4, '0')
}

function getControlWordDecimal(): number {
  let word = 0
  if (props.signals.memRead) word |= 0x01
  if (props.signals.memWrite) word |= 0x02
  if (props.signals.regWrite) word |= 0x04
  if (props.signals.regDst) word |= 0x08
  if (props.signals.memToReg) word |= 0x10
  if (props.signals.jump) word |= 0x20
  if (props.signals.branch) word |= 0x40
  if (props.signals.pcWrite) word |= 0x80
  
  return word
}

function isSignalHighAtCycle(signalName: string, cycle: number): boolean {
  // 简化的时序逻辑：基于当前信号状态
  const currentSignal = getCurrentSignalValue(signalName)
  
  // 模拟不同信号在不同周期的状态
  switch (signalName) {
    case 'MemRead':
      return cycle <= 2 && currentSignal
    case 'MemWrite':
      return cycle >= 3 && cycle <= 4 && currentSignal
    case 'RegWrite':
      return cycle >= 4 && currentSignal
    case 'PCWrite':
      return cycle === 1 || cycle === 5 && currentSignal
    case 'ALUOp':
      return cycle >= 2 && cycle <= 3 && currentSignal
    default:
      return currentSignal
  }
}

function hasTransitionAtCycle(signalName: string, cycle: number): boolean {
  // 检查信号在特定周期是否有跳变
  if (cycle === 1) return false
  
  const currentHigh = isSignalHighAtCycle(signalName, cycle)
  const previousHigh = isSignalHighAtCycle(signalName, cycle - 1)
  
  return currentHigh !== previousHigh
}

function getCurrentSignalValue(signalName: string): boolean {
  switch (signalName) {
    case 'MemRead': return props.signals.memRead
    case 'MemWrite': return props.signals.memWrite
    case 'RegWrite': return props.signals.regWrite
    case 'PCWrite': return props.signals.pcWrite
    case 'IRWrite': return props.signals.irWrite
    case 'Jump': return props.signals.jump
    case 'Branch': return props.signals.branch
    case 'ALUOp': return props.signals.aluOp !== 'NOP'
    default: return false
  }
}
</script>

<style scoped>
.control-signals-view {
  height: 100%;
  overflow-y: auto;
}

.signals-container {
  padding: 0.5rem;
}

.signal-group {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.signal-group h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.signal-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.signal-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.signal-item.active {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-color: #28a745;
  box-shadow: 0 2px 8px rgba(40, 167, 69, 0.2);
}

.signal-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
}

.signal-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #6c757d;
  transition: all 0.3s ease;
  position: relative;
}

.signal-dot.on {
  background: #28a745;
  box-shadow: 0 0 12px rgba(40, 167, 69, 0.6);
  animation: pulse 2s infinite;
}

.signal-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.signal-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  font-family: 'Courier New', monospace;
}

.signal-desc {
  font-size: 0.75rem;
  color: #6c757d;
}

.signal-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  font-size: 0.9rem;
  color: #495057;
  min-width: 60px;
  text-align: center;
  padding: 0.25rem 0.5rem;
  background: #e9ecef;
  border-radius: 4px;
}

.signal-item.active .signal-value {
  background: #28a745;
  color: white;
}

/* 时序图样式 */
.signal-timing {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.signal-timing h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.timing-container {
  overflow-x: auto;
}

.timing-header {
  margin-bottom: 1rem;
}

.time-axis {
  display: flex;
  margin-left: 80px;
}

.time-tick {
  flex: 1;
  text-align: center;
  padding: 0.5rem;
  font-size: 0.8rem;
  font-weight: 500;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  min-width: 60px;
}

.timing-signals {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.timing-signal {
  display: flex;
  align-items: center;
  height: 40px;
}

.signal-label {
  width: 80px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #495057;
  font-family: 'Courier New', monospace;
  text-align: right;
  padding-right: 0.5rem;
}

.signal-waveform {
  display: flex;
  flex: 1;
  height: 24px;
  border: 1px solid #dee2e6;
  background: #f8f9fa;
}

.waveform-segment {
  flex: 1;
  position: relative;
  border-right: 1px solid #dee2e6;
}

.segment-line {
  height: 100%;
  background: #6c757d;
  transition: all 0.3s ease;
}

.waveform-segment.high .segment-line {
  background: #28a745;
  height: 80%;
  margin-top: 10%;
}

.waveform-segment.transition::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 0;
  width: 2px;
  height: 100%;
  background: #dc3545;
}

/* 控制字样式 */
.control-word {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.control-word h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.control-word-display {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.word-binary {
  display: flex;
  gap: 0.5rem;
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 600;
  justify-content: center;
}

.bit-group {
  padding: 0.5rem;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.word-hex {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  font-weight: 600;
  color: #007bff;
}

.bit-mapping {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 0.5rem;
}

.bit-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.8rem;
}

.bit-pos {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #6c757d;
  min-width: 30px;
}

.bit-name {
  color: #495057;
}

/* 统计样式 */
.signal-stats {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.signal-stats h5 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  gap: 0.75rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background: white;
  border-radius: 4px;
}

.stat-label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
}

@keyframes pulse {
  0% { 
    box-shadow: 0 0 12px rgba(40, 167, 69, 0.6);
  }
  50% { 
    box-shadow: 0 0 20px rgba(40, 167, 69, 0.9);
  }
  100% { 
    box-shadow: 0 0 12px rgba(40, 167, 69, 0.6);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .signal-item {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }
  
  .signal-info {
    align-items: center;
  }
  
  .timing-container {
    font-size: 0.8rem;
  }
  
  .word-binary {
    flex-direction: column;
    align-items: center;
  }
  
  .bit-mapping {
    grid-template-columns: 1fr;
  }
}
</style>
