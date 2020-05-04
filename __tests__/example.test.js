function soma(a, b) {
  return a + b;
}

test('testa soma', () => {
  const result = soma(3, 4);
  expect(result).toBe(7);
});
