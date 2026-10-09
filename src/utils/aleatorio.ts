export function inteiroAleatorio(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function sortearIndices(total: number, quantidade: number): number[] {
  if (quantidade > total) {
    throw new Error(`Não é possível sortear ${quantidade} índices de um total de ${total}`);
  }

  const indices = Array.from({ length: total }, (_, i) => i); // [0, 1, 2, ..., total-1]

  for (let i = indices.length - 1; i > 0; i--) {
    const j = inteiroAleatorio(0, i);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, quantidade);
}