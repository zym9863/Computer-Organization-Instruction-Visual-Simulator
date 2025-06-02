<template>
  <div class="cpu-simulator">
    <!-- 控制面板 -->
    <div class="control-panel card-modern">
      <h2>指令控制台</h2>
      
      <!-- 指令输入区域 -->
      <div class="instruction-input">
        <div class="input-group">
          <label>输入汇编指令</label>
          <div class="input-with-button">
            <input 
              v-model="currentInstruction" 
              type="text" 
              placeholder="例如: ADD R0, R1, R2"
              @keyup.enter="executeCurrentInstruction"
              :disabled="cpuState.execution.isRunning"
            />
            <button 
              @click="executeCurrentInstruction" 
              class="btn btn-primary"
              :disabled="!currentInstruction.trim() || cpuState.execution.isRunning"
            >
              <Play class="icon" />
              执行
            </button>
          </div>
          <div v-if="instructionError" class="error-message">
            {{ instructionError }}
          </div>
        </div>

        <!-- 预设指令示例 -->
        <div class="preset-instructions">
          <label>预设指令示例</label>
          <select v-model="selectedPreset" @change="loadPresetInstructions">
            <option value="">选择预设示例...</option>
            <option v-for="preset in presetInstructions" :key="preset.name" :value="preset.name">
              {{ preset.name }} - {{ preset.description }}
            </option>
          </select>
          
          <div v-if="selectedPresetInstructions.length > 0" class="preset-list">
            <h4>指令列表：</h4>
            <div class="instruction-list">
              <div 
                v-for="(instruction, index) in selectedPresetInstructions" 
                :key="index"
                class="instruction-item"
                :class="{ active: currentPresetIndex === index }"
              >
                <span class="instruction-text">{{ formatInstruction(instruction) }}</span>
                <button 
                  @click="executePresetInstruction(index)" 
                  class="btn btn-secondary"
                  :disabled="cpuState.execution.isRunning"
                >
                  执行
                </button>
              </div>
            </div>
            
            <div class="preset-controls">
              <button 
                @click="executeAllPreset" 
                class="btn btn-success"
                :disabled="cpuState.execution.isRunning"
              >
                <PlayCircle class="icon" />
                执行全部
              </button>
              <button 
                @click="stepThroughPreset" 
                class="btn btn-warning"
                :disabled="cpuState.execution.isRunning"
              >
                <SkipForward class="icon" />
                单步执行
              </button>
              <button 
                @click="resetSimulator" 
                class="btn btn-secondary"
              >
                <RotateCcw class="icon" />
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 执行控制 -->
      <div class="execution-controls">
        <div class="execution-status">
          <h3>执行状态</h3>
          <div class="status-info">
            <div class="status-item">
              <span class="label">当前阶段：</span>
              <span class="value" :class="stepClass">{{ getStepName(cpuState.execution.currentStep) }}</span>
            </div>
            <div class="status-item">
              <span class="label">进度：</span>
              <span class="value">{{ cpuState.execution.stepIndex }}/{{ cpuState.execution.totalSteps }}</span>
            </div>
            <div class="status-item">
              <span class="label">状态：</span>
              <span class="value" :class="{ running: cpuState.execution.isRunning }">
                {{ cpuState.execution.isRunning ? '运行中' : '等待' }}
              </span>
            </div>
          </div>
          <div class="message">{{ cpuState.execution.message }}</div>
        </div>

        <!-- 动画速度控制 -->
        <div class="speed-control">
          <label>动画速度</label>
          <input 
            type="range" 
            min="100" 
            max="3000" 
            step="100"
            v-model="animationSpeed"
            @input="updateAnimationSpeed"
          />
          <span>{{ animationSpeed }}ms</span>
        </div>
      </div>
    </div>

    <!-- CPU可视化区域 -->
    <div class="cpu-visualization">
      <!-- CPU架构图 -->
      <div class="cpu-architecture card-modern">
        <h2>CPU架构</h2>
        <CPUArchitecture 
          :cpuState="cpuState" 
          :controlSignals="controlSignals"
          :dataFlows="activeDataFlows"
        />
      </div>

      <!-- 执行步骤可视化 -->
      <div class="execution-steps card-modern">
        <h2>指令执行流水线</h2>
        <ExecutionPipeline :currentStep="cpuState.execution.currentStep" />
      </div>
    </div>

    <!-- 状态监控区域 -->
    <div class="state-monitoring">
      <!-- 寄存器状态 -->
      <div class="registers-panel card-modern">
        <h2>寄存器状态</h2>
        <RegisterView 
          :registers="cpuState.registers" 
          @updateRegister="updateRegister"
          :readonly="cpuState.execution.isRunning"
        />
      </div>

      <!-- 内存状态 -->
      <div class="memory-panel card-modern">
        <h2>内存状态</h2>
        <MemoryView 
          :memory="cpuState.memory" 
          @updateMemory="updateMemory"
          :readonly="cpuState.execution.isRunning"
          :highlightedAddresses="highlightedMemoryAddresses"
        />
      </div>

      <!-- 控制信号 -->
      <div class="control-signals-panel card-modern">
        <h2>控制信号</h2>
        <ControlSignalsView :signals="controlSignals" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { Play, PlayCircle, SkipForward, RotateCcw } from 'lucide-vue-next'
import { CPUSimulator } from '../utils/cpuSimulator'
import { InstructionParser } from '../utils/instructionParser'
import type { CPUState, Instruction, DataFlow, ControlSignals } from '../types/cpu'
import CPUArchitecture from './CPUArchitecture.vue'
import ExecutionPipeline from './ExecutionPipeline.vue'
import RegisterView from './RegisterView.vue'
import MemoryView from './MemoryView.vue'
import ControlSignalsView from './ControlSignalsView.vue'

// 响应式数据
const simulator = new CPUSimulator()
const currentInstruction = ref('')
const instructionError = ref('')
const selectedPreset = ref('')
const selectedPresetInstructions = ref<Instruction[]>([])
const currentPresetIndex = ref(-1)
const animationSpeed = ref(1000)
const activeDataFlows = ref<DataFlow[]>([])
const highlightedMemoryAddresses = ref<number[]>([])

// CPU状态
const cpuState = reactive<CPUState>(simulator.getState())
const controlSignals = reactive<ControlSignals>(simulator.getControlSignals())

// 预设指令
const presetInstructions = InstructionParser.getPresetInstructions()

// 计算属性
const stepClass = computed(() => {
  const step = cpuState.execution.currentStep
  return {
    'step-fetch': step === 'fetch',
    'step-decode': step === 'decode', 
    'step-execute': step === 'execute',
    'step-memory': step === 'memory',
    'step-writeback': step === 'writeback'
  }
})

// 生命周期
onMounted(() => {
  updateState()
})

// 监听器
watch(() => cpuState.execution.isRunning, (isRunning) => {
  if (!isRunning) {
    updateState()
  }
})

// 方法
function updateState() {
  Object.assign(cpuState, simulator.getState())
  Object.assign(controlSignals, simulator.getControlSignals())
}

function updateAnimationSpeed() {
  cpuState.execution.animationSpeed = animationSpeed.value
}

async function executeCurrentInstruction() {
  if (!currentInstruction.value.trim()) return
  
  try {
    instructionError.value = ''
    const instruction = InstructionParser.parseInstruction(currentInstruction.value)
    await executeInstruction(instruction)
    currentInstruction.value = ''
  } catch (error) {
    instructionError.value = error instanceof Error ? error.message : '执行错误'
  }
}

async function executeInstruction(instruction: Instruction) {
  try {
    await simulator.executeInstruction(instruction)
    updateState()
  } catch (error) {
    instructionError.value = error instanceof Error ? error.message : '执行错误'
  }
}

function loadPresetInstructions() {
  const preset = presetInstructions.find(p => p.name === selectedPreset.value)
  if (preset) {
    selectedPresetInstructions.value = preset.instructions
    currentPresetIndex.value = -1
  }
}

async function executePresetInstruction(index: number) {
  if (index >= 0 && index < selectedPresetInstructions.value.length) {
    currentPresetIndex.value = index
    await executeInstruction(selectedPresetInstructions.value[index])
  }
}

async function executeAllPreset() {
  for (let i = 0; i < selectedPresetInstructions.value.length; i++) {
    currentPresetIndex.value = i
    await executeInstruction(selectedPresetInstructions.value[i])
    await new Promise(resolve => setTimeout(resolve, 500)) // 短暂延迟
  }
  currentPresetIndex.value = -1
}

async function stepThroughPreset() {
  if (currentPresetIndex.value < selectedPresetInstructions.value.length - 1) {
    currentPresetIndex.value++
    await executeInstruction(selectedPresetInstructions.value[currentPresetIndex.value])
  }
}

function resetSimulator() {
  simulator.reset()
  updateState()
  currentPresetIndex.value = -1
  instructionError.value = ''
  activeDataFlows.value = []
  highlightedMemoryAddresses.value = []
}

function updateRegister(name: string, value: number) {
  simulator.setRegister(name as any, value)
  updateState()
}

function updateMemory(address: number, value: number) {
  simulator.setMemory(address, value)
  updateState()
}

function formatInstruction(instruction: Instruction): string {
  return InstructionParser.formatInstruction(instruction)
}

function getStepName(step: string): string {
  const stepNames: { [key: string]: string } = {
    'fetch': '取指',
    'decode': '译码',
    'execute': '执行',
    'memory': '访存',
    'writeback': '写回'
  }
  return stepNames[step] || step
}
</script>

<style scoped>
.cpu-simulator {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: auto 1fr;
  gap: 1.5rem;
  height: 100vh;
  padding: 1rem;
}

.control-panel {
  grid-column: 1;
  grid-row: 1 / -1;
  overflow-y: auto;
}

.cpu-visualization {
  grid-column: 2;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.state-monitoring {
  grid-column: 3;
  grid-row: 1 / -1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
}

.cpu-architecture {
  flex: 2;
}

.execution-steps {
  flex: 1;
}

.instruction-input {
  margin-bottom: 2rem;
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
}

.input-with-button input {
  flex: 1;
}

.error-message {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

.preset-list {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  background: #f8f9fa;
}

.instruction-list {
  max-height: 200px;
  overflow-y: auto;
  margin: 1rem 0;
}

.instruction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: white;
  border: 1px solid #dee2e6;
  transition: all 0.3s ease;
}

.instruction-item.active {
  background: #e3f2fd;
  border-color: #2196f3;
}

.instruction-item:hover {
  background: #f0f0f0;
}

.instruction-text {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.preset-controls {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.execution-controls {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.execution-status {
  margin-bottom: 1rem;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 1rem 0;
}

.status-item {
  display: flex;
  justify-content: space-between;
}

.label {
  font-weight: 500;
  color: #6c757d;
}

.value {
  font-weight: 600;
}

.value.running {
  color: #28a745;
}

.step-fetch { color: #007bff; }
.step-decode { color: #6610f2; }
.step-execute { color: #fd7e14; }
.step-memory { color: #20c997; }
.step-writeback { color: #dc3545; }

.message {
  padding: 0.75rem;
  background: #e9ecef;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #495057;
  border-left: 4px solid #6c757d;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.speed-control input[type="range"] {
  flex: 1;
}

.icon {
  width: 1rem;
  height: 1rem;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .cpu-simulator {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
  }
  
  .control-panel,
  .cpu-visualization,
  .state-monitoring {
    grid-column: 1;
  }
}

@media (max-width: 768px) {
  .cpu-simulator {
    padding: 0.5rem;
    gap: 1rem;
  }
  
  .preset-controls {
    flex-direction: column;
  }
  
  .input-with-button {
    flex-direction: column;
  }
}
</style>
