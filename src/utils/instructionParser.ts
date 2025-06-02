import type { Instruction, Operand } from '../types/cpu';
import { InstructionType, AddressingMode } from '../types/cpu';

export class InstructionParser {
  // 预设指令示例
  public static getPresetInstructions() {
    return [
      {
        name: '基本算术运算',
        category: 'arithmetic',
        description: '演示基本的加法、减法、乘法、除法操作',
        instructions: [
          this.parseInstruction('MOV R1, #10'),
          this.parseInstruction('MOV R2, #5'),
          this.parseInstruction('ADD R0, R1, R2'),
          this.parseInstruction('SUB R3, R1, R2'),
          this.parseInstruction('MUL R4, R1, R2'),
          this.parseInstruction('DIV R5, R1, R2')
        ]
      },
      {
        name: '内存操作',
        category: 'memory',
        description: '演示加载和存储指令的内存访问过程',
        instructions: [
          this.parseInstruction('MOV R1, #100'),
          this.parseInstruction('STORE R1, 1000'),
          this.parseInstruction('MOV R2, #200'),
          this.parseInstruction('STORE R2, 1004'),
          this.parseInstruction('LOAD R3, 1000'),
          this.parseInstruction('LOAD R4, 1004')
        ]
      },
      {
        name: '条件跳转',
        category: 'control',
        description: '演示比较指令和条件跳转的执行过程',
        instructions: [
          this.parseInstruction('MOV R1, #10'),
          this.parseInstruction('MOV R2, #10'),
          this.parseInstruction('CMP R1, R2'),
          this.parseInstruction('JZ 16'),
          this.parseInstruction('MOV R0, #1'),
          this.parseInstruction('MOV R0, #0')
        ]
      },
      {
        name: '循环计算',
        category: 'loop',
        description: '演示简单循环结构的实现',
        instructions: [
          this.parseInstruction('MOV R1, #5'),
          this.parseInstruction('MOV R0, #0'),
          this.parseInstruction('ADD R0, R0, R1'),
          this.parseInstruction('SUB R1, R1, #1'),
          this.parseInstruction('CMP R1, #0'),
          this.parseInstruction('JNZ 8')
        ]
      }
    ];
  }

  // 解析单条指令
  public static parseInstruction(instructionText: string): Instruction {
    const cleanText = instructionText.trim().toUpperCase();
    const parts = cleanText.split(/[\s,]+/).filter(part => part.length > 0);
    
    if (parts.length === 0) {
      throw new Error('指令不能为空');
    }

    const mnemonic = parts[0];
    const operands = parts.slice(1).map(part => this.parseOperand(part));

    // 验证指令类型
    const type = this.getInstructionType(mnemonic);
    if (!type) {
      throw new Error(`不支持的指令: ${mnemonic}`);
    }

    // 验证操作数数量
    this.validateOperandCount(type, operands.length);

    return {
      type,
      mnemonic: instructionText.trim(),
      operands,
      description: this.getInstructionDescription(type),
      encoding: this.generateInstructionEncoding(type, operands)
    };
  }

  // 解析操作数
  private static parseOperand(operandText: string): Operand {
    const text = operandText.trim();
    
    // 立即数 (#value)
    if (text.startsWith('#')) {
      const value = parseInt(text.substring(1));
      if (isNaN(value)) {
        throw new Error(`无效的立即数: ${text}`);
      }
      return {
        type: AddressingMode.IMMEDIATE,
        value,
        displayValue: text
      };
    }
    
    // 寄存器 (R0-R7, PC, SP, 等)
    if (this.isRegister(text)) {
      return {
        type: AddressingMode.REGISTER,
        value: text,
        displayValue: text
      };
    }
    
    // 间接寻址 ([Rx])
    if (text.startsWith('[') && text.endsWith(']')) {
      const reg = text.substring(1, text.length - 1);
      if (!this.isRegister(reg)) {
        throw new Error(`无效的寄存器: ${reg}`);
      }
      return {
        type: AddressingMode.INDIRECT,
        value: reg,
        displayValue: text
      };
    }
    
    // 直接寻址 (数字地址)
    const numValue = parseInt(text);
    if (!isNaN(numValue)) {
      return {
        type: AddressingMode.DIRECT,
        value: numValue,
        displayValue: text
      };
    }
    
    throw new Error(`无法解析操作数: ${text}`);
  }

  // 检查是否为有效寄存器
  private static isRegister(text: string): boolean {
    const registers = ['R0', 'R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 
                     'PC', 'SP', 'IR', 'MAR', 'MDR', 'PSW'];
    return registers.includes(text);
  }

  // 获取指令类型
  private static getInstructionType(mnemonic: string): InstructionType | null {
    const instructionMap: { [key: string]: InstructionType } = {
      'LOAD': InstructionType.LOAD,
      'STORE': InstructionType.STORE,
      'ADD': InstructionType.ADD,
      'SUB': InstructionType.SUB,
      'MUL': InstructionType.MUL,
      'DIV': InstructionType.DIV,
      'MOV': InstructionType.MOV,
      'CMP': InstructionType.CMP,
      'JMP': InstructionType.JMP,
      'JZ': InstructionType.JZ,
      'JNZ': InstructionType.JNZ,
      'NOP': InstructionType.NOP
    };
    
    return instructionMap[mnemonic] || null;
  }

  // 验证操作数数量
  private static validateOperandCount(type: InstructionType, count: number): void {
    const requirements: { [key in InstructionType]: number } = {
      [InstructionType.LOAD]: 2,
      [InstructionType.STORE]: 2,
      [InstructionType.ADD]: 3,
      [InstructionType.SUB]: 3,
      [InstructionType.MUL]: 3,
      [InstructionType.DIV]: 3,
      [InstructionType.MOV]: 2,
      [InstructionType.CMP]: 2,
      [InstructionType.JMP]: 1,
      [InstructionType.JZ]: 1,
      [InstructionType.JNZ]: 1,
      [InstructionType.NOP]: 0
    };

    const required = requirements[type];
    if (required !== undefined && count !== required) {
      throw new Error(`指令 ${type} 需要 ${required} 个操作数，但提供了 ${count} 个`);
    }
  }

  // 获取指令描述
  private static getInstructionDescription(type: InstructionType): string {
    const descriptions: { [key in InstructionType]: string } = {
      [InstructionType.LOAD]: '从内存加载数据到寄存器',
      [InstructionType.STORE]: '将寄存器数据存储到内存',
      [InstructionType.ADD]: '执行加法运算',
      [InstructionType.SUB]: '执行减法运算',
      [InstructionType.MUL]: '执行乘法运算',
      [InstructionType.DIV]: '执行除法运算',
      [InstructionType.MOV]: '移动数据',
      [InstructionType.CMP]: '比较两个操作数',
      [InstructionType.JMP]: '无条件跳转',
      [InstructionType.JZ]: '零标志跳转',
      [InstructionType.JNZ]: '非零标志跳转',
      [InstructionType.NOP]: '空操作'
    };
    
    return descriptions[type] || '未知指令';
  }

  // 生成指令编码 (简化版)
  private static generateInstructionEncoding(type: InstructionType, operands: Operand[]): number {
    // 简化的指令编码：操作码(8位) + 操作数编码(24位)
    const opcodes: { [key in InstructionType]: number } = {
      [InstructionType.LOAD]: 0x01,
      [InstructionType.STORE]: 0x02,
      [InstructionType.ADD]: 0x10,
      [InstructionType.SUB]: 0x11,
      [InstructionType.MUL]: 0x12,
      [InstructionType.DIV]: 0x13,
      [InstructionType.MOV]: 0x20,
      [InstructionType.CMP]: 0x21,
      [InstructionType.JMP]: 0x30,
      [InstructionType.JZ]: 0x31,
      [InstructionType.JNZ]: 0x32,
      [InstructionType.NOP]: 0x00
    };

    let encoding = (opcodes[type] || 0) << 24;
    
    // 简单地将操作数编码到剩余位中
    operands.forEach((operand, index) => {
      const operandValue = this.encodeOperand(operand);
      encoding |= (operandValue & 0xFF) << (16 - index * 8);
    });

    return encoding;
  }

  // 编码操作数
  private static encodeOperand(operand: Operand): number {
    switch (operand.type) {
      case AddressingMode.IMMEDIATE:
        return typeof operand.value === 'number' ? operand.value & 0xFF : 0;
      case AddressingMode.REGISTER:
        return this.getRegisterCode(operand.value as string);
      case AddressingMode.DIRECT:
        return typeof operand.value === 'number' ? operand.value & 0xFF : 0;
      case AddressingMode.INDIRECT:
        return this.getRegisterCode(operand.value as string) | 0x80; // 设置间接标志
      default:
        return 0;
    }
  }

  // 获取寄存器编码
  private static getRegisterCode(register: string): number {
    const registerCodes: { [key: string]: number } = {
      'R0': 0, 'R1': 1, 'R2': 2, 'R3': 3,
      'R4': 4, 'R5': 5, 'R6': 6, 'R7': 7,
      'PC': 8, 'SP': 9, 'IR': 10, 'MAR': 11, 'MDR': 12, 'PSW': 13
    };
    
    return registerCodes[register] || 0;
  }

  // 验证指令语法
  public static validateInstructionSyntax(instructionText: string): { isValid: boolean; error?: string } {
    try {
      this.parseInstruction(instructionText);
      return { isValid: true };
    } catch (error) {
      return { 
        isValid: false, 
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  // 格式化指令显示
  public static formatInstruction(instruction: Instruction): string {
    const operandStrings = instruction.operands.map(op => op.displayValue || op.value.toString());
    return `${instruction.mnemonic.split(' ')[0]} ${operandStrings.join(', ')}`;
  }

  // 获取指令帮助信息
  public static getInstructionHelp(): { [key: string]: string } {
    return {
      'LOAD': 'LOAD Rd, address - 从内存地址加载数据到目标寄存器\n示例: LOAD R1, 1000',
      'STORE': 'STORE Rs, address - 将源寄存器数据存储到内存地址\n示例: STORE R1, 1000',
      'ADD': 'ADD Rd, Rs1, Rs2 - 将两个源寄存器相加，结果存入目标寄存器\n示例: ADD R0, R1, R2',
      'SUB': 'SUB Rd, Rs1, Rs2 - 第一个源寄存器减去第二个，结果存入目标寄存器\n示例: SUB R0, R1, R2',
      'MUL': 'MUL Rd, Rs1, Rs2 - 将两个源寄存器相乘，结果存入目标寄存器\n示例: MUL R0, R1, R2',
      'DIV': 'DIV Rd, Rs1, Rs2 - 第一个源寄存器除以第二个，结果存入目标寄存器\n示例: DIV R0, R1, R2',
      'MOV': 'MOV Rd, source - 将源操作数移动到目标寄存器\n示例: MOV R1, #10 或 MOV R1, R2',
      'CMP': 'CMP Rs1, Rs2 - 比较两个操作数，设置状态标志\n示例: CMP R1, R2',
      'JMP': 'JMP address - 无条件跳转到指定地址\n示例: JMP 100',
      'JZ': 'JZ address - 如果零标志为真则跳转\n示例: JZ 100',
      'JNZ': 'JNZ address - 如果零标志为假则跳转\n示例: JNZ 100',
      'NOP': 'NOP - 空操作指令\n示例: NOP'
    };
  }
}
