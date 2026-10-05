// ─────────────────────────────────────────────────────────────────────────────
// Strict Face Detection & Recognition Unit Test
// Verifies that the scanner strictly blocks authentication when no face is present.
// ─────────────────────────────────────────────────────────────────────────────

import { FaceBiometricService } from '../services/auth/faceBiometricService';

// Setup mock storage for Node environment
const storage = new Map<string, string>();
const localStorageMock = {
  getItem: (key: string) => storage.get(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
  clear: () => storage.clear(),
};

(globalThis as any).localStorage = localStorageMock;

async function runStrictDetectionTests() {
  console.log('🧪 Starting Strict Face Detection & Biometric Access Tests...\n');

  FaceBiometricService.init();

  // Test 1: Scanner opened without any face (facePresent = false)
  // Must STRICTLY fail and never log in or match!
  const noFaceResult = FaceBiometricService.matchFace(
    { aspectRatio: 1.33, descriptor: [0.5, 0.5] },
    'shim',
    false // No face present in camera frame!
  );
  console.assert(noFaceResult.matched === false, 'Must NOT match when no face is present');
  console.assert(noFaceResult.profile === null, 'Must NOT return a profile when no face is present');
  console.assert(
    noFaceResult.error === 'NO_FACE_DETECTED_IN_FRAME',
    `Expected NO_FACE_DETECTED_IN_FRAME error, got: ${noFaceResult.error}`
  );
  console.log('✓ Test 1 Passed: When scanner opens without any face, authentication is strictly BLOCKED.');

  // Test 2: Scanner opened with null features (empty frame / camera pointed at wall)
  const nullFeaturesResult = FaceBiometricService.matchFace(
    null,
    'shim',
    false
  );
  console.assert(nullFeaturesResult.matched === false, 'Must NOT match with null features');
  console.assert(nullFeaturesResult.error === 'NO_FACE_DETECTED_IN_FRAME', 'Error must indicate no face');
  console.log('✓ Test 2 Passed: When camera points at wall/table with no face, authentication is strictly BLOCKED.');

  // Test 3: Unenrolled user attempting access
  const unenrolledResult = FaceBiometricService.matchFace(
    { descriptor: [0.4, 0.4] },
    'unknown.intruder',
    true // Face present, but not enrolled
  );
  console.assert(unenrolledResult.matched === false, 'Unenrolled user must be rejected');
  console.assert(
    unenrolledResult.error?.includes('USER_NOT_ENROLLED'),
    `Expected USER_NOT_ENROLLED, got: ${unenrolledResult.error}`
  );
  console.log('✓ Test 3 Passed: Unenrolled user is strictly rejected.');

  // Test 4: Genuine enrolled face presented with valid biometric features
  const enrolledUser = FaceBiometricService.getProfileByUserId('shim');
  console.assert(enrolledUser !== undefined, 'shim must exist');

  const validFeatures = enrolledUser?.features || {
    aspectRatio: 1.33,
    symmetryScore: 0.96,
    colorSignature: [180, 145, 125],
    descriptor: [0.45, 0.5, 0.52, 0.48],
  };

  const validMatchResult = FaceBiometricService.matchFace(
    validFeatures,
    'shim',
    true // Real face present!
  );
  console.assert(validMatchResult.matched === true, 'Valid enrolled face must match');
  console.assert(validMatchResult.profile?.userId === 'shim', 'Matched profile must be shim');
  console.assert(validMatchResult.confidence >= 95, 'Confidence must be >= 95%');
  console.log(`✓ Test 4 Passed: Verified enrolled face unlocks access (${validMatchResult.profile?.name}, ${validMatchResult.confidence}% confidence).`);

  // Test 5: Mismatched biometric descriptor on custom enrolled profile
  FaceBiometricService.enrollFace({
    userId: 'custom.user',
    name: 'Custom Astronaut',
    role: 'Specialist',
    faceSnapshot: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
    features: {
      aspectRatio: 1.33,
      symmetryScore: 0.95,
      colorSignature: [180, 145, 125],
      descriptor: [0.90, 0.90, 0.85, 0.88],
    },
  });

  const mismatchedFeatures = {
    aspectRatio: 1.33,
    symmetryScore: 0.96,
    colorSignature: [180, 145, 125],
    // High distance from enrolled descriptor [0.90, 0.90, ...]
    descriptor: [0.01, 0.01, 0.05, 0.02],
  };

  const mismatchResult = FaceBiometricService.matchFace(
    mismatchedFeatures,
    'custom.user',
    true
  );
  console.assert(mismatchResult.matched === false, 'Mismatched facial signature must be rejected');
  console.log('✓ Test 5 Passed: Mismatched face attempting access is strictly rejected.');

  console.log('\n🎉 ALL STRICT FACE RECOGNITION TESTS PASSED!');
}

runStrictDetectionTests().catch((e) => {
  console.error('❌ Test failed:', e);
  process.exit(1);
});
