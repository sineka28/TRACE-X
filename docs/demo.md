# TRACE-X Hackathon 2–3 Minute Demonstration Guide

Follow this streamlined script to showcase TRACE-X during a live hackathon evaluation.

---

### Step 1: Login & Access (15 seconds)
1. Navigate to `http://localhost:5173/login`.
2. Point out the enterprise authentication screen.
3. Click **"Sign In as Dr. Alex Rivera (Demo)"** for instant one-click evaluator access.

---

### Step 2: Dashboard Overview (20 seconds)
1. You land on `/dashboard`.
2. Point out the compact metrics:
   - **Active Investigations**
   - **Evidence Sources**
   - **Unknown Gaps**
   - **Competing Hypotheses**
3. Highlight the prominent **"SYNTHETIC DEMO DATA: Campus Parking Incident"** banner.
4. Click on **Campus Parking Incident** to open the master investigation command center.

---

### Step 3: Fragmented Multi-Modal Evidence (20 seconds)
1. Click the **"Evidence Sources"** tab.
2. Show the multi-modal evidence items:
   - Fixed PTZ Camera A (North Parking Gate)
   - Wall-mounted Camera B (Row B Perimeter)
   - Corridors Camera C (Building B Stairwell)
   - Service Van 7X-882 Fleet Telematics / CAN-bus
   - Restricted Gate 2 RFID Badge Terminal
   - Perimeter Ground Vibration Sensor MS-04
3. Point out that raw evidence is fragmented with no continuous recording.

---

### Step 4: Run Analytical Pipeline (15 seconds)
1. Click the prominent primary CTA **"Run Analysis"** in the top right.
2. The modal executes the 12-step real backend pipeline:
   - *1. Ingesting Evidence*
   - *2. Extracting Events*
   - *3. Normalizing Timestamps*
   - *4. Building Timeline*
   - *5. Detecting Unknown Gaps*
   - *6. Generating Hypotheses*
   - *7. Formulating Expected Evidentiary Conditions*
   - *8. Comparing Expected vs Actual*
   - *9. Detecting Conflicts*
   - *10. Running Counterfactual Analysis*
   - *11. Identifying Next-Best Evidence*
   - *12. Building Multi-Modal Evidence Graph*
3. Click **"View Insights"**.

---

### Step 5: Unified Timeline & Critical Unknown Gap (25 seconds)
1. Switch to the **"Unified Timeline"** tab.
2. Show the chronological stream from `10:02:11` to `10:02:34`.
3. Draw attention to the visually prominent **UNKNOWN GAP (10:02:18 → 10:02:27)**:
   - *Person A disappears from Camera B at 10:02:18.*
   - *Person A reappears on Camera C at 10:02:27.*
   - *Duration: 9 seconds.*
4. Click the gap to open the **Forensic Uncertainty Drawer**.
5. Explain: *"TRACE-X refuses to hallucinate what happened in these 9 unobserved seconds. Instead, it formulates competing hypotheses."*

---

### Step 6: Competing Hypotheses & Epistemic Honesty (25 seconds)
1. Switch to the **"Hypotheses"** tab.
2. Review the 3 competing interpretations:
   - **H1: Authorized Fast Transit / Cut-Through** (Score: 68.5%)
   - **H2: Rapid Equipment Retrieval / Vehicle Access** (Score: 54.0%)
   - **H3: Staging for Co-Conspirator Handoff at Gate 2** (Score: 42.0%)
3. Emphasize: *"Notice these scores are explicitly labeled HEURISTIC REASONING SCORES, avoiding false claims of mathematical probability."*

---

### Step 7: Expected vs Actual Matrix & "What Would Change My Mind?" (25 seconds)
1. Click on **H1 (Authorized Fast Transit)** to select it.
2. Switch to **"Expected vs Actual"**:
   - Left column shows predicted evidentiary conditions.
   - Right column shows actual status: `MISSING`, `CONTRADICTED`, `FOUND`, `PARTIAL`.
3. Switch to **"What Would Change My Mind"**:
   - Show how TRACE-X generates:
     - **Strengthening Evidence**
     - **Weakening Evidence**
     - **Contradicting / Falsifying Evidence**
     - **Distinguishing Evidence**

---

### Step 8: Next-Best Evidence & Evidence Graph (25 seconds)
1. Switch to **"Next-Best Evidence"**:
   - Highlight **Camera C3 Local SD Card (92% Heuristic Information Value)**.
   - Explain: *"Even though network streaming was offline, extracting physical SD card footage from Pole 12 would immediately distinguish H1 from H2."*
   - Click **"Investigate Evidence"** to trigger requisition.
2. Switch to **"Evidence Graph"**:
   - Show the interactive React Flow canvas (nodes for Sources, Events, Gaps, Hypotheses, Expected Items, and Next-Best Targets).
   - Pan, zoom, and click any node to show the inspector drawer.

---

### Step 9: Investigation Synthesis Report (15 seconds)
1. Switch to the **"Report"** tab.
2. Show the formal synthesized investigation report containing all sections: Executive Overview, Observed Events, Unknown Gaps, Hypotheses, Limitations, AI Disclosure, and Legal Disclaimer.
3. Click **"Print / PDF"** or **"Export JSON"**.
