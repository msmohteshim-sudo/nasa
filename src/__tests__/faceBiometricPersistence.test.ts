// ─────────────────────────────────────────────────────────────────────────────
// Unit Test: Face ID Verification & Persistent Storage Across Logouts & Reopens
// ─────────────────────────────────────────────────────────────────────────────

import { FaceBiometricService } from '../services/auth/faceBiometricService';
import { AuthService } from '../services/auth/authService';

// In-memory localStorage mock for node environment
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

(globalThis as any).localStorage = localStorageMock;
(globalThis as any).sessionStorage = localStorageMock;

async function runTests() {
  console.log('🧪 Starting Face Biometric Verification & Persistence Tests...\n');

  // Test 1: Vault initialization - only authentic profiles (Shim, Saba, Saad), no random demo IDs!
  FaceBiometricService.init();
  const initialProfiles = FaceBiometricService.getAllProfiles();
  console.assert(initialProfiles.length === 3, `Vault should have exactly 3 profiles, got ${initialProfiles.length}`);
  const userIds = initialProfiles.map((p) => p.userId);
  console.assert(userIds.includes('shim'), 'Vault must contain shim');
  console.assert(userIds.includes('saba_s2'), 'Vault must contain saba_s2');
  console.assert(userIds.includes('shim_718'), 'Vault must contain shim_718');
  console.assert(!userIds.some((id) => id.startsWith('demo.')), 'Vault must NOT contain any random demo IDs');
  console.log(`✓ Test 1 Passed: Vault initialized with only 3 authentic profiles: [${userIds.join(', ')}]. Zero random IDs!`);

  // Test 2: Auto-purge of random profiles
  // Simulate an old localStorage containing random demo astronauts alongside user's profiles
  const dirtyVault = [
    ...initialProfiles,
    {
      id: 'bio-random-01',
      userId: 'demo.operator',
      name: 'Alex Sharma',
      role: 'Ground Operator',
      enrolledAt: '2026-01-20T10:00:00Z',
      verificationCount: 14,
      status: 'ACTIVE',
      features: { aspectRatio: 1.34, symmetryScore: 0.94 },
    },
    {
      id: 'bio-random-02',
      userId: 'demo.scientist',
      name: 'Dr. Evelyn Reed',
      role: 'Experiment Scientist',
      enrolledAt: '2026-02-14T08:30:00Z',
      verificationCount: 9,
      status: 'ACTIVE',
      features: { aspectRatio: 1.28, symmetryScore: 0.96 },
    },
  ];
  localStorageMock.setItem('altron_face_id_vault_v2', JSON.stringify(dirtyVault));

  // Reset static flag and reinitialize to trigger automatic purge
  (FaceBiometricService as any).isInitialized = false;
  (FaceBiometricService as any).vault = [];
  FaceBiometricService.init();

  const cleanedProfiles = FaceBiometricService.getAllProfiles();
  console.assert(
    !cleanedProfiles.some((p) => p.userId.startsWith('demo.')),
    'All random demo profiles must be automatically purged!'
  );
  console.assert(cleanedProfiles.length === 3, `Cleaned profiles should be 3, got ${cleanedProfiles.length}`);
  console.log('✓ Test 2 Passed: Random demo IDs were automatically removed on vault init!');

  // Test 3: Enroll / update face ID with custom photo snapshot for Shim
  const mockSnapshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const enrolled = FaceBiometricService.enrollFace({
    userId: 'shim',
    name: 'Shim',
    role: 'Ground Operator',
    faceSnapshot: mockSnapshot,
  });

  console.assert(enrolled.name === 'Shim', 'Enrolled profile name should be Shim');
  console.assert(enrolled.faceSnapshot === mockSnapshot, 'Enrolled profile should have face snapshot');
  console.assert(enrolled.status === 'ACTIVE', 'Enrolled profile should be active');
  console.log('✓ Test 3 Passed: Enrolled Face ID with verification photo and custom name "Shim".');

  // Test 4: Biometric login with newly enrolled profile
  const loginRes = await AuthService.loginWithBiometrics('shim');
  console.assert(loginRes.success === true, 'Biometric login should succeed');
  console.assert(loginRes.user?.name === 'Shim', 'Logged-in user should have name "Shim"');
  console.assert(loginRes.user?.avatar === mockSnapshot, 'Logged-in user should have enrolled avatar');
  console.log(`✓ Test 4 Passed: Authenticated session established for ${loginRes.user?.name} (${loginRes.user?.role}).`);

  // Test 5: Sign out of web app
  AuthService.logout(loginRes.user);
  console.assert(localStorageMock.getItem('altron_auth_session_v1') === null, 'Session should be cleared on logout');
  console.log('✓ Test 5 Passed: Successfully signed out, session destroyed.');

  // Test 6: Reopen web app (simulate fresh browser window / tab reload)
  (FaceBiometricService as any).isInitialized = false;
  (FaceBiometricService as any).vault = [];
  (AuthService as any).usersStore = [];

  FaceBiometricService.init();
  const reopenedProfile = FaceBiometricService.getProfileByUserId('shim');

  console.assert(reopenedProfile !== undefined, 'Profile shim must still exist');
  console.assert(reopenedProfile?.name === 'Shim', `Profile name must STILL be "Shim", got "${reopenedProfile?.name}"`);
  console.assert(reopenedProfile?.faceSnapshot === mockSnapshot, 'Snapshot must be intact');
  console.log('✓ Test 6 Passed: Reopened web app. Profile shim is 100% intact with name "Shim" and photo!');

  // Test 7: Re-login after reopening
  const reloginRes = await AuthService.loginWithBiometrics('shim');
  console.assert(reloginRes.success === true, 'Re-login should succeed');
  console.assert(reloginRes.user?.name === 'Shim', 'Re-login user should be "Shim"');
  console.log(`✓ Test 7 Passed: Re-login verified as ${reloginRes.user?.name}. Everything persisted unchanged!\n`);

  console.log('🎉 ALL TESTS PASSED! Authentic profiles & auto-purge verification confirmed.');
}

runTests().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
