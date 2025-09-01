/**
 * Jest Test Setup
 * Global test configuration and mocks
 */

require('@testing-library/jest-dom');

// Mock Firebase
global.firebase = {
  auth: jest.fn(() => ({
    onAuthStateChanged: jest.fn(),
    createUserWithEmailAndPassword: jest.fn(),
    signInWithEmailAndPassword: jest.fn(),
    signOut: jest.fn(),
    currentUser: null
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(),
        set: jest.fn(),
        update: jest.fn()
      })),
      add: jest.fn(),
      where: jest.fn(() => ({
        limit: jest.fn(() => ({
          get: jest.fn()
        }))
      }))
    })),
    FieldValue: {
      serverTimestamp: jest.fn()
    }
  }))
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.sessionStorage = sessionStorageMock;

// Mock window methods
global.window.location = {
  href: 'http://localhost',
  search: '',
  pathname: '/',
  reload: jest.fn()
};

// Mock DOM methods
global.document.addEventListener = jest.fn();
global.document.querySelector = jest.fn();
global.document.querySelectorAll = jest.fn(() => []);
global.document.getElementById = jest.fn();
global.document.createElement = jest.fn(() => ({
  className: '',
  textContent: '',
  addEventListener: jest.fn(),
  appendChild: jest.fn(),
  remove: jest.fn(),
  style: {}
}));

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
});

// Global test utilities
global.testUtils = {
  createMockUser: (type = 'player') => ({
    uid: 'test-uid-123',
    name: 'Test User',
    email: 'test@example.com',
    type: type,
    createdAt: new Date(),
    ...(type === 'player' && {
      age: 18,
      position: 'midfielder',
      dominantFoot: 'right',
      level: 'intermediate'
    }),
    ...(type === 'scout' && {
      club: 'Test Club',
      position: 'Head Scout'
    })
  }),
  
  createMockFirebaseUser: () => ({
    uid: 'firebase-uid-123',
    email: 'test@example.com',
    displayName: 'Test User'
  }),
  
  simulateAuthStateChange: (authManager, user) => {
    authManager.handleAuthStateChange(user);
  },
  
  waitFor: (ms = 100) => new Promise(resolve => setTimeout(resolve, ms))
};
