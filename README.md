# LANCES ⚔️
lances is a RISC-V simulator that adheres to the R32i ISA 
it is written in TypeScript and uses Dominity for the frontend 

# Simulator Architecture
![flowdiagram](./public/flow.png)

the simulator attempts to be as close to machine as possible in typescript,
instead of manipulation of high level abstractions , lances converts the assembly instructions to 
binary much like how real assemblers do and then feed it to the simulator core which uses bitewise operations 
to decode and execute the instructions.

as of now lances only supports the R32i instruction set 
and instruction formats ( R, I, S, B )
U and J type instructions are in development

# usage 

the site is hosted at: https://lances.vercel.app

incase you want to run it locally 

```bash
git clone 
cd lances
npm install
npm run build 
npm run start
``` 
and open http://localhost:5173 in your browser



## Features
- Supports RISC-V R32i instruction set
- Syntax Highlighting for RISC-V assembly code
- Helpful refrence for instructions
- assembly to binary viewer ( view every instruction in binary/hex/decimal )


## Support 
If you find lances useful, please consider supporting its development by starring the repository or sharing it with others.
