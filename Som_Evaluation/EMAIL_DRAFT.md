# Email to Som — Ready to Send

**To:** som.gollakota@adaptailabs.ai
**CC:** (Suman — only if you want him to see this. I'd recommend YES — it signals to Suman that you delivered.)
**Subject:** CueGuide — Dementia Routine Assistant: Feature Spec + Working Demo

---

Hi Som,

Thanks for sending over the evaluation scenario. I spent real time on this — dementia care is a problem space where AI can make a meaningful difference, and I wanted to go beyond the surface.

I put together three things for you:

**1. Agile Feature Spec** (attached)
Five user stories with acceptance criteria, a dependency map, business value analysis, technology stack rationale, risk table, and a 30-day MVP roadmap. I focused on the decisions that matter — like why offline-first architecture is non-negotiable for this population, and how to anonymize PHI before it ever hits an AI API.

**2. Technical Architecture** (attached)
System design, full data model (6 tables), the AI prompt engineering pipeline with an anonymization layer, the adaptive scheduling algorithm, and HIPAA compliance architecture. This is how I'd build it for production.

**3. Working Demo** (link below)
A web app you can click through right now. It shows the full loop: caregiver sets up a routine for "Robert" (a sample patient), AI generates personalized step-by-step prompts, the patient walks through Focus Mode one step at a time, and the caregiver dashboard shows completion analytics and adaptive scheduling suggestions.

**Demo:** [INSERT_DEPLOYED_URL_HERE]

A few design decisions worth flagging:

- **PHI never reaches the LLM.** Patient context is de-identified before the API call. Re-personalization happens client-side. This satisfies HIPAA's Minimum Necessary standard.
- **Adaptive, not autonomous.** The scheduling engine suggests changes based on behavioral patterns but always requires caregiver approval. No autonomous changes to a patient's routine.
- **Offline-first.** Routines and prompts cache locally. The app works without internet — important for elderly users with unreliable connectivity.

Happy to walk you through everything on a 30-minute call whenever works. I'm flexible on timing — just send over a couple of options.

Best,
Dhruv

---

## INSTRUCTIONS FOR DHRUV (delete everything below before sending)

### Before you send:
1. Replace [INSERT_DEPLOYED_URL_HERE] with your actual Vercel/Netlify URL
2. Attach DELIVERABLE_1_Agile_Feature_Spec.md (convert to PDF first for professionalism)
3. Attach DELIVERABLE_2_Technical_Architecture.md (convert to PDF)
4. Decide whether to CC Suman — I recommend YES
5. Test the demo URL one more time to make sure it loads clean
6. Send from dhruv@robossist.com (not gmail — looks more professional)

### Converting .md to PDF:
```bash
# If you have pandoc installed:
pandoc DELIVERABLE_1_Agile_Feature_Spec.md -o CueGuide_Feature_Spec.pdf
pandoc DELIVERABLE_2_Technical_Architecture.md -o CueGuide_Technical_Architecture.pdf

# Or use a browser: open the .md in VS Code preview, print to PDF
```

### What this email does right:
- Opens with "I spent real time on this" — signals effort, not AI-dumped output
- Leads with what he asked for (spec + demo), then the over-delivery (architecture)
- Three bullet points at the end show THINKING, not just building
- "Happy to walk you through" = positions for a follow-up call where you demo live
- Short. No overexplaining. No "I'm so grateful for this opportunity" energy.
- Professional but human. Sounds like Dhruv, not ChatGPT.

### After you send:
- Text Suman on WhatsApp: "Hey, just sent Som the evaluation deliverables. Put together a feature spec, technical architecture, and a working demo. Let me know if you want to take a look."
- This does two things: keeps Suman in the loop AND signals you delivered fast
