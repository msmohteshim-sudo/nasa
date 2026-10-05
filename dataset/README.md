# ALTRON — Temporal Human Activity Recognition Dataset Specification
## SIH26174 — AI Human Activity Recognition for On-Board BAS Experiments

### 1. Overview
This dataset architecture establishes standard procedural action segments for training, validating, and testing Temporal Human Activity Recognition (Temporal HAR) neural models (Temporal CNNs, LSTMs, GRUs, or Spatial-Temporal Graph Convolutional Networks / ST-GCN) on microgravity biological observation workflows.

### 2. Canonical Action Classes (11 Classes)
Each action corresponds to a canonical step in the Microgravity Biological Observation experiment:
1. `initialize`: Setting up workstation, booting sensors, clearing payload deck.
2. `retrieve`: Approaching sample rack, grasping module, displacing from fixture.
3. `verify`: Inspecting RFID/barcode, checking sample seal status, visual confirmation.
4. `position`: Aligning module onto workstation dock, seating in fixture.
5. `secure`: Clamping latch, locking quick-release pins, ensuring mechanical retention.
6. `prepare`: Opening chamber seal, preparing observation lighting/mirrors.
7. `transfer`: Moving specimen carrier into active observation path.
8. `align`: Calibrating optical axis, focusing microscope/camera lens.
9. `observe`: Initiating automated bio-luminescence or cellular imaging sequence.
10. `record`: Entering observation notes into mission payload log, saving telemetry.
11. `stow`: Unclamping module, returning to cold-stowage lockbox, securing latches.

### 3. Directory Layout
```
dataset/
├── README.md
├── metadata_schema.json
├── train/
│   ├── initialize/
│   ├── retrieve/
│   ├── verify/
│   ├── position/
│   ├── secure/
│   ├── prepare/
│   ├── transfer/
│   ├── align/
│   ├── observe/
│   ├── record/
│   └── stow/
├── validation/
│   ├── initialize/
│   ├── ... (same 11 classes)
│   └── stow/
└── test/
    ├── initialize/
    ├── ... (same 11 classes)
    └── stow/
```

### 4. Sequence Recording Guidelines & Variations
To ensure cross-operator and environmental generalization, recordings must incorporate:
- **Operator Variation**: Different astronauts/operators (anthropometric differences, handedness).
- **Execution Speed**: Nominal speed (1.0x), cautious deliberate speed (0.6x), rapid speed (1.4x).
- **Clothing / PPE**: Flight overalls, nitrile gloves, thermal gloves.
- **Lighting Conditions**: Nominal payload bay illumination (500 lux), dim mode (150 lux), high-contrast emergency lighting.
- **Camera Angles**: Overhead mounted (0° pitch), oblique 45° angle, side inspection angle.
- **Partial Occlusion**: Hand partially blocked by equipment frame or forearm overlap.

### 5. Temporal Annotation Schema
Each recording segment is accompanied by a `<clip_id>_meta.json` adhering to `metadata_schema.json`.
