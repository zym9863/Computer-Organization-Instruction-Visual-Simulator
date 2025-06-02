import type { 
  CPURegisters, 
  CPUState, 
  Instruction, 
  ControlSignals
} from '../types/cpu';
import { 
  InstructionType, 
  AddressingMode, 
  ExecutionStep
} from '../types/cpu';

export class CPUSimulator {
  private state: CPUState;
  private controlSignals: ControlSignals;

  constructor() {
    this.state = this.initializeState();
    this.controlSignals = this.initializeControlSignals();
  }

  private initializeState(): CPUState {
    return {
      registers: {
        R0: 0, R1: 0, R2: 0, R3: 0,
        R4: 0, R5: 0, R6: 0, R7: 0,
        PC: 0, SP: 1000, IR: 0,
        MAR: 0, MDR: 0, PSW: 0
      },
      memory: {},
      execution: {
        currentStep: ExecutionStep.FETCH,
        currentInstruction: null,
        isRunning: false,
        isPaused: false,
        stepIndex: 0,
        totalSteps: 5,
        message: '等待指令...',
        animationSpeed: 1000
      },
      components: {
        alu: { isActive: false, isHighlighted: false },
        controlUnit: { isActive: true, isHighlighted: false },
        registerFile: { isActive: false, isHighlighted: false },
        memoryUnit: { isActive: false, isHighlighted: false },
        bus: { isActive: false, isHighlighted: false }
      }
    };
  }

  private initializeControlSignals(): ControlSignals {
    return {
      memRead: false,
      memWrite: false,
      regWrite: false,
      aluOp: 'NOP',
      pcWrite: false,
      irWrite: false,
      regDst: false,
      memToReg: false,
      jump: false,
      branch: false
    };
  }

  public getState(): CPUState {
    return { ...this.state };
  }

  public getControlSignals(): ControlSignals {
    return { ...this.controlSignals };
  }

  public setRegister(name: keyof CPURegisters, value: number): void {
    this.state.registers[name] = value & 0xFFFFFFFF; // 确保32位
  }

  public getRegister(name: keyof CPURegisters): number {
    return this.state.registers[name];
  }

  public setMemory(address: number, value: number): void {
    this.state.memory[address] = value & 0xFFFFFFFF;
  }

  public getMemory(address: number): number {
    return this.state.memory[address] || 0;
  }

  public reset(): void {
    this.state = this.initializeState();
    this.controlSignals = this.initializeControlSignals();
  }

  public async executeInstruction(instruction: Instruction): Promise<void> {
    this.state.execution.currentInstruction = instruction;
    this.state.execution.isRunning = true;
    this.state.execution.stepIndex = 0;
    this.state.execution.message = `开始执行指令: ${instruction.mnemonic}`;

    // 执行五阶段流水线
    await this.fetch();
    await this.decode();
    await this.execute();
    await this.memory();
    await this.writeback();

    this.state.execution.isRunning = false;
    this.state.execution.message = '指令执行完成';
  }

  private async fetch(): Promise<void> {
    this.state.execution.currentStep = ExecutionStep.FETCH;
    this.state.execution.stepIndex = 1;
    this.state.execution.message = '取指阶段：从内存读取指令';

    // 激活相关组件
    this.activateComponent('controlUnit', true, '取指控制');
    this.activateComponent('memoryUnit', true, '读取指令');
    this.activateComponent('bus', true, '传输指令');

    // 设置控制信号
    this.controlSignals.memRead = true;
    this.controlSignals.pcWrite = true;
    this.controlSignals.irWrite = true;

    // 模拟取指过程
    this.state.registers.MAR = this.state.registers.PC;
    const instruction = this.getMemory(this.state.registers.PC);
    this.state.registers.IR = instruction;
    this.state.registers.PC += 4; // 假设指令长度为4字节

    await this.delay();
    this.deactivateAllComponents();
  }

  private async decode(): Promise<void> {
    this.state.execution.currentStep = ExecutionStep.DECODE;
    this.state.execution.stepIndex = 2;
    this.state.execution.message = '译码阶段：解析指令操作码和操作数';

    this.activateComponent('controlUnit', true, '指令译码');
    this.activateComponent('registerFile', true, '读取寄存器');

    // 重置控制信号
    this.controlSignals.memRead = false;
    this.controlSignals.pcWrite = false;
    this.controlSignals.irWrite = false;

    // 模拟译码过程
    const instruction = this.state.execution.currentInstruction!;
    this.generateControlSignals(instruction);

    await this.delay();
    this.deactivateAllComponents();
  }

  private async execute(): Promise<void> {
    this.state.execution.currentStep = ExecutionStep.EXECUTE;
    this.state.execution.stepIndex = 3;
    this.state.execution.message = '执行阶段：执行运算操作';

    const instruction = this.state.execution.currentInstruction!;
    
    this.activateComponent('alu', true, `执行${instruction.type}操作`);
    this.activateComponent('controlUnit', true, '执行控制');

    await this.performOperation(instruction);
    await this.delay();
    this.deactivateAllComponents();
  }

  private async memory(): Promise<void> {
    this.state.execution.currentStep = ExecutionStep.MEMORY;
    this.state.execution.stepIndex = 4;
    this.state.execution.message = '访存阶段：访问内存数据';

    const instruction = this.state.execution.currentInstruction!;
    
    if (this.isMemoryInstruction(instruction.type)) {
      this.activateComponent('memoryUnit', true, '内存访问');
      this.activateComponent('bus', true, '数据传输');
      
      await this.performMemoryOperation(instruction);
    } else {
      this.state.execution.message = '访存阶段：无需访问内存';
    }

    await this.delay();
    this.deactivateAllComponents();
  }

  private async writeback(): Promise<void> {
    this.state.execution.currentStep = ExecutionStep.WRITEBACK;
    this.state.execution.stepIndex = 5;
    this.state.execution.message = '写回阶段：将结果写回寄存器';

    const instruction = this.state.execution.currentInstruction!;
    
    if (this.needsWriteback(instruction.type)) {
      this.activateComponent('registerFile', true, '写回寄存器');
      this.controlSignals.regWrite = true;
    } else {
      this.state.execution.message = '写回阶段：无需写回';
    }

    await this.delay();
    this.deactivateAllComponents();
    
    // 重置控制信号
    this.controlSignals = this.initializeControlSignals();
  }

  private async performOperation(instruction: Instruction): Promise<void> {
    const { type, operands } = instruction;
    
    switch (type) {
      case InstructionType.ADD:
        await this.executeAdd(operands);
        break;
      case InstructionType.SUB:
        await this.executeSub(operands);
        break;
      case InstructionType.MUL:
        await this.executeMul(operands);
        break;
      case InstructionType.DIV:
        await this.executeDiv(operands);
        break;
      case InstructionType.MOV:
        await this.executeMov(operands);
        break;
      case InstructionType.CMP:
        await this.executeCmp(operands);
        break;
      case InstructionType.JMP:
        await this.executeJmp(operands);
        break;
      case InstructionType.JZ:
        await this.executeJz(operands);
        break;
      case InstructionType.JNZ:
        await this.executeJnz(operands);
        break;
      case InstructionType.NOP:
        // 空操作
        break;
    }
  }

  private async executeAdd(operands: any[]): Promise<void> {
    if (operands.length >= 3) {
      const src1 = this.getOperandValue(operands[1]);
      const src2 = this.getOperandValue(operands[2]);
      const result = src1 + src2;
      this.setOperandValue(operands[0], result);
      this.controlSignals.aluOp = 'ADD';
    }
  }

  private async executeSub(operands: any[]): Promise<void> {
    if (operands.length >= 3) {
      const src1 = this.getOperandValue(operands[1]);
      const src2 = this.getOperandValue(operands[2]);
      const result = src1 - src2;
      this.setOperandValue(operands[0], result);
      this.controlSignals.aluOp = 'SUB';
    }
  }

  private async executeMul(operands: any[]): Promise<void> {
    if (operands.length >= 3) {
      const src1 = this.getOperandValue(operands[1]);
      const src2 = this.getOperandValue(operands[2]);
      const result = src1 * src2;
      this.setOperandValue(operands[0], result);
      this.controlSignals.aluOp = 'MUL';
    }
  }

  private async executeDiv(operands: any[]): Promise<void> {
    if (operands.length >= 3) {
      const src1 = this.getOperandValue(operands[1]);
      const src2 = this.getOperandValue(operands[2]);
      if (src2 !== 0) {
        const result = Math.floor(src1 / src2);
        this.setOperandValue(operands[0], result);
      }
      this.controlSignals.aluOp = 'DIV';
    }
  }

  private async executeMov(operands: any[]): Promise<void> {
    if (operands.length >= 2) {
      const src = this.getOperandValue(operands[1]);
      this.setOperandValue(operands[0], src);
    }
  }

  private async executeCmp(operands: any[]): Promise<void> {
    if (operands.length >= 2) {
      const src1 = this.getOperandValue(operands[0]);
      const src2 = this.getOperandValue(operands[1]);
      const result = src1 - src2;
      
      // 设置状态标志
      this.state.registers.PSW = 0;
      if (result === 0) this.state.registers.PSW |= 0x40; // Zero flag
      if (result < 0) this.state.registers.PSW |= 0x80;   // Negative flag
      
      this.controlSignals.aluOp = 'CMP';
    }
  }

  private async executeJmp(operands: any[]): Promise<void> {
    if (operands.length >= 1) {
      const target = this.getOperandValue(operands[0]);
      this.state.registers.PC = target;
      this.controlSignals.jump = true;
    }
  }

  private async executeJz(operands: any[]): Promise<void> {
    if (operands.length >= 1 && (this.state.registers.PSW & 0x40)) {
      const target = this.getOperandValue(operands[0]);
      this.state.registers.PC = target;
      this.controlSignals.branch = true;
    }
  }

  private async executeJnz(operands: any[]): Promise<void> {
    if (operands.length >= 1 && !(this.state.registers.PSW & 0x40)) {
      const target = this.getOperandValue(operands[0]);
      this.state.registers.PC = target;
      this.controlSignals.branch = true;
    }
  }

  private async performMemoryOperation(instruction: Instruction): Promise<void> {
    const { type, operands } = instruction;
    
    if (type === InstructionType.LOAD && operands.length >= 2) {
      const address = this.getOperandValue(operands[1]);
      this.state.registers.MAR = address;
      const data = this.getMemory(address);
      this.state.registers.MDR = data;
      this.setOperandValue(operands[0], data);
      this.controlSignals.memRead = true;
      this.controlSignals.memToReg = true;
    } else if (type === InstructionType.STORE && operands.length >= 2) {
      const address = this.getOperandValue(operands[1]);
      const data = this.getOperandValue(operands[0]);
      this.state.registers.MAR = address;
      this.state.registers.MDR = data;
      this.setMemory(address, data);
      this.controlSignals.memWrite = true;
    }
  }

  private getOperandValue(operand: any): number {
    if (typeof operand === 'object' && operand.type && operand.value) {
      switch (operand.type) {
        case AddressingMode.IMMEDIATE:
          return typeof operand.value === 'number' ? operand.value : parseInt(operand.value.toString());
        case AddressingMode.REGISTER:
          return this.getRegister(operand.value as keyof CPURegisters);
        case AddressingMode.DIRECT:
          return this.getMemory(typeof operand.value === 'number' ? operand.value : parseInt(operand.value.toString()));
        case AddressingMode.INDIRECT:
          const address = this.getRegister(operand.value as keyof CPURegisters);
          return this.getMemory(address);
        default:
          return 0;
      }
    }
    return typeof operand === 'number' ? operand : parseInt(operand.toString());
  }

  private setOperandValue(operand: any, value: number): void {
    if (typeof operand === 'object' && operand.type && operand.value) {
      switch (operand.type) {
        case AddressingMode.REGISTER:
          this.setRegister(operand.value as keyof CPURegisters, value);
          break;
        case AddressingMode.DIRECT:
          this.setMemory(typeof operand.value === 'number' ? operand.value : parseInt(operand.value.toString()), value);
          break;
        case AddressingMode.INDIRECT:
          const address = this.getRegister(operand.value as keyof CPURegisters);
          this.setMemory(address, value);
          break;
      }
    }
  }

  private isMemoryInstruction(type: string): boolean {
    return type === InstructionType.LOAD || type === InstructionType.STORE;
  }

  private needsWriteback(type: string): boolean {
    return ![InstructionType.STORE, InstructionType.CMP, InstructionType.JMP, 
             InstructionType.JZ, InstructionType.JNZ, InstructionType.NOP].includes(type as any);
  }

  private generateControlSignals(instruction: Instruction): void {
    // 根据指令类型生成控制信号
    const { type } = instruction;
    
    switch (type) {
      case InstructionType.LOAD:
        this.controlSignals.memRead = true;
        this.controlSignals.regWrite = true;
        this.controlSignals.memToReg = true;
        break;
      case InstructionType.STORE:
        this.controlSignals.memWrite = true;
        break;
      case InstructionType.ADD:
      case InstructionType.SUB:
      case InstructionType.MUL:
      case InstructionType.DIV:
        this.controlSignals.regWrite = true;
        this.controlSignals.aluOp = type;
        break;
      case InstructionType.JMP:
        this.controlSignals.jump = true;
        this.controlSignals.pcWrite = true;
        break;
      case InstructionType.JZ:
      case InstructionType.JNZ:
        this.controlSignals.branch = true;
        break;
    }
  }

  private activateComponent(name: keyof CPUState['components'], active: boolean, operation?: string): void {
    this.state.components[name].isActive = active;
    this.state.components[name].isHighlighted = active;
    if (operation) {
      this.state.components[name].operation = operation;
    }
  }

  private deactivateAllComponents(): void {
    Object.keys(this.state.components).forEach(key => {
      const component = this.state.components[key as keyof CPUState['components']];
      component.isActive = false;
      component.isHighlighted = false;
      component.operation = undefined;
    });
  }

  private delay(): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, this.state.execution.animationSpeed);
    });
  }
}
