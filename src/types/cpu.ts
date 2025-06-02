// CPU寄存器接口
export interface CPURegisters {
  // 通用寄存器 (32位)
  R0: number;
  R1: number;
  R2: number;
  R3: number;
  R4: number;
  R5: number;
  R6: number;
  R7: number;
  
  // 专用寄存器
  PC: number;  // 程序计数器
  SP: number;  // 堆栈指针
  IR: number;  // 指令寄存器
  MAR: number; // 内存地址寄存器
  MDR: number; // 内存数据寄存器
  
  // 状态寄存器
  PSW: number; // 程序状态字
}

// 内存接口
export interface Memory {
  [address: number]: number;
}

// 指令类型常量
export const InstructionType = {
  LOAD: 'LOAD',     // 加载指令
  STORE: 'STORE',   // 存储指令
  ADD: 'ADD',       // 加法指令
  SUB: 'SUB',       // 减法指令
  MUL: 'MUL',       // 乘法指令
  DIV: 'DIV',       // 除法指令
  MOV: 'MOV',       // 移动指令
  CMP: 'CMP',       // 比较指令
  JMP: 'JMP',       // 无条件跳转
  JZ: 'JZ',         // 零跳转
  JNZ: 'JNZ',       // 非零跳转
  NOP: 'NOP'        // 空操作
} as const;

export type InstructionType = typeof InstructionType[keyof typeof InstructionType];

// 寻址模式常量
export const AddressingMode = {
  IMMEDIATE: 'immediate',    // 立即寻址
  DIRECT: 'direct',         // 直接寻址
  REGISTER: 'register',     // 寄存器寻址
  INDIRECT: 'indirect'      // 间接寻址
} as const;

export type AddressingMode = typeof AddressingMode[keyof typeof AddressingMode];

// 操作数接口
export interface Operand {
  type: AddressingMode;
  value: string | number;
  displayValue?: string;
}

// 指令接口
export interface Instruction {
  type: InstructionType;
  mnemonic: string;
  operands: Operand[];
  description: string;
  encoding?: number; // 指令编码
}

// 执行步骤常量
export const ExecutionStep = {
  FETCH: 'fetch',           // 取指
  DECODE: 'decode',         // 译码
  EXECUTE: 'execute',       // 执行
  MEMORY: 'memory',         // 访存
  WRITEBACK: 'writeback'    // 写回
} as const;

export type ExecutionStep = typeof ExecutionStep[keyof typeof ExecutionStep];

// 执行状态接口
export interface ExecutionState {
  currentStep: ExecutionStep;
  currentInstruction: Instruction | null;
  isRunning: boolean;
  isPaused: boolean;
  stepIndex: number;
  totalSteps: number;
  message: string;
  animationSpeed: number; // 动画速度 (ms)
}

// CPU组件状态
export interface ComponentState {
  isActive: boolean;
  isHighlighted: boolean;
  data?: any;
  operation?: string;
}

// CPU状态接口
export interface CPUState {
  registers: CPURegisters;
  memory: Memory;
  execution: ExecutionState;
  components: {
    alu: ComponentState;
    controlUnit: ComponentState;
    registerFile: ComponentState;
    memoryUnit: ComponentState;
    bus: ComponentState;
  };
}

// 数据流动接口
export interface DataFlow {
  from: string;
  to: string;
  data: number;
  label: string;
  active: boolean;
}

// 预设指令示例
export interface InstructionExample {
  name: string;
  instructions: Instruction[];
  description: string;
  category: string;
}

// 控制信号接口
export interface ControlSignals {
  memRead: boolean;
  memWrite: boolean;
  regWrite: boolean;
  aluOp: string;
  pcWrite: boolean;
  irWrite: boolean;
  regDst: boolean;
  memToReg: boolean;
  jump: boolean;
  branch: boolean;
}

// 性能计数器
export interface PerformanceCounters {
  instructionsExecuted: number;
  cycles: number;
  memoryAccesses: number;
  cacheHits: number;
  cacheMisses: number;
}

// 调试信息
export interface DebugInfo {
  breakpoints: number[];
  watchedAddresses: number[];
  callStack: number[];
  executionHistory: {
    instruction: Instruction;
    registersBefore: CPURegisters;
    registersAfter: CPURegisters;
    memoryChanges: { address: number; oldValue: number; newValue: number }[];
  }[];
}

// 完整的模拟器状态
export interface SimulatorState {
  cpu: CPUState;
  performance: PerformanceCounters;
  debug: DebugInfo;
  settings: {
    animationEnabled: boolean;
    animationSpeed: number;
    showInternalSignals: boolean;
    autoStep: boolean;
    displayFormat: 'hex' | 'dec' | 'bin';
  };
}
