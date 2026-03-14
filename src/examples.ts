export const examples = {
   "factorial":`
    addi x1, x0, 5        # n = 5
    addi x2, x0, 1        # result = 1
outer_loop:
    addi x4, x0, 0        # acc = 0
    add  x5, x2, x0       # temp = result
    add  x6, x1, x0       # counter = n
inner_loop:
    add  x4, x4, x5       # acc += temp
    addi x6, x6, -1       # counter--
    bne  x6, x0, inner_loop   # repeat inner loop

    add  x2, x4, x0       # result = acc
    addi x1, x1, -1       # n--
    bne  x1, x0, outer_loop   # repeat outer loop	
   	`,
	"default":`# write your risc v code here \n`
	,"fibonacci":``,
"array":`.data
key: .word 109,20
tkey2: .word 10
.text 
lw x1, key
la x3,key
addi x3,x0, 4
lw x2, 0(x3)
`,
"system calls":`.data
number: .word 10
test_string:.asciiz "hello world"
.text
la a0, test_string  # load string address
addi a7, x0, 4       # print string syscall code
ecall
la t0, number       # load number address
lw t1, 0(t0)
addi a7, x0, 5       # read int syscall code
ecall
add a0, a0, t1
addi a7, x0, 1       # print int syscall code
ecall
`

}
