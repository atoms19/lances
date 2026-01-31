# Lances-Sim Problems

This document outlines the current problems and missing features in the Lances-Sim RISC-V simulator.

## Simulator (`simulator.ts`)

*   **Missing Instructions:** The `ALUExecute` function is missing several instructions from the RV32I base instruction set:
    *   `slt` (set less than)
    *   `sltu` (set less than unsigned)
    *   `sll` (shift left logical)
    *   `srl` (shift right logical)
    *   `sra` (shift right arithmetic)
*   **Missing Branch Instructions:** The `decodeBranchedInstruction` function is missing:
    *   `bltu` (branch less than unsigned)
    *   `bgeu` (branch greater than or equal unsigned)
*   **Incomplete Instruction Support:** The `executeInstruction` function does not handle:
    *   `J-Type` instructions (`jal`)
    *   `U-Type` instructions (`lui`, `auipc`)
*   **No Exception/Interrupt Handling:** The simulator cannot handle exceptions (e.g., illegal instruction, memory access faults) or interrupts from external devices.
*   **No Privilege Levels:** The simulator operates in a single mode. There is no distinction between user mode and machine mode.
*   **No CSR Registers:** Control and Status Registers (CSRs) are not implemented. This is a major missing feature for any realistic RISC-V simulator.
*   **Program Termination:** The `stepForward` function only logs to the console when the program ends. It should set a flag or have a more robust mechanism to indicate program completion.

## Assembler (`assembler.ts`)

*   **Incomplete ABI Register Decoder:** The `abiRegisterDecoder` does not handle all standard RISC-V ABI register names (e.g., `s2`-`s11`, `t3`-`t6`).
*   **Label Replacement Bug:** The `preAssembler`'s label replacement logic is buggy. It performs a simple string replacement, which can lead to incorrect assembly if a label name is a substring of another word in the instruction (e.g., a label named `s1` would cause issues with instructions using the `s1` register).
*   **Missing U-Type Support:** The `convertInstructionToBytes` function does not support `U-Type` instructions like `lui` and `auipc`.
*   **No Pseudo-instructions:** The assembler does not expand common pseudo-instructions (e.g., `nop`, `mv`, `li`).

## Disassembler (`dissasmbler.ts`)

*   **Incomplete J-Type Decoding:** The `decodeInstruction` function does not correctly decode `J-Type` instructions (`jal`).
*   **Missing U-Type Decoding:** The disassembler does not decode `U-Type` instructions (`lui`, `auipc`).
*   **No String Output:** The disassembler only returns a structured object. It would be useful to also provide a formatted string representation of the disassembled instruction.

## I/O (`IODevices.ts`)

*   **Not Implemented:** The I/O device simulation is completely missing.

## Memory (`Memory.ts`)

*   **Inflexible Memory Size:** The data memory size is hardcoded to 4KB. This should be configurable.
*   **Fragmented Memory Model:** The instruction memory is a separate `Uint32Array` in the simulator class, while the data memory is handled by the `Memory` class. A unified memory model would be cleaner and more realistic.

## Register File (`registerFile.ts`)

*   No major issues were found in the register file implementation.
