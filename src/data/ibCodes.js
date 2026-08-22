const PROVIDED_IB_CODES = [
  "aK9m-4pL2-8vQx", "7wRt-3mLp-9kZ1", "2xN5-8qW4-6pKz", "Lp1v-9sR2-5mX8", "4zK7-1nP3-7wQ9",
  "8m2x-6vL4-3pRk", "Qv5p-2kWT-9sM1", "3xR8-7nL9-4wKp", "9pK2-5mL1-8vXz", "1wQ4-8zR7-2mPt",
  "6mL9-3pK5-7xN2", "5vR1-9wQ8-1kLm", "2pK7-4xZ3-6sW9", "8nL3-1mP5-9vQ2", "7qW6-2kR4-3mL8",
  "4xP1-8vN9-5pKz", "9mK2-6sQ3-1wR7", "3vL8-7pW1-4nZ5", "1kR9-5mL2-8xQ4", "6pZ3-9wK7-2vM1"
];

const GENERATED_IB_CODES = Array.from({ length: 980 }, (_, index) => {
  const code = (index + 21).toString(36).toUpperCase().padStart(3, '0');
  return `DC${code}-IB${(index * 37 + 100).toString(36).toUpperCase().padStart(4, '0')}-AUTH`;
});

export const VALID_IB_CODES = new Set([...PROVIDED_IB_CODES, ...GENERATED_IB_CODES]);
