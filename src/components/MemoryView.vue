<template>
  <div class="memory-view">
    <div class="memory-container">
      <!-- 内存控制面板 -->
      <div class="memory-controls">
        <h4>内存控制</h4>
        <div class="controls-grid">
          <div class="control-item">
            <label>起始地址</label>
            <input 
              v-model="startAddress" 
              type="number" 
              min="0" 
              step="4"
              @change="updateMemoryView"
            />
          </div>
          
          <div class="control-item">
            <label>显示行数</label>
            <select v-model="displayRows" @change="updateMemoryView">
              <option value="8">8行</option>
              <option value="16">16行</option>
              <option value="32">32行</option>
              <option value="64">64行</option>
            </select>
          </div>
          
          <div class="control-item">
            <label>显示格式</label>
            <select v-model="displayFormat">
              <option value="hex">十六进制</option>
              <option value="dec">十进制</option>
              <option value="bin">二进制</option>
            </select>
          </div>
          
          <div class="control-item">
            <label>字节序</label>
            <select v-model="endianness">
              <option value="little">小端序</option>
              <option value="big">大端序</option>
            </select>
          </div>
        </div>
        
        <div class="memory-actions">
          <button @click="loadMemoryFromFile" class="btn btn-secondary" :disabled="readonly">
            加载文件
          </button>
          <button @click="clearMemory" class="btn btn-secondary" :disabled="readonly">
            清空内存
          </button>
          <button @click="fillMemory" class="btn btn-secondary" :disabled="readonly">
            填充内存
          </button>
          <button @click="exportMemory" class="btn btn-secondary">
            导出内存
          </button>
        </div>
      </div>

      <!-- 快速跳转 -->
      <div class="quick-navigation">
        <h4>快速跳转</h4>
        <div class="nav-buttons">
          <button 
            v-for="addr in quickAddresses" 
            :key="addr.name"
            @click="jumpToAddress(addr.address)"
            class="nav-btn"
            :class="{ active: isAddressVisible(addr.address) }"
          >
            {{ addr.name }}
            <span class="addr-value">{{ formatAddress(addr.address) }}</span>
          </button>
        </div>
      </div>

      <!-- 内存表格 -->
      <div class="memory-table-container">
        <table class="memory-table">
          <thead>
            <tr>
              <th class="addr-header">地址</th>
              <th v-for="offset in 4" :key="offset" class="data-header">
                +{{ (offset - 1) * 4 }}
              </th>
              <th class="ascii-header">ASCII</th>
            </tr>
          </thead>
          <tbody>
            <tr 
              v-for="row in memoryRows" 
              :key="row.address"
              class="memory-row"
              :class="{ highlighted: isRowHighlighted(row.address) }"
            >
              <td class="address-cell">
                {{ formatAddress(row.address) }}
              </td>
              <td 
                v-for="(cell, index) in row.cells" 
                :key="index"
                class="data-cell"
                :class="{
                  highlighted: highlightedAddresses.includes(row.address + index * 4),
                  modified: isAddressModified(row.address + index * 4)
                }"
                @click="selectCell(row.address + index * 4)"
              >
                <input 
                  v-if="selectedAddress === row.address + index * 4"
                  v-model="editValue"
                  @blur="finishEdit"
                  @keyup.enter="finishEdit"
                  @keyup.escape="cancelEdit"
                  class="cell-input"
                  :readonly="readonly"
                  ref="cellInput"
                />
                <span v-else class="cell-value">
                  {{ formatValue(cell.value) }}
                </span>
              </td>
              <td class="ascii-cell">
                {{ getAsciiRepresentation(row.cells) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 内存统计 -->
      <div class="memory-stats">
        <h4>内存统计</h4>
        <div class="stats-grid">
          <div class="stat-item">
            <span class="stat-label">已使用地址:</span>
            <span class="stat-value">{{ usedAddressCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">非零值:</span>
            <span class="stat-value">{{ nonZeroCount }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">最后访问:</span>
            <span class="stat-value">{{ lastAccessedAddress ? formatAddress(lastAccessedAddress) : 'N/A' }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">内存使用率:</span>
            <span class="stat-value">{{ memoryUsagePercentage }}%</span>
          </div>
        </div>
      </div>

      <!-- 搜索功能 -->
      <div class="memory-search">
        <h4>内存搜索</h4>
        <div class="search-controls">
          <input 
            v-model="searchValue" 
            type="text" 
            placeholder="搜索值..."
            @keyup.enter="performSearch"
          />
          <select v-model="searchType">
            <option value="exact">精确匹配</option>
            <option value="pattern">模式匹配</option>
            <option value="range">范围搜索</option>
          </select>
          <button @click="performSearch" class="btn btn-primary">
            搜索
          </button>
        </div>
        
        <div v-if="searchResults.length > 0" class="search-results">
          <h5>搜索结果 ({{ searchResults.length }}个)</h5>
          <div class="result-list">
            <div 
              v-for="result in searchResults.slice(0, 10)" 
              :key="result.address"
              class="result-item"
              @click="jumpToAddress(result.address)"
            >
              <span class="result-address">{{ formatAddress(result.address) }}</span>
              <span class="result-value">{{ formatValue(result.value) }}</span>
            </div>
            <div v-if="searchResults.length > 10" class="more-results">
              还有 {{ searchResults.length - 10 }} 个结果...
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import type { Memory } from '../types/cpu'

interface Props {
  memory: Memory
  readonly?: boolean
  highlightedAddresses?: number[]
}

interface MemoryCell {
  address: number
  value: number
}

interface MemoryRow {
  address: number
  cells: MemoryCell[]
}

interface SearchResult {
  address: number
  value: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  updateMemory: [address: number, value: number]
}>()

// 响应式数据
const startAddress = ref(0)
const displayRows = ref(16)
const displayFormat = ref<'hex' | 'dec' | 'bin'>('hex')
const endianness = ref<'little' | 'big'>('little')
const selectedAddress = ref<number | null>(null)
const editValue = ref('')
const lastAccessedAddress = ref<number | null>(null)
const modifiedAddresses = ref<Set<number>>(new Set())
const searchValue = ref('')
const searchType = ref<'exact' | 'pattern' | 'range'>('exact')
const searchResults = ref<SearchResult[]>([])

// 快速跳转地址
const quickAddresses = ref([
  { name: '程序起始', address: 0 },
  { name: '堆栈区', address: 1000 },
  { name: '数据区', address: 2000 },
  { name: '代码区', address: 4000 }
])

// 计算属性
const memoryRows = computed<MemoryRow[]>(() => {
  const rows: MemoryRow[] = []
  
  for (let i = 0; i < displayRows.value; i++) {
    const rowAddress = startAddress.value + i * 16 // 每行16字节，4个32位字
    const cells: MemoryCell[] = []
    
    for (let j = 0; j < 4; j++) {
      const cellAddress = rowAddress + j * 4
      const value = props.memory[cellAddress] || 0
      cells.push({ address: cellAddress, value })
    }
    
    rows.push({ address: rowAddress, cells })
  }
  
  return rows
})

const usedAddressCount = computed(() => {
  return Object.keys(props.memory).length
})

const nonZeroCount = computed(() => {
  return Object.values(props.memory).filter(value => value !== 0).length
})

const memoryUsagePercentage = computed(() => {
  const totalSlots = displayRows.value * 4
  const usedSlots = memoryRows.value.reduce((count, row) => {
    return count + row.cells.filter(cell => cell.value !== 0).length
  }, 0)
  return totalSlots > 0 ? Math.round((usedSlots / totalSlots) * 100) : 0
})

// 监听器
watch(() => props.memory, () => {
  // 记录最后访问的地址
  const addresses = Object.keys(props.memory).map(Number)
  if (addresses.length > 0) {
    lastAccessedAddress.value = Math.max(...addresses)
  }
}, { deep: true })

// 方法
function formatAddress(address: number): string {
  return '0x' + address.toString(16).toUpperCase().padStart(8, '0')
}

function formatValue(value: number): string {
  switch (displayFormat.value) {
    case 'dec':
      return value.toString()
    case 'bin':
      return '0b' + value.toString(2).padStart(32, '0')
    default:
      return '0x' + value.toString(16).toUpperCase().padStart(8, '0')
  }
}

function getAsciiRepresentation(cells: MemoryCell[]): string {
  return cells.map(cell => {
    const bytes = []
    for (let i = 0; i < 4; i++) {
      const byte = (cell.value >> (i * 8)) & 0xFF
      bytes.push(byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '.')
    }
    return endianness.value === 'little' ? bytes.join('') : bytes.reverse().join('')
  }).join('')
}

function isRowHighlighted(address: number): boolean {
  if (!props.highlightedAddresses) return false
  return props.highlightedAddresses.some(addr => 
    addr >= address && addr < address + 16
  )
}

function isAddressModified(address: number): boolean {
  return modifiedAddresses.value.has(address)
}

function isAddressVisible(address: number): boolean {
  const endAddress = startAddress.value + displayRows.value * 16
  return address >= startAddress.value && address < endAddress
}

function selectCell(address: number) {
  if (props.readonly) return
  
  selectedAddress.value = address
  editValue.value = formatValue(props.memory[address] || 0)
  
  nextTick(() => {
    const input = document.querySelector('.cell-input') as HTMLInputElement
    if (input) {
      input.focus()
      input.select()
    }
  })
}

function finishEdit() {
  if (selectedAddress.value === null) return
  
  const value = parseValue(editValue.value)
  emit('updateMemory', selectedAddress.value, value)
  modifiedAddresses.value.add(selectedAddress.value)
  selectedAddress.value = null
}

function cancelEdit() {
  selectedAddress.value = null
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
  
  return isNaN(value) ? 0 : value & 0xFFFFFFFF
}

function updateMemoryView() {
  // 确保起始地址对齐到16字节边界
  startAddress.value = Math.floor(startAddress.value / 16) * 16
}

function jumpToAddress(address: number) {
  startAddress.value = Math.floor(address / 16) * 16
  
  // 高亮显示目标地址
  const tempHighlight = [...(props.highlightedAddresses || [])]
  if (!tempHighlight.includes(address)) {
    tempHighlight.push(address)
  }
}

function clearMemory() {
  if (props.readonly) return
  
  const addressesToClear = []
  for (let i = 0; i < displayRows.value; i++) {
    for (let j = 0; j < 4; j++) {
      const address = startAddress.value + i * 16 + j * 4
      if (props.memory[address] !== undefined) {
        addressesToClear.push(address)
      }
    }
  }
  
  addressesToClear.forEach(address => {
    emit('updateMemory', address, 0)
  })
}

function fillMemory() {
  if (props.readonly) return
  
  const pattern = prompt('请输入填充模式 (hex值，如: 0xFF):')
  if (!pattern) return
  
  const value = parseValue(pattern)
  
  for (let i = 0; i < displayRows.value; i++) {
    for (let j = 0; j < 4; j++) {
      const address = startAddress.value + i * 16 + j * 4
      emit('updateMemory', address, value)
    }
  }
}

function loadMemoryFromFile() {
  // 创建文件输入元素
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.bin,.hex,.txt'
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      // 这里可以实现不同格式的解析逻辑
      console.log('加载文件内容:', content)
    }
    reader.readAsText(file)
  }
  
  input.click()
}

function exportMemory() {
  const memoryData = Object.entries(props.memory)
    .map(([addr, value]) => `${formatAddress(parseInt(addr))}: ${formatValue(value)}`)
    .join('\n')
  
  const blob = new Blob([memoryData], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = 'memory_dump.txt'
  link.click()
  
  URL.revokeObjectURL(url)
}

function performSearch() {
  if (!searchValue.value.trim()) return
  
  searchResults.value = []
  const searchVal = parseValue(searchValue.value)
  
  Object.entries(props.memory).forEach(([addr, value]) => {
    const address = parseInt(addr)
    let match = false
    
    switch (searchType.value) {
      case 'exact':
        match = value === searchVal
        break
      case 'pattern':
        match = value.toString(16).includes(searchVal.toString(16))
        break
      case 'range':
        // 简单范围搜索：值在搜索值±10%范围内
        const range = Math.abs(searchVal * 0.1)
        match = Math.abs(value - searchVal) <= range
        break
    }
    
    if (match) {
      searchResults.value.push({ address, value })
    }
  })
  
  // 按地址排序
  searchResults.value.sort((a, b) => a.address - b.address)
}
</script>

<style scoped>
.memory-view {
  height: 100%;
  overflow-y: auto;
}

.memory-container {
  padding: 0.5rem;
}

.memory-controls,
.quick-navigation,
.memory-stats,
.memory-search {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.memory-controls h4,
.quick-navigation h4,
.memory-stats h4,
.memory-search h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-item label {
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.memory-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.nav-btn:hover {
  border-color: #007bff;
  background: #e3f2fd;
}

.nav-btn.active {
  border-color: #007bff;
  background: #007bff;
  color: white;
}

.addr-value {
  font-size: 0.75rem;
  font-family: 'Courier New', monospace;
}

.memory-table-container {
  background: white;
  border-radius: 8px;
  overflow: auto;
  margin-bottom: 1rem;
  border: 1px solid #dee2e6;
}

.memory-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.memory-table th {
  background: #f8f9fa;
  padding: 0.75rem 0.5rem;
  text-align: center;
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
  color: #495057;
}

.addr-header {
  min-width: 100px;
  background: #e9ecef;
}

.data-header {
  min-width: 80px;
}

.ascii-header {
  min-width: 120px;
}

.memory-row:nth-child(even) {
  background: #f8f9fa;
}

.memory-row.highlighted {
  background: #fff3cd;
}

.memory-row:hover {
  background: #e3f2fd;
}

.address-cell {
  padding: 0.5rem;
  font-weight: 600;
  background: #f8f9fa;
  border-right: 1px solid #dee2e6;
  text-align: center;
}

.data-cell {
  padding: 0.5rem;
  text-align: center;
  border-right: 1px solid #dee2e6;
  cursor: pointer;
  position: relative;
}

.data-cell.highlighted {
  background: #ffc107;
  font-weight: 600;
}

.data-cell.modified {
  background: #d4edda;
  border-color: #28a745;
}

.cell-input {
  width: 100%;
  border: none;
  background: #fff;
  text-align: center;
  font-family: inherit;
  font-size: inherit;
  padding: 0.25rem;
  border-radius: 2px;
}

.cell-input:focus {
  outline: 2px solid #007bff;
}

.cell-value {
  display: block;
  padding: 0.25rem;
}

.ascii-cell {
  padding: 0.5rem;
  font-family: 'Courier New', monospace;
  background: #f8f9fa;
  color: #6c757d;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-weight: 500;
  color: #495057;
}

.stat-value {
  font-weight: 600;
  color: #2c3e50;
  font-family: 'Courier New', monospace;
}

.search-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.search-controls input {
  flex: 1;
  min-width: 120px;
}

.search-results {
  margin-top: 1rem;
}

.search-results h5 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.result-list {
  max-height: 150px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  background: white;
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem;
  border-bottom: 1px solid #f8f9fa;
  cursor: pointer;
  transition: background 0.3s ease;
}

.result-item:hover {
  background: #e3f2fd;
}

.result-address {
  font-weight: 600;
  color: #007bff;
}

.result-value {
  color: #6c757d;
}

.more-results {
  padding: 0.5rem;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .memory-actions,
  .nav-buttons {
    flex-direction: column;
  }
  
  .memory-table {
    font-size: 0.75rem;
  }
  
  .search-controls {
    flex-direction: column;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
