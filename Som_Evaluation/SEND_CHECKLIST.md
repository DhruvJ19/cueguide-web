# Send Checklist — Som Evaluation Package

## Step-by-step execution order:

### 1. BUILD (Claude Code)
- [ ] Open Claude Code
- [ ] Point it at `CUEGUIDE_BUILD_SPEC.md` — use the Claude Code instruction block at the bottom
- [ ] Let it build the Vite + React app
- [ ] Test locally: `npm run dev` → walk through both views (Caregiver + Patient Focus Mode)
- [ ] Fix anything that feels off

### 2. DEPLOY
- [ ] Push to Vercel: `vercel --prod` (or Netlify)
- [ ] Test the live URL — make sure it loads clean, no console errors
- [ ] Copy the URL

### 3. CONVERT DOCS TO PDF
- [ ] Convert `DELIVERABLE_1_Agile_Feature_Spec.md` → `CueGuide_Feature_Spec.pdf`
- [ ] Convert `DELIVERABLE_2_Technical_Architecture.md` → `CueGuide_Technical_Architecture.pdf`
- [ ] Quick-check both PDFs look clean (tables render, code blocks readable)

### 4. SEND EMAIL
- [ ] Open `EMAIL_DRAFT.md`
- [ ] Replace `[INSERT_DEPLOYED_URL_HERE]` with your Vercel URL
- [ ] Delete everything below the "---" (the "INSTRUCTIONS FOR DHRUV" section)
- [ ] Send from **dhruv@robossist.com**
- [ ] To: som.gollakota@adaptailabs.ai
- [ ] CC: Suman (recommended)
- [ ] Attach both PDFs
- [ ] Hit send

### 5. FOLLOW UP (Same Day)
- [ ] Text Suman on WhatsApp: "Hey, just sent Som the evaluation deliverables. Put together a feature spec, technical architecture, and a working demo. Let me know if you want to take a look."
- [ ] This signals to Suman: Dhruv delivers. Fast.

---

## File inventory:

```
Som_Evaluation/
├── CUEGUIDE_BUILD_SPEC.md          ← For Claude Code (build instructions + full context)
├── DELIVERABLE_1_Agile_Feature_Spec.md   ← For Som (client-facing, attach as PDF)
├── DELIVERABLE_2_Technical_Architecture.md  ← For Som (over-delivery, attach as PDF)
├── EMAIL_DRAFT.md                  ← Copy-paste email (remove instructions section)
├── SEND_CHECKLIST.md               ← This file
└── AGILE_FEATURE_SPEC.md           ← Earlier draft (superseded by DELIVERABLE_1)
```
