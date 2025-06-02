# CPU Instruction Execution Visual Simulator

[中文](./README.md) | English

A CPU instruction execution visualization educational tool based on Vue 3 and TypeScript, helping students understand computer organization principles and CPU working mechanisms.

## ✨ Key Features

- 🔄 **Real-time CPU Instruction Execution Visualization** - Intuitive display of instruction execution flow in CPU
- 🏗️ **Detailed Five-Stage Pipeline Execution** - Complete process of fetch, decode, execute, memory access, and writeback
- 📊 **Real-time Register and Memory State Monitoring** - Support for multiple number base displays and interactive editing
- ⚡ **Control Signal State and Timing Diagram Display** - Deep understanding of CPU control logic
- 🎯 **Support for Various Assembly Instructions and Addressing Modes** - Covers arithmetic, logic, storage, and jump instructions
- 📚 **Preset Instruction Examples for Quick Experience** - Built-in multiple typical program examples
- 🌓 **Dark/Light Theme Toggle** - Adapts to different usage environments
- 📱 **Responsive Design** - Supports desktop and mobile devices

## 🚀 Quick Start

### System Requirements

- Node.js 16.0+
- npm 7.0+ or yarn 1.22+

### Installation Steps

1. **Clone the Project**
```bash
git clone https://github.com/zym9863/cpu-instruction-simulator.git
cd cpu-instruction-simulator
```

2. **Install Dependencies**
```bash
npm install
# or
yarn install
```

3. **Start Development Server**
```bash
npm run dev
# or
yarn dev
```

4. **Open Browser**
Visit `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
# or
yarn build
```

## 📖 User Guide

### Basic Operations

1. **Input Instructions**: Enter assembly instructions in the instruction input box on the left control panel
2. **Execute Instructions**: Click the "Execute" button or press Enter to execute instructions
3. **Observe Changes**: View state changes in CPU architecture diagram, pipeline, registers, and memory
4. **Step Debugging**: Use "Step Execute" function to observe the execution process step by step

### Supported Instruction Types

#### Arithmetic Instructions
- `ADD R0, R1, R2` - Addition operation: R0 = R1 + R2
- `SUB R0, R1, R2` - Subtraction operation: R0 = R1 - R2
- `MUL R0, R1, R2` - Multiplication operation: R0 = R1 × R2
- `DIV R0, R1, R2` - Division operation: R0 = R1 ÷ R2

#### Data Transfer Instructions
- `MOV R0, #100` - Immediate transfer: R0 = 100
- `MOV R0, R1` - Register transfer: R0 = R1
- `LOAD R0, 1000` - Load from memory: R0 = Memory[1000]
- `STORE R0, 1000` - Store to memory: Memory[1000] = R0

#### Control Instructions
- `CMP R0, R1` - Compare instruction, set flags
- `JMP 1000` - Unconditional jump to address 1000
- `JZ 1000` - Jump on zero flag
- `JNZ 1000` - Jump on non-zero flag

### Addressing Modes

- **Immediate Addressing**: `#100` - Directly use value 100
- **Register Addressing**: `R1` - Use value in register R1
- **Direct Addressing**: `1000` - Use value at memory address 1000
- **Indirect Addressing**: `[R1]` - Use memory value pointed to by address in R1

### Preset Examples

The project includes multiple preset examples to help quickly understand different types of instruction execution:

1. **Basic Arithmetic Operations** - Demonstrates addition, subtraction, multiplication, and division
2. **Memory Operations** - Demonstrates data loading and storage
3. **Conditional Jumps** - Demonstrates branch control structures
4. **Loop Calculations** - Demonstrates loop structure implementation

## 🏗️ Project Structure

```
src/
├── components/          # Vue components
│   ├── CPUSimulator.vue        # Main simulator component
│   ├── CPUArchitecture.vue     # CPU architecture visualization
│   ├── ExecutionPipeline.vue   # Execution pipeline
│   ├── RegisterView.vue        # Register view
│   ├── MemoryView.vue          # Memory view
│   └── ControlSignalsView.vue  # Control signals view
├── types/               # TypeScript type definitions
│   └── cpu.ts
├── utils/               # Utility functions
│   ├── cpuSimulator.ts         # CPU simulator core logic
│   └── instructionParser.ts    # Instruction parser
├── App.vue              # Root component
├── main.ts              # Application entry
└── style.css            # Global styles
```

## 🛠️ Tech Stack

- **Vue 3** - Modern frontend framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool
- **Lucide Vue** - Modern icon library
- **CSS3** - Styles and animations

## 🎓 Educational Value

This simulator is particularly suitable for teaching the following courses:

- **Computer Organization Principles** - Understanding CPU internal structure and working principles
- **Computer Architecture** - Learning instruction set architecture and pipeline technology
- **Assembly Language Programming** - Practicing assembly instruction execution processes
- **Digital Logic Design** - Understanding control signals and timing

### Learning Objectives

By using this simulator, students can:

- ✅ Understand the five-stage pipeline execution process of CPU
- ✅ Master execution steps of different types of instructions
- ✅ Learn the roles of registers, ALU, memory and other components
- ✅ Study the generation and mechanism of control signals
- ✅ Experience performance improvements brought by pipeline technology
- ✅ Understand instruction set architecture design principles

## 🤝 Contributing Guidelines

Contributions are welcome! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Standards

- Write type-safe code using TypeScript
- Follow Vue 3 Composition API best practices
- Write clear comments and documentation
- Ensure code passes ESLint checks
- Add necessary unit tests

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Vue.js team for providing excellent frontend framework
- Lucide team for providing beautiful icon library
- All developers contributing to computer education

## 🔮 Future Plans

- [ ] Add support for more instruction types
- [ ] Implement cache hierarchy simulation
- [ ] Support multi-core processor simulation
- [ ] Add performance analysis tools
- [ ] Support custom instruction sets
- [ ] Integrate online teaching platforms
- [ ] Add multi-language support
- [ ] Implement collaborative learning features

---

⭐ If this project helps you, please give it a Star!
