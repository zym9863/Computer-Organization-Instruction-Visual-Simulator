<template>
  <div class="register-view">
    <div class="register-container">
      <div class="register-section">
        <h4>通用寄存器</h4>
        <div class="register-grid">
          <div 
            v-for="reg in generalRegisters" 
            :key="reg.name"
            class="register-item"
            :class="{ highlighted: reg.highlighted }"
          >
            <div class="register-header">
              <span class="register-name">{{ reg.name }}</span>
              <span class="register-size">32bit</span>
            </div>
            <div class="register-value">
              <input 
                :value="formatValue(reg.value)"
                @input="updateRegisterValue(reg.name, $event)"
                @focus="highlightRegister(reg.name)"
                @blur="unhighlightRegister(reg.name)"
                :readonly="readonly"
                class="value-input"
                :class="{ readonly: readonly }"
              />
              <div class="value-formats">
                <span class="format-label">HEX:</span>
                <span class="format-value">{{ toHex(reg.value) }}</span>
                <span class="format-label">BIN:</span>
                <span class="format-value">{{ toBin(reg.value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="register-section">
        <h4>专用寄存器</h4>
        <div class="register-grid">
          <div 
            v-for="reg in specialRegisters" 
            :key="reg.name"
            class="register-item special"
            :class="{ highlighted: reg.highlighted }"
          >
            <div class="register-header">
              <span class="register-name">{{ reg.name }}</span>
              <span class="register-desc">{{ reg.description }}</span>
            </div>
            <div class="register-value">
              <input 
                :value="formatValue(reg.value)"
                @input="updateRegisterValue(reg.name, $event)"
                @focus="highlightRegister(reg.name)"
                @blur="unhighlightRegister(reg.name)"
                :readonly="readonly || reg.readonly"
                class="value-input"
                :class="{ readonly: readonly || reg.readonly }"
              />
              <div class="value-formats">
                <span class="format-label">HEX:</span>
                <span class="format-value">{{ toHex(reg.value) }}</span>
                <span v-if="reg.name === 'PSW'" class="status-flags">
                  <span class="flag" :class="{ active: (reg.value & 0x40) !== 0 }">Z</span>
                  <span class="flag" :class="{ active: (reg.value & 0x80) !== 0 }">N</span>
                  <span class="flag" :class="{ active: (reg.value & 0x01) !== 0 }">C</span>
                  <span class="flag" :class="{ active: (reg.value & 0x02) !== 0 }">V</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="register-tools">
        <h4>寄存器工具</h4>
        <div class="tools-grid">
          <div class="tool-item">
            <label>显示格式</label>
            <select v-model="displayFormat" @change="updateDisplayFormat">
              <option value="dec">十进制 (DEC)</option>
              <option value="hex">十六进制 (HEX)</option>
              <option value="bin">二进制 (BIN)</option>
            </select>
          </div>
          
          <div class="tool-item">
            <label>批量操作</label>
            <div class="tool-buttons">
              <button @click="clearAllRegisters" class="btn btn-secondary" :disabled="readonly">
                清零所有
              </button>
              <button @click="randomizeRegisters" class="btn btn-secondary" :disabled="readonly">
                随机填充
              </button>
            </div>
          </div>
          
          <div class="tool-item">
            <label>快速设置</label>
            <div class="quick-set">
              <input 
                v-model="quickSetValue" 
                type="number" 
                placeholder="输入值"
                :disabled="readonly"
              />
              <select v-model="quickSetRegister" :disabled="readonly">
                <option value="">选择寄存器</option>
                <option v-for="reg in allRegisters" :key="reg.name" :value="reg.name">
                  {{ reg.name }}
                </option>
              </select>
              <button 
                @click="quickSetValue && quickSetRegister && updateRegisterValue(quickSetRegister, { target: { value: quickSetValue } })" 
                class="btn btn-primary"
                :disabled="readonly || !quickSetValue || !quickSetRegister"
              >
                设置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 寄存器状态历史 -->
      <div class="register-history" v-if="showHistory">
        <h4>状态历史</h4>
        <div class="history-list">
          <div v-for="(entry, index) in registerHistory" :key="index" class="history-entry">
            <div class="history-time">{{ entry.timestamp }}</div>
            <div class="history-change">
              <span class="register-name">{{ entry.register }}</span>:
              <span class="old-value">{{ entry.oldValue }}</span> →
              <span class="new-value">{{ entry.newValue }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { CPURegisters } from '../types/cpu'

interface Props {
  registers: CPURegisters
  readonly?: boolean
}

interface RegisterItem {
  name: string
  value: number
  description?: string
  readonly?: boolean
  highlighted?: boolean
}

interface HistoryEntry {
  timestamp: string
  register: string
  oldValue: string
  newValue: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updateRegister: [name: string, value: number]
}>()

// 响应式数据
const displayFormat = ref<'dec' | 'hex' | 'bin'>('dec')
const highlightedRegisters = ref<Set<string>>(new Set())
const quickSetValue = ref<number | null>(null)
const quickSetRegister = ref('')
const showHistory = ref(false)
const registerHistory = ref<HistoryEntry[]>([])

// 计算属性
const generalRegisters = computed<RegisterItem[]>(() => [
  { name: 'R0', value: props.registers.R0 },
  { name: 'R1', value: props.registers.R1 },
  { name: 'R2', value: props.registers.R2 },
  { name: 'R3', value: props.registers.R3 },
  { name: 'R4', value: props.registers.R4 },
  { name: 'R5', value: props.registers.R5 },
  { name: 'R6', value: props.registers.R6 },
  { name: 'R7', value: props.registers.R7 }
].map(reg => ({
  ...reg,
  highlighted: highlightedRegisters.value.has(reg.name)
})))

const specialRegisters = computed<RegisterItem[]>(() => [
  { 
    name: 'PC', 
    value: props.registers.PC, 
    description: '程序计数器',
    readonly: false
  },
  { 
    name: 'SP', 
    value: props.registers.SP, 
    description: '堆栈指针',
    readonly: false
  },
  { 
    name: 'IR', 
    value: props.registers.IR, 
    description: '指令寄存器',
    readonly: true
  },
  { 
    name: 'MAR', 
    value: props.registers.MAR, 
    description: '内存地址寄存器',
    readonly: true
  },
  { 
    name: 'MDR', 
    value: props.registers.MDR, 
    description: '内存数据寄存器',
    readonly: true
  },
  { 
    name: 'PSW', 
    value: props.registers.PSW, 
    description: '程序状态字',
    readonly: true
  }
].map(reg => ({
  ...reg,
  highlighted: highlightedRegisters.value.has(reg.name)
})))

const allRegisters = computed(() => [...generalRegisters.value, ...specialRegisters.value])

// 监听寄存器变化，记录历史
watch(() => props.registers, (newRegs, oldRegs) => {
  if (!oldRegs) return
  
  Object.keys(newRegs).forEach(regName => {
    const oldValue = oldRegs[regName as keyof CPURegisters]
    const newValue = newRegs[regName as keyof CPURegisters]
    
    if (oldValue !== newValue) {
      registerHistory.value.unshift({
        timestamp: new Date().toLocaleTimeString(),
        register: regName,
        oldValue: formatValue(oldValue),
        newValue: formatValue(newValue)
      })
      
      // 保持历史记录不超过50条
      if (registerHistory.value.length > 50) {
        registerHistory.value = registerHistory.value.slice(0, 50)
      }
    }
  })
}, { deep: true })

// 方法
function formatValue(value: number): string {
  switch (displayFormat.value) {
    case 'hex':
      return '0x' + value.toString(16).toUpperCase().padStart(8, '0')
    case 'bin':
      return '0b' + value.toString(2).padStart(32, '0')
    default:
      return value.toString()
  }
}

function toHex(value: number): string {
  return '0x' + value.toString(16).toUpperCase().padStart(8, '0')
}

function toBin(value: number): string {
  return value.toString(2).padStart(32, '0').replace(/(.{4})/g, '$1 ').trim()
}

function parseValue(input: string): number {
  let value: number
  
  if (input.startsWith('0x') || input.startsWith('0X')) {
    value = parseInt(input, 16)
  } else if (input.startsWith('0b') || input.startsWith('0B')) {
    value = parseInt(input.substring(2), 2)
  } else {
    value = parseInt(input)
  }
  
  return isNaN(value) ? 0 : value & 0xFFFFFFFF // 确保32位
}

function updateRegisterValue(regName: string, event: Event) {
  const target = event.target as HTMLInputElement
  const value = parseValue(target.value)
  emit('updateRegister', regName, value)
}

function highlightRegister(regName: string) {
  highlightedRegisters.value.add(regName)
}

function unhighlightRegister(regName: string) {
  highlightedRegisters.value.delete(regName)
}

function updateDisplayFormat() {
  // 触发重新渲染以更新显示格式
}

function clearAllRegisters() {
  generalRegisters.value.forEach(reg => {
    emit('updateRegister', reg.name, 0)
  })
  
  // 清除部分专用寄存器
  emit('updateRegister', 'PC', 0)
  emit('updateRegister', 'SP', 1000) // SP重置为默认值
}

function randomizeRegisters() {
  generalRegisters.value.forEach(reg => {
    const randomValue = Math.floor(Math.random() * 0x100000000) // 32位随机数
    emit('updateRegister', reg.name, randomValue)
  })
}
</script>

<style scoped>
.register-view {
  height: 100%;
  overflow-y: auto;
}

.register-container {
  padding: 0.5rem;
}

.register-section {
  margin-bottom: 1.5rem;
}

.register-section h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e9ecef;
}

.register-grid {
  display: grid;
  gap: 0.75rem;
}

.register-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 0.75rem;
  transition: all 0.3s ease;
}

.register-item:hover {
  border-color: #adb5bd;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.register-item.highlighted {
  border-color: #007bff;
  background: #e3f2fd;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.register-item.special {
  border-left: 4px solid #9c27b0;
}

.register-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.register-name {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.register-size,
.register-desc {
  font-size: 0.75rem;
  color: #6c757d;
}

.register-value {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.value-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  transition: border-color 0.3s ease;
}

.value-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.value-input.readonly {
  background: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.value-formats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.format-label {
  font-weight: 500;
  color: #495057;
}

.format-value {
  font-family: 'Courier New', monospace;
  color: #6c757d;
  background: #f8f9fa;
  padding: 0.125rem 0.25rem;
  border-radius: 2px;
}

.status-flags {
  display: flex;
  gap: 0.25rem;
  margin-left: auto;
}

.flag {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: #e9ecef;
  color: #6c757d;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
}

.flag.active {
  background: #28a745;
  color: white;
}

.register-tools {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.register-tools h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.tools-grid {
  display: grid;
  gap: 1rem;
}

.tool-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tool-item label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.tool-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-set {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-set input,
.quick-set select {
  flex: 1;
  min-width: 80px;
}

.register-history {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.register-history h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.history-entry {
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
  border-left: 3px solid #007bff;
}

.history-time {
  font-size: 0.75rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.history-change {
  font-size: 0.85rem;
  font-family: 'Courier New', monospace;
}

.old-value {
  color: #dc3545;
  text-decoration: line-through;
}

.new-value {
  color: #28a745;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .register-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
  
  .value-formats {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .quick-set {
    flex-direction: column;
  }
  
  .tool-buttons {
    flex-direction: column;
  }
}
</style>
