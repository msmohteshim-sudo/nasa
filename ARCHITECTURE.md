# ALTRON — Space Mission Vision & Activity Intelligence Architecture

> **Inspiration**: Publicly documented human-spaceflight perception concepts from **NASA Astrobee / ISAAC** (Integrated System for Autonomous and Adaptive Caretaking) and **ISRO Vyommitra / Gaganyaan** ground/on-board operator tracking directions.
> **Scope**: Pure web browser architecture using TensorFlow.js (COCO-SSD + MoveNet), HTML5 Canvas, React, and TypeScript.

---

## 1. System Overview

ALTRON is an advanced, real-time web-based **Space Mission Perception, Activity Intelligence, & Procedure Verification Engine**. It upgrades conventional single-frame camera object detection into a high-level spatial-temporal understanding pipeline for crewed spacecraft and space station environments.

```
                  ┌─────────────────────────────────────────┐
                  │   Camera Input Stream / Simulation      │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    TF.js Multi-Model Inference Engine   │
                  │   (COCO-SSD Object + MoveNet Lightning) │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │  ByteTrack-Style Spatial Multi-Tracker  │
                  │  (IoU + Velocity + Trajectory Trails)   │
                  └────────────────────┬────────────────────┘
                                       │
                ┌──────────────────────┼──────────────────────┐
                │                      │                      │
                ▼                      ▼                      ▼
    ┌──────────────────────┐ ┌───────────────────┐ ┌───────────────────┐
    │ Spatial Zone Engine  │ │ Hand-Object State │ │ Temporal Activity │
    │ (Occupancy & Bounds) │ │  (Micro-Machine)  │ │ Classifier (HAR)  │
    └───────────┬──────────┘ └─────────┬─────────┘ └─────────┬─────────┘
                │                      │                      │
                └──────────────────────┼──────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      Mission Procedure Task Engine      │
                  │  (JSON Verification & Step Progression) │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │  Microgravity Anomaly Detection Engine  │
                  │ (Floating Objects, Zone Breaches, Idle) │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │    Space Control Dashboard & Canvas HUD │
                  └─────────────────────────────────────────┘
```

---

## 2. Core Perception & Intelligence Pipeline

### Stage 1: Person Detection & Multi-Subject Tracking
- Uses **COCO-SSD** to detect human operators.
- Trackers match detections against historical bounding boxes using **Intersection over Union (IoU)** combined with centroid displacement velocity vectors.
- Tracks maintain a state machine: `NEW` ➔ `ACTIVE` ➔ `OCCLUDED` ➔ `RECOVERED` ➔ `LOST`.
- Maintains a 30-frame trajectory trail buffer per subject.

### Stage 2: Human Pose Estimation
- Uses **MoveNet Lightning** (TF.js pose-detection API) to infer 17 keypoint 2D coordinates (head, shoulders, elbows, wrists, hips, knees, ankles).
- Groups keypoints into semantic body regions: Head, Shoulders, Arms, Hands, Torso, Legs.

### Stage 3: Hand Localization & Dual-Wrist Tracking
- Extracts wrist positions from MoveNet landmarks.
- Derives hand bounding boxes anchored to operator wrists.
- Computes hand-to-object spatial proximity vectors.

### Stage 4: Multi-Object Detection & Spatial Tracking
- Uses **COCO-SSD** with custom mapping (`COCO_SPACE_MAP`) to translate consumer labels (`bottle`, `box`, `laptop`, `scissors`, `cellphone`) into space mission terminology (`SAMPLE CONTAINER`, `EXPERIMENT MODULE`, `WORKSTATION`, `EXPERIMENT TOOL`, `IMAGING UNIT`).
- Tracks objects across frames with persistent IDs (`OBJ-01`, `OBJ-02`), computing instantaneous velocity vectors `(dx, dy)`.
- Replaces unanchored simulated fixtures with explicit `isSimulated` transparent metadata tags.

---

## 3. Spatial Zone Reasoning Engine

Spatial zones represent designated 2D/3D operational regions within the spacecraft cabin (defined in normalized relative coordinates `0..1`):

1. **`ZONE_WORKSTATION`** (Workstation Alpha) — Operator command & telemetry console.
2. **`ZONE_EXPERIMENT`** (Payload Experiment Bench) — Microgravity biological & fluidic experiment bench.
3. **`ZONE_CREW`** (Crew Operator Corridor) — Primary astronaut movement corridor.
4. **`ZONE_AIRLOCK`** (Airlock Safety Boundary) — Pressure boundary requiring EVA authorization.

### Zone Occupancy Logic
- Maps normalized zone bounding boxes to canvas pixel coordinates.
- Calculates point-in-polygon containment for person and object centroids.
- Emits structured `ENTER` and `EXIT` events to the telemetry log stream.

---

## 4. Hand-Object Interaction State Machine

Analyzes fine-grained interaction states between operator hands and workspace objects:

```
┌─────────────────┐
│ NO_INTERACTION  │ (Distance > 260px)
└────────┬────────┘
         │ Hand moves closer
         ▼
┌─────────────────┐
│   APPROACHING   │ (Distance 140px - 260px, closing distance)
└────────┬────────┘
         │ Distance < 140px
         ▼
┌─────────────────┐
│     CONTACT     │ (Proximity touch, low motion)
└────────┬────────┘
         │ Overlap + Hand motion
         ▼
┌─────────────────┐
│    GRABBING     │ (Overlap initial frame)
└────────┬────────┘
         │ Overlap sustained > 500ms
         ▼
┌─────────────────┐      Hand moves object     ┌─────────────────┐
│     HOLDING     │ ─────────────────────────► │     MOVING      │
└────────┬────────┘                            └────────┬────────┘
         │                                              │
         └──────────────────────┬───────────────────────┘
                                │ Overlap ends
                                ▼
                       ┌─────────────────┐
                       │    RELEASING    │
                       └────────┬────────┘
                                │ Distance increasing
                                ▼
                       ┌─────────────────┐
                       │    RELEASED     │
                       └─────────────────┘
```

---

## 5. Mission Task Verification Engine

Dynamic procedure verification engine driven by structured JSON procedure definitions:

- **JSON Procedure Specs**: Defines procedure steps with criteria (`targetZone`, `targetObject`, `requiredInteraction`, `requiredAction`, `minDurationSec`).
- **Real-Time Step Evaluation**:
  - Automatically verifies step criteria against current frame vision result.
  - Updates step status (`PENDING` ➔ `IN_PROGRESS` ➔ `COMPLETED`).
  - Computes overall procedure completion percentage (0–100%).
- **Manual Overrides**: Allows operator verification, error simulation (`WRONG_STEP`), or step skipping for testing.

---

## 6. Microgravity Anomaly Detection Engine

Detects potential spacecraft safety anomalies in real time:

1. **`FLOATING_OBJECT` Alert**: Detects objects with velocity `> 3.5px/frame` that have **no hand contact or interaction** for `> 5 consecutive frames` (simulating microgravity unanchored drift).
2. **`ZONE_VIOLATION` Alert**: Detects unauthorized crew presence inside restricted safety zones (e.g. Airlock Safety Boundary).
3. **`INACTIVITY_ALERT`**: Triggers when zero operator motion is detected for `> 20 seconds` during an active procedure.

---

## 7. Interactive Demo Scenario Engine

Provides 7 pre-configured simulation scenarios allowing full end-to-end evaluation without physical webcam hardware:

1. **Biological Sample Inoculation Procedure** (`SCENARIO_EXP_RUN`)
2. **Microgravity Floating Object Anomaly** (`SCENARIO_FLOATING_OBJECT`)
3. **Airlock Safety Zone Breach** (`SCENARIO_AIRLOCK_SAFETY`)
4. **Fluidic Controller Maintenance** (`SCENARIO_FLUIDIC_CALIBRATION`)
5. **Multi-Crew Cooperative Operations** (`SCENARIO_MULTI_CREW`)
6. **Precision Microgravity Sample Transfer** (`SCENARIO_SAMPLE_HANDLING`)
7. **Operator Inactivity & Vigilance Alert** (`SCENARIO_INACTIVITY`)

---

## 8. Disclaimer & Honesty Labeling

- **Pure Frontend Execution**: Runs completely inside client browser via TensorFlow.js; no secret server backends.
- **Vision Estimates**: All spatial coordinates are relative screen-space estimates (not calibrated millimeter metrics).
- **Inspiration Only**: Inspired by concepts in NASA Astrobee/ISAAC and ISRO Vyommitra publications; not certified flight software.
