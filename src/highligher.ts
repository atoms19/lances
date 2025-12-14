export const highlight = (editor: HTMLElement) => {
  let code = editor.textContent || ""
  // Escape HTML first (VERY IMPORTANT)
  code = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  // Comments (# ...)
  code = code.replace(
    /(#.*)$/gm,
    `<span class="tok-comment">$1</span>`
  )
  // Labels
  code = code.replace(
    /^\s*([A-Za-z_]\w*):/gm,
    `<span class="tok-label">$1</span>:`
  )
  // Registers
  code = code.replace(
    /\b(x([0-9]|[12][0-9]|3[01])|zero|ra|sp|gp|tp|t[0-6]|s([0-9]|1[01])|a[0-7])\b/g,
    `<span class="tok-reg">$1</span>`
  )
  // Instructions
  code = code.replace(
    /\b(addi?|sub|mul|div|lw|sw|lb|sb|lh|sh|beq|bne|blt|bge|jal|jalr|lui|auipc|ecall|ebreak)\b/gi,
    `<span class="tok-inst">$1</span>`
  )
  // Numbers (decimal + hex)
  code = code.replace(
    /\b-?(0x[\da-fA-F]+|\d+)\b/g,
    `<span class="tok-num">$1</span>`
  )
  editor.innerHTML = code
}
