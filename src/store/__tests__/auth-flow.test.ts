import { useAuthStore } from '../useAuthStore';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`❌ TEST FAILED: ${message}`);
  }
}

console.log('🧪 Starting Authentication & Security Flow Test Suite...\n');

// 1. Initial State
const state1 = useAuthStore.getState();
assert(state1.isUnlocked === false, 'Vault must initially be locked');
console.log('✅ Passed: Initial locked state verified.');

// 2. Direct Unlock
useAuthStore.getState().unlockVault();
assert(useAuthStore.getState().isUnlocked === true, 'Vault must be unlocked after unlockVault()');
console.log('✅ Passed: unlockVault() transition verified.');

// 3. Direct Lock
useAuthStore.getState().lockVault();
assert(useAuthStore.getState().isUnlocked === false, 'Vault must be locked after lockVault()');
console.log('✅ Passed: lockVault() transition verified.');

// 4. PIN Modal
useAuthStore.getState().openPinModal();
assert(useAuthStore.getState().isPinModalVisible === true, 'PIN modal must be visible');
useAuthStore.getState().closePinModal();
assert(useAuthStore.getState().isPinModalVisible === false, 'PIN modal must be closed');
console.log('✅ Passed: PIN modal open/close verified.');

// 5. PIN Verification (Async)
async function testPinAuth() {
  // Test wrong PIN
  const wrongResult = await useAuthStore.getState().verifyPin('9999');
  assert(wrongResult === false, 'Wrong PIN must return false');
  assert(useAuthStore.getState().isUnlocked === false, 'Vault must remain locked on wrong PIN');
  assert(useAuthStore.getState().pinError !== null, 'pinError must be set on wrong PIN');
  console.log('✅ Passed: Incorrect PIN rejection verified.');

  // Test correct default PIN (1234)
  const correctResult = await useAuthStore.getState().verifyPin('1234');
  assert(correctResult === true, 'Correct PIN must return true');
  assert(useAuthStore.getState().isUnlocked === true, 'Vault must be unlocked on correct PIN');
  assert(useAuthStore.getState().isPinModalVisible === false, 'PIN modal must auto-close');
  assert(useAuthStore.getState().pinError === null, 'pinError must be cleared on correct PIN');
  console.log('✅ Passed: Correct PIN unlock verified.');

  console.log('\n🎉 ALL AUTHENTICATION FLOW TESTS PASSED! 🚀');
}

testPinAuth().catch((err) => {
  console.error(err);
  process.exit(1);
});
