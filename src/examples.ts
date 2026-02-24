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
	,"fibonacci":`# if n == 0 → return 0
beq   x10, x0, fib_zero

# load constant 1
addi  x29, x0, 1

# if n == 1 → return 1
beq   x10, x29, fib_one

# prev = 0
addi  x5, x0, 0

# curr = 1
addi  x6, x0, 1

# i = 1
addi  x7, x0, 1

loop:
add   x28, x5, x6      # next = prev + curr
add   x5, x6, x0       # prev = curr
add   x6, x28, x0      # curr = next

addi  x7, x7, 1        # i++
blt   x7, x10, loop    # while (i < n)

# result = curr
add   x10, x6, x0
jal   x0, end

fib_zero:
addi  x10, x0, 0
jal   x0, end

fib_one:
addi  x10, x0, 1

end:
jal   x0, end          # infinite loop (halt)`
}
