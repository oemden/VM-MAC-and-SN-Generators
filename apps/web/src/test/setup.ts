import '@testing-library/jest-dom'

// Mock localStorage for jsdom
const localStorageMock = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
  clear: () => {},
  length: 0,
  key: () => null
}
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock })

// Mock matchMedia for theme detection
Object.defineProperty(window, 'matchMedia', {
  value: () => ({ matches: false, addListener: () => {}, removeListener: () => {} }),
  writable: true
})
