<template>
  <div class="cpu-architecture">
    <svg viewBox="0 0 800 600" class="cpu-diagram">
      <!-- CPU外框 -->
      <rect x="50" y="50" width="700" height="500" 
            fill="none" stroke="#333" stroke-width="2" 
            class="cpu-border" />
      
      <!-- 控制单元 -->
      <g class="control-unit" :class="{ active: components.controlUnit.isActive }">
        <rect x="70" y="70" width="120" height="80" 
              fill="#e3f2fd" stroke="#2196f3" stroke-width="2" />
        <text x="130" y="95" text-anchor="middle" class="component-label">控制单元</text>
        <text x="130" y="110" text-anchor="middle" class="component-label">Control Unit</text>
        <text v-if="components.controlUnit.operation" 
              x="130" y="130" text-anchor="middle" 
              class="operation-text">{{ components.controlUnit.operation }}</text>
      </g>

      <!-- ALU算术逻辑单元 -->
      <g class="alu" :class="{ active: components.alu.isActive }">
        <rect x="220" y="200" width="120" height="100" 
              fill="#fff3e0" stroke="#ff9800" stroke-width="2" />
        <text x="280" y="225" text-anchor="middle" class="component-label">ALU</text>
        <text x="280" y="240" text-anchor="middle" class="component-label">算术逻辑单元</text>
        <text v-if="components.alu.operation" 
              x="280" y="270" text-anchor="middle" 
              class="operation-text">{{ components.alu.operation }}</text>
      </g>

      <!-- 寄存器组 -->
      <g class="register-file" :class="{ active: components.registerFile.isActive }">
        <rect x="370" y="70" width="120" height="120" 
              fill="#f3e5f5" stroke="#9c27b0" stroke-width="2" />
        <text x="430" y="95" text-anchor="middle" class="component-label">寄存器组</text>
        <text x="430" y="110" text-anchor="middle" class="component-label">Registers</text>
        
        <!-- 显示部分寄存器 -->
        <text x="380" y="130" class="register-text">R0-R7</text>
        <text x="380" y="145" class="register-text">PC, SP</text>
        <text x="380" y="160" class="register-text">IR, MAR</text>
        <text x="380" y="175" class="register-text">MDR, PSW</text>
        
        <text v-if="components.registerFile.operation" 
              x="430" y="195" text-anchor="middle" 
              class="operation-text">{{ components.registerFile.operation }}</text>
      </g>

      <!-- 内存单元 -->
      <g class="memory-unit" :class="{ active: components.memoryUnit.isActive }">
        <rect x="520" y="200" width="120" height="150" 
              fill="#e8f5e8" stroke="#4caf50" stroke-width="2" />
        <text x="580" y="225" text-anchor="middle" class="component-label">内存</text>
        <text x="580" y="240" text-anchor="middle" class="component-label">Memory</text>
        
        <!-- 内存示意图 -->
        <g class="memory-blocks">
          <rect x="540" y="250" width="80" height="8" fill="#c8e6c9" stroke="#4caf50" />
          <rect x="540" y="260" width="80" height="8" fill="#c8e6c9" stroke="#4caf50" />
          <rect x="540" y="270" width="80" height="8" fill="#c8e6c9" stroke="#4caf50" />
          <rect x="540" y="280" width="80" height="8" fill="#c8e6c9" stroke="#4caf50" />
          <text x="580" y="300" text-anchor="middle" class="small-text">...</text>
        </g>
        
        <text v-if="components.memoryUnit.operation" 
              x="580" y="330" text-anchor="middle" 
              class="operation-text">{{ components.memoryUnit.operation }}</text>
      </g>

      <!-- 数据总线 -->
      <g class="data-bus" :class="{ active: components.bus.isActive }">
        <!-- 主数据总线 -->
        <line x1="100" y1="400" x2="650" y2="400" 
              stroke="#666" stroke-width="4" class="bus-line" />
        <text x="375" y="420" text-anchor="middle" class="bus-label">数据总线 (Data Bus)</text>
        
        <!-- 地址总线 -->
        <line x1="100" y1="430" x2="650" y2="430" 
              stroke="#999" stroke-width="3" class="bus-line" />
        <text x="375" y="450" text-anchor="middle" class="bus-label">地址总线 (Address Bus)</text>
        
        <!-- 控制总线 -->
        <line x1="100" y1="460" x2="650" y2="460" 
              stroke="#ccc" stroke-width="2" class="bus-line" />
        <text x="375" y="480" text-anchor="middle" class="bus-label">控制总线 (Control Bus)</text>
      </g>

      <!-- 连接线 -->
      <g class="connections">
        <!-- 控制单元到ALU -->
        <line x1="190" y1="110" x2="220" y2="220" 
              stroke="#666" stroke-width="2" stroke-dasharray="5,5" />
        
        <!-- 控制单元到寄存器组 -->
        <line x1="190" y1="110" x2="370" y2="130" 
              stroke="#666" stroke-width="2" stroke-dasharray="5,5" />
        
        <!-- 控制单元到内存 -->
        <line x1="190" y1="110" x2="520" y2="275" 
              stroke="#666" stroke-width="2" stroke-dasharray="5,5" />
        
        <!-- ALU到寄存器组 -->
        <line x1="340" y1="220" x2="370" y2="160" 
              stroke="#666" stroke-width="2" />
        
        <!-- 寄存器组到内存 -->
        <line x1="490" y1="130" x2="520" y2="250" 
              stroke="#666" stroke-width="2" />
        
        <!-- 组件到总线的连接 -->
        <line x1="130" y1="150" x2="130" y2="400" 
              stroke="#666" stroke-width="2" />
        <line x1="280" y1="300" x2="280" y2="400" 
              stroke="#666" stroke-width="2" />
        <line x1="430" y1="190" x2="430" y2="400" 
              stroke="#666" stroke-width="2" />
        <line x1="580" y1="350" x2="580" y2="400" 
              stroke="#666" stroke-width="2" />
      </g>

      <!-- 数据流动动画 -->
      <g class="data-flows">
        <g v-for="flow in dataFlows" :key="flow.from + flow.to" class="data-flow">
          <circle :cx="getFlowPosition(flow).x" :cy="getFlowPosition(flow).y" 
                  r="8" :fill="getFlowColor(flow)" class="flow-indicator">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="1s" repeatCount="indefinite" />
          </circle>
          <text :x="getFlowPosition(flow).x" :y="getFlowPosition(flow).y + 25" 
                text-anchor="middle" class="flow-label">{{ flow.label }}</text>
        </g>
      </g>

      <!-- 控制信号指示器 -->
      <g class="control-signals">
        <g class="signal-indicators">
          <text x="70" y="520" class="signal-title">控制信号:</text>
          
          <g v-for="(signal, index) in activeSignals" :key="signal.name" 
             :transform="`translate(${150 + index * 100}, 520)`">
            <circle cx="0" cy="-5" r="5" :fill="signal.active ? '#4caf50' : '#ccc'" />
            <text x="10" y="0" class="signal-text">{{ signal.name }}</text>
          </g>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CPUState, ControlSignals, DataFlow } from '../types/cpu'

interface Props {
  cpuState: CPUState
  controlSignals: ControlSignals
  dataFlows: DataFlow[]
}

const props = defineProps<Props>()

// 组件状态
const components = computed(() => props.cpuState.components)

// 活跃的控制信号
const activeSignals = computed(() => [
  { name: 'MemRead', active: props.controlSignals.memRead },
  { name: 'MemWrite', active: props.controlSignals.memWrite },
  { name: 'RegWrite', active: props.controlSignals.regWrite },
  { name: 'ALUOp', active: props.controlSignals.aluOp !== 'NOP' },
  { name: 'Jump', active: props.controlSignals.jump },
  { name: 'Branch', active: props.controlSignals.branch }
])

// 获取数据流位置
function getFlowPosition(flow: DataFlow): { x: number; y: number } {
  const positions: { [key: string]: { x: number; y: number } } = {
    'controlUnit': { x: 130, y: 110 },
    'alu': { x: 280, y: 250 },
    'registerFile': { x: 430, y: 130 },
    'memoryUnit': { x: 580, y: 275 },
    'bus': { x: 375, y: 400 }
  }
  
  return positions[flow.to] || positions[flow.from] || { x: 400, y: 300 }
}

// 获取数据流颜色
function getFlowColor(flow: DataFlow): string {
  const colors: { [key: string]: string } = {
    'instruction': '#2196f3',
    'data': '#4caf50',
    'address': '#ff9800',
    'control': '#9c27b0'
  }
  
  return colors[flow.label.toLowerCase()] || '#666'
}
</script>

<style scoped>
.cpu-architecture {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.cpu-diagram {
  width: 100%;
  height: 100%;
  background: #fafafa;
  border-radius: 8px;
}

.cpu-border {
  filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.1));
}

.component-label {
  font-size: 14px;
  font-weight: 600;
  fill: #333;
}

.operation-text {
  font-size: 11px;
  font-weight: 500;
  fill: #666;
}

.register-text {
  font-size: 10px;
  fill: #666;
}

.small-text {
  font-size: 12px;
  fill: #999;
}

.bus-label {
  font-size: 12px;
  fill: #666;
  font-weight: 500;
}

.signal-title {
  font-size: 14px;
  font-weight: 600;
  fill: #333;
}

.signal-text {
  font-size: 11px;
  fill: #666;
}

.flow-label {
  font-size: 10px;
  fill: #333;
  font-weight: 500;
}

/* 组件激活状态 */
.control-unit.active rect {
  fill: #bbdefb;
  stroke: #1976d2;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(25, 118, 210, 0.3));
}

.alu.active rect {
  fill: #ffe0b2;
  stroke: #f57c00;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(245, 124, 0, 0.3));
}

.register-file.active rect {
  fill: #e1bee7;
  stroke: #7b1fa2;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(123, 31, 162, 0.3));
}

.memory-unit.active rect {
  fill: #c8e6c9;
  stroke: #388e3c;
  stroke-width: 3;
  filter: drop-shadow(0 0 8px rgba(56, 142, 60, 0.3));
}

.data-bus.active .bus-line {
  stroke: #2196f3;
  stroke-width: 6;
  filter: drop-shadow(0 0 6px rgba(33, 150, 243, 0.4));
}

/* 数据流动画效果 */
.flow-indicator {
  filter: drop-shadow(0 0 4px rgba(0,0,0,0.3));
}

/* 连接线样式 */
.connections line {
  opacity: 0.6;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .component-label {
    font-size: 12px;
  }
  
  .operation-text {
    font-size: 9px;
  }
  
  .bus-label {
    font-size: 10px;
  }
}
</style>
