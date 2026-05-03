// Mock AsyncStorage so zustand persist middleware doesn't blow up under Jest.
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Silence noisy NativeModule warnings during tests.
jest.spyOn(console, 'warn').mockImplementation(() => {});
