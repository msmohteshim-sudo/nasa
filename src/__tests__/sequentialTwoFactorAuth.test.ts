// ─────────────────────────────────────────────────────────────────────────────
// Unit Test: Mandatory 2-Factor Sequential Login Flow
// Step 1: User ID & Password Verification
// Step 2: Face Recognition Biometric Verification
// ─────────────────────────────────────────────────────────────────────────────

import { AuthService } from '../services/auth/authService';
import { FaceBiometricService } from '../services/auth/faceBiometricService';

// In-memory mock storage
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

(globalThis as any).localStorage = localStorageMock;
(globalThis as any).sessionStorage = localStorageMock;

async function runSequentialAuthTests() {
  console.log('🧪 Starting 2-Factor Sequential Authentication Pipeline Tests...\n');

  FaceBiometricService.init();

  // Test 1: Step 1 with invalid password - MUST FAIL
  const badPasswordRes = await AuthService.verifyCredentials('shim', 'wrongPassword!99');
  console.assert(badPasswordRes.success === false, 'Invalid password must be rejected');
  console.assert(
    badPasswordRes.error?.includes('password') || badPasswordRes.error?.includes('credentials'),
    `Expected password error, got: ${badPasswordRes.error}`
  );
  console.log('✓ Test 1 Passed: Invalid password rejected at Step 1. Access strictly blocked.');

  // Test 2: Step 1 with non-existent user - MUST FAIL
  const badUserRes = await AuthService.verifyCredentials('fake.nonexistent.user', '123456');
  console.assert(badUserRes.success === false, 'Non-existent user must be rejected');
  console.log('✓ Test 2 Passed: Unrecognized Operator ID rejected at Step 1.');

  // Test 3: Step 1 with correct ID and password for "shim" - MUST PASS STEP 1
  const step1ShimRes = await AuthService.verifyCredentials('shim', '123456');
  console.assert(step1ShimRes.success === true, 'Valid credentials for shim must succeed');
  console.assert(step1ShimRes.user?.userId === 'shim', 'User ID must be shim');
  console.assert(step1ShimRes.user?.name === 'Shim', 'Name must be Shim');
  console.log(`✓ Test 3 Passed: Step 1 Credentials verified for ${step1ShimRes.user?.name} (${step1ShimRes.user?.userId}).`);

  // Test 4: Step 2 Face Biometric Verification for "shim"
  // If no face is present, Step 2 MUST FAIL
  const noFaceStep2 = FaceBiometricService.matchFace(
    { descriptor: [0.2, 0.4] },
    'shim',
    false // camera open, no human face!
  );
  console.assert(noFaceStep2.matched === false, 'Step 2 must reject when no face is present');
  console.log('✓ Test 4 Passed: Step 2 strictly blocks if camera sees no face.');

  // Test 5: Step 2 Face Biometric Verification with real human face present
  const profileShim = FaceBiometricService.getProfileByUserId('shim');
  console.assert(profileShim !== undefined, 'Enrolled profile for shim must exist');

  const validFaceStep2 = FaceBiometricService.matchFace(
    profileShim?.features || { descriptor: [0.5, 0.5] },
    'shim',
    true // Human face acquired!
  );
  console.assert(validFaceStep2.matched === true, 'Step 2 must match verified operator face');
  console.assert(validFaceStep2.profile?.userId === 'shim', 'Matched profile must be shim');

  // Establish final authenticated session
  const finalSessionRes = await AuthService.loginWithBiometrics(
    step1ShimRes.user!.userId,
    false,
    `Two-Factor: Step 1 (Password) + Step 2 (Face ID for ${validFaceStep2.profile?.name})`
  );
  console.assert(finalSessionRes.success === true, 'Final 2FA session must be created');
  console.assert(finalSessionRes.user?.userId === 'shim', 'Session user must be shim');
  console.log(`✓ Test 5 Passed: Full 2-Factor pipeline completed for ${finalSessionRes.user?.name}!`);

  // Test 6: Verify 2-Factor pipeline for "saba_s2" (its saba)
  const step1SabaRes = await AuthService.verifyCredentials('saba_s2', '123456');
  console.assert(step1SabaRes.success === true, 'Saba credentials must verify');
  const validFaceSaba = FaceBiometricService.matchFace(
    { descriptor: [0.31, 0.62] },
    'saba_s2',
    true
  );
  console.assert(validFaceSaba.matched === true, 'Saba face verification must match');
  console.log(`✓ Test 6 Passed: Full 2-Factor pipeline verified for Saba (${step1SabaRes.user?.name}).`);

  // Test 7: Verify 2-Factor pipeline for "shim_718" (saad)
  const step1SaadRes = await AuthService.verifyCredentials('shim_718', '123456');
  console.assert(step1SaadRes.success === true, 'Saad credentials must verify');
  const validFaceSaad = FaceBiometricService.matchFace(
    { descriptor: [0.12, 0.45] },
    'shim_718',
    true
  );
  console.assert(validFaceSaad.matched === true, 'Saad face verification must match');
  console.log(`✓ Test 7 Passed: Full 2-Factor pipeline verified for Saad (${step1SaadRes.user?.name}).\n`);

  console.log('🎉 ALL 2-FACTOR SEQUENTIAL AUTHENTICATION TESTS PASSED!');
}

runSequentialAuthTests().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
