export interface CanonicalProcedureStep {
  id: number; // 1 to 10
  stepNumber: string; // "01" to "10"
  title: string;
  code: string;
  action: string;
  expectedAction: string;
  observedAction: string;
  duration: string;
  expectedDuration: string;
  confidence: number; // percentage e.g. 96
  status: 'completed' | 'active' | 'pending' | 'skipped' | 'wrong';
  timestamp?: string;
  description: string;
}

export interface CanonicalExperiment {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  prototypeType: string;
  status: string;
  disclaimer: string;
  totalSteps: number;
  completedStepsCount: number;
  currentStepIndex: number; // 0-indexed, e.g. 3 for step 4
  steps: CanonicalProcedureStep[];
  objects: { label: string; confidence: number; color: string; status: string }[];
  pipelineStages: { stage: string; desc: string }[];
}

export const CANONICAL_EXPERIMENT: CanonicalExperiment = {
  id: 'exp-microgravity-bio-01',
  title: 'Microgravity Biological Observation',
  subtitle: 'Representative Biological Sample Experiment',
  category: 'Human Spaceflight / Microgravity Research',
  prototypeType: 'AI Procedural Verification Demonstration',
  status: 'SIMULATION / RESEARCH PROTOTYPE',
  disclaimer: 'Representative prototype workflow inspired by documented microgravity research. This is not an official ISRO flight procedure or operational SOP.',
  totalSteps: 10,
  completedStepsCount: 3,
  currentStepIndex: 3, // Step 4 active
  steps: [
    {
      id: 1,
      stepNumber: '01',
      title: 'Initialize experiment workstation',
      code: 'PROC_01_INIT',
      action: 'Initialize Workstation',
      expectedAction: 'Initialize Workstation',
      observedAction: 'Initialize Workstation',
      duration: '01:12',
      expectedDuration: '01:30',
      confidence: 96,
      status: 'completed',
      timestamp: '12:41:05',
      description: 'Power on workstation illumination, initialize digital sensor interfaces, and verify clean workspace telemetry.',
    },
    {
      id: 2,
      stepNumber: '02',
      title: 'Retrieve biological experiment module',
      code: 'PROC_02_FETCH',
      action: 'Retrieve Experiment Module',
      expectedAction: 'Retrieve Experiment Module',
      observedAction: 'Retrieve Experiment Module',
      duration: '02:04',
      expectedDuration: '02:00',
      confidence: 94,
      status: 'completed',
      timestamp: '12:41:08',
      description: 'Unlatch thermal containment chamber A, extract the sealed biological specimen cassette, and verify seal latching.',
    },
    {
      id: 3,
      stepNumber: '03',
      title: 'Verify module identification and experiment status',
      code: 'PROC_03_VERIFY_ID',
      action: 'Verify Module Identification',
      expectedAction: 'Verify Module Identification',
      observedAction: 'Verify Module Identification',
      duration: '01:45',
      expectedDuration: '01:30',
      confidence: 98,
      status: 'completed',
      timestamp: '12:41:11',
      description: 'Scan specimen barcode / RFID badge with optical camera system and confirm payload metadata matches active protocol.',
    },
    {
      id: 4,
      stepNumber: '04',
      title: 'Secure experiment module in the workstation fixture',
      code: 'PROC_04_SECURE',
      action: 'Secure Module in Fixture',
      expectedAction: 'Secure Module in Fixture',
      observedAction: 'Secure Module in Fixture',
      duration: '01:15 in progress',
      expectedDuration: '02:00',
      confidence: 95,
      status: 'active',
      timestamp: '12:41:22',
      description: 'Align the biological cassette base plate with the microgravity magnetic workstation fixture and engage retention clamps.',
    },
    {
      id: 5,
      stepNumber: '05',
      title: 'Prepare the observation chamber',
      code: 'PROC_05_PREP_CHAMBER',
      action: 'Prepare Observation Chamber',
      expectedAction: 'Prepare Observation Chamber',
      observedAction: 'Pending',
      duration: 'Pending',
      expectedDuration: '01:45',
      confidence: 0,
      status: 'pending',
      description: 'Slide micro-fluidic light barrier, adjust internal LED illumination matrix to 450nm excitation wavelength.',
    },
    {
      id: 6,
      stepNumber: '06',
      title: 'Transfer the sealed sample module into the observation position',
      code: 'PROC_06_TRANSFER',
      action: 'Transfer Sample Module',
      expectedAction: 'Transfer Sample Module',
      observedAction: 'Pending',
      duration: 'Pending',
      expectedDuration: '02:15',
      confidence: 0,
      status: 'pending',
      description: 'Slide sample slide carrier into optical path port 01 until tactile detent lock engages.',
    },
    {
      id: 7,
      stepNumber: '07',
      title: 'Position the imaging / observation unit',
      code: 'PROC_07_ALIGN_IMAGER',
      action: 'Position Imaging Unit',
      expectedAction: 'Position Imaging Unit',
      observedAction: 'Pending',
      duration: 'Pending',
      expectedDuration: '02:00',
      confidence: 0,
      status: 'pending',
      description: 'Mount high-resolution digital macroscope unit on multi-axis micro-stage and establish focus baseline.',
    },
    {
      id: 8,
      stepNumber: '08',
      title: 'Capture the required observation',
      code: 'PROC_08_CAPTURE',
      action: 'Capture Observation',
      expectedAction: 'Capture Observation',
      observedAction: 'Pending',
      duration: 'Pending',
      expectedDuration: '01:30',
      confidence: 0,
      status: 'pending',
      description: 'Trigger multi-spectral image capture sequence across 5 focal planes and store raw frames in local buffer.',
    },
    {
      id: 9,
      stepNumber: '09',
      title: 'Record the observation in the experiment log',
      code: 'PROC_09_LOG',
      action: 'Record Observation',
      expectedAction: 'Record Observation',
      observedAction: 'Pending',
      duration: 'Pending',
      expectedDuration: '01:15',
      confidence: 0,
      status: 'pending',
      description: 'Commit image dataset checksum and operator field notes to the cryptographic experiment audit ledger.',
    },
    {
      id: 10,
      stepNumber: '10',
      title: 'Secure and stow the experiment module',
      code: 'PROC_10_STOW',
      action: 'Stow Experiment Module',
      expectedAction: 'Stow Experiment Module',
      observedAction: 'Pending',
      duration: 'Pending',
      expectedDuration: '02:30',
      confidence: 0,
      status: 'pending',
      description: 'Disengage retention clamps, return specimen cassette to 4°C storage rack, and close containment door.',
    },
  ],
  objects: [
    { label: 'PERSON', confidence: 0.98, color: '#3b82f6', status: 'Detected' },
    { label: 'HAND', confidence: 0.96, color: '#10b981', status: 'Detected' },
    { label: 'EXPERIMENT MODULE', confidence: 0.95, color: '#002244', status: 'Detected' },
    { label: 'SAMPLE CONTAINER', confidence: 0.92, color: '#8b5cf6', status: 'Detected' },
    { label: 'OBSERVATION CHAMBER', confidence: 0.94, color: '#06b6d4', status: 'Detected' },
    { label: 'IMAGING UNIT', confidence: 0.91, color: '#f59e0b', status: 'Detected' },
    { label: 'WORKSTATION FIXTURE', confidence: 0.97, color: '#64748b', status: 'Detected' },
  ],
  pipelineStages: [
    { stage: 'Camera', desc: 'Frame capture' },
    { stage: 'Human Detection', desc: 'Operator detection' },
    { stage: 'Hand / Pose', desc: 'Keypoint tracking' },
    { stage: 'Object Detection', desc: 'Experiment objects' },
    { stage: 'Interaction', desc: 'Human-object contact' },
    { stage: 'Action Recognition', desc: 'Activity recognition' },
    { stage: 'Procedure Engine', desc: 'Expected sequence' },
    { stage: 'Verification', desc: 'Correct / wrong' },
    { stage: 'Next-Step Guidance', desc: 'Next-step instruction' },
    { stage: 'Voice Alert', desc: 'Synthesized voice' },
    { stage: 'Evidence', desc: 'Timestamped record' },
  ],
};
