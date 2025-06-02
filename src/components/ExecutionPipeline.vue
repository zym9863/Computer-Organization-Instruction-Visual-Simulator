<template>
  <div class="execution-pipeline">
    <div class="pipeline-container">
      <h3>五级流水线执行步骤</h3>
      
      <div class="pipeline-stages">
        <div 
          v-for="(stage, index) in stages" 
          :key="stage.name"
          class="pipeline-stage"
          :class="{ active: stage.active, completed: stage.completed }"
        >
          <div class="stage-header">
            <div class="stage-number">{{ index + 1 }}</div>
            <div class="stage-info">
              <h4>{{ stage.name }}</h4>
              <p>{{ stage.description }}</p>
            </div>
            <div class="stage-status">
              <div v-if="stage.active" class="status-indicator active">
                <div class="pulse"></div>
                进行中
              </div>
              <div v-else-if="stage.completed" class="status-indicator completed">
                ✓ 完成
              </div>
              <div v-else class="status-indicator waiting">
                等待
              </div>
            </div>
          </div>
          
          <div class="stage-details">
            <div class="detail-item">
              <span class="label">主要操作:</span>
              <span class="value">{{ stage.operations.join(', ') }}</span>
            </div>
            <div class="detail-item">
              <span class="label">涉及组件:</span>
              <span class="value">{{ stage.components.join(', ') }}</span>
            </div>
            <div class="detail-item">
              <span class="label">数据流向:</span>
              <span class="value">{{ stage.dataFlow }}</span>
            </div>
          </div>
          
          <!-- 连接箭头 -->
          <div v-if="index < stages.length - 1" class="stage-arrow">
            <svg width="40" height="20" viewBox="0 0 40 20">
              <path d="M 0 10 L 30 10 L 25 5 M 30 10 L 25 15" 
                    stroke="#666" stroke-width="2" fill="none" 
                    :class="{ active: stages[index + 1].active || stages[index + 1].completed }" />
            </svg>
          </div>
        </div>
      </div>
      
      <!-- 流水线时序图 -->
      <div class="pipeline-timeline">
        <h4>流水线时序</h4>
        <div class="timeline-container">
          <div class="timeline-labels">
            <div class="time-label">时钟周期</div>
            <div v-for="(stage, index) in stages" :key="index" class="stage-label">
              {{ stage.shortName }}
            </div>
          </div>
          
          <div class="timeline-grid">
            <div v-for="cycle in 8" :key="cycle" class="cycle-column">
              <div class="cycle-header">T{{ cycle }}</div>
              <div v-for="(stage, stageIndex) in stages" :key="stageIndex" class="timeline-cell">
                <div 
                  v-if="shouldShowInCycle(stageIndex, cycle)" 
                  class="timeline-block"
                  :class="{ 
                    active: isActiveInCycle(stageIndex, cycle),
                    current: isCurrentCycle(cycle)
                  }"
                >
                  {{ stage.shortName }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ExecutionStep } from '../types/cpu'

interface Props {
  currentStep: ExecutionStep
}

const props = defineProps<Props>()

// 流水线阶段定义
const stages = computed(() => [
  {
    name: '取指 (Fetch)',
    shortName: 'IF',
    description: '从内存中读取指令',
    operations: ['PC → MAR', '内存读取', 'IR ← 指令'],
    components: ['控制单元', '内存', 'PC', 'MAR', 'IR'],
    dataFlow: 'PC → 内存 → IR',
    active: props.currentStep === 'fetch',
    completed: getCompletedStatus('fetch')
  },
  {
    name: '译码 (Decode)',
    shortName: 'ID',
    description: '解析指令操作码和操作数',
    operations: ['指令解码', '寄存器读取', '控制信号生成'],
    components: ['控制单元', '寄存器组', '译码器'],
    dataFlow: 'IR → 控制单元 → 寄存器组',
    active: props.currentStep === 'decode',
    completed: getCompletedStatus('decode')
  },
  {
    name: '执行 (Execute)',
    shortName: 'EX',
    description: '执行算术或逻辑运算',
    operations: ['ALU运算', '地址计算', '条件判断'],
    components: ['ALU', '控制单元'],
    dataFlow: '寄存器 → ALU → 结果',
    active: props.currentStep === 'execute',
    completed: getCompletedStatus('execute')
  },
  {
    name: '访存 (Memory)',
    shortName: 'MEM',
    description: '访问内存进行读写操作',
    operations: ['内存读取', '内存写入', '地址转换'],
    components: ['内存', 'MAR', 'MDR'],
    dataFlow: 'ALU结果 → 内存 ↔ MDR',
    active: props.currentStep === 'memory',
    completed: getCompletedStatus('memory')
  },
  {
    name: '写回 (Write Back)',
    shortName: 'WB',
    description: '将结果写回寄存器',
    operations: ['寄存器写入', '状态更新', 'PC更新'],
    components: ['寄存器组', '控制单元'],
    dataFlow: '结果 → 寄存器组',
    active: props.currentStep === 'writeback',
    completed: getCompletedStatus('writeback')
  }
])

// 当前执行周期
const currentCycle = computed(() => {
  const stepMap: { [key: string]: number } = {
    'fetch': 1,
    'decode': 2,
    'execute': 3,
    'memory': 4,
    'writeback': 5
  }
  return stepMap[props.currentStep] || 0
})

function getCompletedStatus(step: string): boolean {
  const stepOrder = ['fetch', 'decode', 'execute', 'memory', 'writeback']
  const currentIndex = stepOrder.indexOf(props.currentStep)
  const stepIndex = stepOrder.indexOf(step)
  return currentIndex > stepIndex
}

function shouldShowInCycle(stageIndex: number, cycle: number): boolean {
  // 简化的流水线：每个阶段在对应的周期执行
  return cycle === stageIndex + 1
}

function isActiveInCycle(stageIndex: number, cycle: number): boolean {
  return cycle === stageIndex + 1 && currentCycle.value === cycle
}

function isCurrentCycle(cycle: number): boolean {
  return cycle === currentCycle.value
}
</script>

<style scoped>
.execution-pipeline {
  padding: 1rem;
  height: 100%;
  overflow-y: auto;
}

.pipeline-container {
  max-width: 100%;
}

.pipeline-container h3 {
  margin-bottom: 1.5rem;
  color: #2c3e50;
  text-align: center;
}

.pipeline-stages {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.pipeline-stage {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  position: relative;
}

.pipeline-stage.active {
  border-color: #007bff;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  box-shadow: 0 4px 15px rgba(0, 123, 255, 0.2);
}

.pipeline-stage.completed {
  border-color: #28a745;
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
}

.stage-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stage-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #6c757d;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.pipeline-stage.active .stage-number {
  background: #007bff;
  animation: pulse 2s infinite;
}

.pipeline-stage.completed .stage-number {
  background: #28a745;
}

.stage-info {
  flex: 1;
}

.stage-info h4 {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.stage-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.stage-status {
  text-align: right;
}

.status-indicator {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.status-indicator.active {
  background: #007bff;
  color: white;
}

.status-indicator.completed {
  background: #28a745;
  color: white;
}

.status-indicator.waiting {
  background: #e9ecef;
  color: #6c757d;
}

.pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
  animation: pulse 1s infinite;
}

.stage-details {
  display: grid;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.detail-item .label {
  font-weight: 600;
  color: #495057;
  min-width: 80px;
  flex-shrink: 0;
}

.detail-item .value {
  color: #6c757d;
  font-size: 0.9rem;
}

.stage-arrow {
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
}

.stage-arrow svg path.active {
  stroke: #007bff;
  stroke-width: 3;
}

/* 流水线时序图 */
.pipeline-timeline {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.pipeline-timeline h4 {
  margin: 0 0 1rem 0;
  color: #2c3e50;
}

.timeline-container {
  overflow-x: auto;
}

.timeline-labels {
  display: grid;
  grid-template-columns: 100px repeat(5, 1fr);
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.time-label {
  font-weight: 600;
  color: #495057;
  text-align: center;
}

.stage-label {
  font-weight: 500;
  color: #6c757d;
  text-align: center;
  padding: 0.25rem;
}

.timeline-grid {
  display: flex;
  gap: 2px;
}

.cycle-column {
  display: flex;
  flex-direction: column;
  min-width: 60px;
}

.cycle-header {
  background: #dee2e6;
  padding: 0.5rem;
  text-align: center;
  font-weight: 600;
  border-radius: 4px 4px 0 0;
}

.cycle-header.current {
  background: #007bff;
  color: white;
}

.timeline-cell {
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dee2e6;
  background: white;
}

.timeline-block {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 500;
  border-radius: 2px;
}

.timeline-block.active {
  background: #007bff;
  color: white;
  animation: pulse 1s infinite;
}

.timeline-block.current {
  background: #ffc107;
  color: black;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stage-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .stage-status {
    text-align: left;
  }
  
  .timeline-labels {
    grid-template-columns: 80px repeat(5, 1fr);
  }
  
  .cycle-column {
    min-width: 50px;
  }
  
  .detail-item {
    flex-direction: column;
    gap: 0.25rem;
  }
  
  .detail-item .label {
    min-width: auto;
  }
}
</style>
