
som.gollakota@adaptailabs.ai
Sun, May 3, 4:04 AM (3 days ago)
to me, Suman

Hi Dhruv,

Thank you again for meeting with me the other day. I really appreciated our conversation. I mentioned that I would send you a use case to work on as part of an evaluation, and although it took me a bit longer than planned, here it is.

 

Just to reiterate, I’m sharing this scenario to better understand your ability to design and build AI‑driven applications beyond marketing or sales assistants. Hope that makes sense.


Here’s the scenario: An app that uses AI to prompt a person with early dementia through daily routines using personalized cues and reminders, reducing the need for caregiver reminders.

What I’d like you to do:

Define the feature in Agile terms (feature statement, user stories, acceptance criteria, dependencies, business value).
Identify the tools, frameworks, and technologies you would use to build it.
Develop a working demo application that showcases the core functionality.
 

The goal here is to see how you approach both the thought process and the technical execution of building an application in a domain outside of marketing/sales assistants.

 

If you are interested in pursuing this further, please let me know when you will be able to share and review a demo with me.

 

Thanks once again.

 

Best Regards,

 

- Som Gollakota

CTO, AdaptAILabs

San Jose, CA

 

-----Original Appointment-----
From: Google Calendar <calendar-notification@google.com> On Behalf Of Dhruv Jain
Sent: Tuesday, April 21, 2026 9:14 PM
To: Dhruv Jain; som.gollakota@adaptailabs.ai
Subject: Call: Som & Dhruv Introduction
When: Tuesday, April 28, 2026 3:30 PM-4:00 PM Asia/Taipei.
Where: https://meet.google.com/rdt-mrmr-qou

 

Call: Som & Dhruv Introduction

Join with Google Meet – You have been invited by Dhruv Jain to attend an event named Call: Som & Dhruv Introduction on Tuesday Apr 28, 2026 ⋅ 12:30am – 1am (Pacific Time - Los Angeles).

 

 

Join with Google Meet

Meeting link
meet.google.com/rdt-mrmr-qou

Join by phone
(US) +1 727-495-6236
PIN: 522818339

More phone numbers

When
Tuesday Apr 28, 2026 ⋅ 12:30am – 1am (Pacific Time - Los Angeles)

Guests
Dhruv Jain - organizer

som.gollakota@adaptailabs.ai

View all guest info

Reply for som.gollakota@adaptailabs.ai

Yes

No

Maybe


More options


Invitation from Google Calendar

You are receiving this email because you are subscribed to calendar notifications. To stop receiving these emails, go to Calendar settings, select this calendar, and change "Other notifications".

Forwarding this invitation could allow any recipient to send a response to the organizer, be added to the guest list, invite others regardless of their own invitation status, or modify your RSVP. Learn more

 


Dhruv Jain <dhruv@robossist.com>
Tue, May 5, 7:50 PM (15 hours ago)
to som.gollakota, Suman

Hi Som,

Thank you for sending this over; it is an excellent use case. When building for early dementia, standard notification-based apps often fail because they lack immediate context and patience. This requirement demands a contextually-aware, resilient companion that handles cognitive degradation gracefully and escalates to caregivers only when necessary.

Below is my architectural breakdown and Agile definition. I have also updated the live demo application to reflect this production mindset which you can view here: https://www.loom.com/share/a4bd3f5b68ae471c9bbe0c6cb4cce46e

1. Agile Definition

Feature Statement:
An AI-driven contextual companion that guides patients through daily routines using multimodal cues (visual, audio), adapting schedules dynamically based on passive biometric data, and intelligently escalating anomalies to caregivers.

User Stories:

- As a patient, I want clear, isolated steps with voice narration context so I don't feel overwhelmed or panicked if I forget my current task.
- As a patient, I want a single "I'm Confused" button that breaks steps down further or connects me to my caregiver to prevent distress.
- As a caregiver, I want to set dynamic escalation policies (e.g., "Alert me if 30 minutes late or if distress is detected") to reduce alert fatigue.
- As the system, I need to ingest passive sensor data (e.g., Apple Health, motion sensors) as chronological triggers to initiate routines organically.

Acceptance Criteria:

- Latency: AI text-to-speech generation must have sub-1-second latency to prevent patient anxiety.
- Accessibility: Patient UI must pass AAA accessibility standards (high contrast, large touch targets).
- Resiliency: The core routine must fallback to a locally-cached state (PWA) if the network connection drops.
- Escalation: Critical push notifications must reach the caregiver within 5 seconds of failure detection.

Dependencies & Business Value:

- Dependencies: HIPAA-compliant data store, low-latency LLM endpoints (Google Gemini Flash), and wearable/sensor APIs.
- Business Value: Reduces caregiver burnout by eliminating approximately 80% of benign check-in calls and extends the duration of independent living for patients.

2. Tech Stack & Architecture

- Frontend: React / Next.js structured as a local-first PWA. Framer Motion is used for cognitive-friendly transitions.
- Backend & Data: Node.js microservices with Supabase (PostgreSQL), utilizing Row Level Security (RLS) for HIPAA-compliant patient data partitioning.
- AI Engine: Google Gemini 1.5 Flash for low-latency conversational logic.
- Real-time: WebSockets for caregiver dashboard syncing and Twilio/Resend for SMS escalations.

3. Demo Implementation Updates

I have updated the demo app today to include:

- Escalation Matrices: Caregivers can now set specific policies within the RoutineCreator.
- Sensor Architecture: Added UI scaffolding for Apple Health and Smart Home motion sensor integration.
- Patient "Distress" State: Implemented the "I'm Confused" emergency path within Patient Focus Mode.
- UI/UX Hardening: Refined visual hierarchy and added fluid progress indicators to prevent user disorientation.

Please let me know what you think, if this is the right direction.

Best regards,

Dhruv Jain

som.gollakota@adaptailabs.ai
Tue, May 5, 10:21 PM (12 hours ago)
to me, Suman

Hi Dhruv,

Thank you for putting this together so quickly. It’s excellent and very thorough.

 

Is the mini-app already built and ready for demo? I am not completely clear on that. Would you great if you can clarify.

 

The link you sent was of a video message, at least on the surface. Is there a link somewhere in there or in here to access the demo? If so, would be great if you could point me to it.

 

Lastly, would you mind setting up a demo walkthrough? Maybe 30 to 45 minutes would be PERFECT!

 

I can be available tomorrow (05/06/2026) from 8 PM Indian (7:30 Pacific) to 9:30 PM Indian (9 AM Pacific), in case Suman wants to attend.

 

Thanks once again. Love the detail and the thought process!!

 

Best Regards,

 

- Som Gollakota

CTO, AdaptAILabs

San Jose, CA

 


Suman Bhattacharjee
Tue, May 5, 10:39 PM (12 hours ago)
to som.gollakota@adaptailabs.ai, me

Som and Dhruv,

I would love to attend as well and am open from 7:30 am - 9 am PST tomorrow.

Regards, 

Suman

 

Suman Bhattacharjee

Founder & CEO at AdaptAILabs

San Jose, California

From: som.gollakota@adaptailabs.ai <som.gollakota@adaptailabs.ai>
Sent: Tuesday, May 5, 2026 7:21 AM
To: 'Dhruv Jain' <dhruv@robossist.com>
Cc: 'Suman Bhattacharjee' <suman.bhattacharjee@adaptailabs.ai>
Subject: RE: Call: Som & Dhruv Introduction
 
...

[Message clipped]  View entire message

Dhruv Jain <dhruv@robossist.com>
Tue, May 5, 10:57 PM (12 hours ago)
to Suman, som.gollakota@adaptailabs.ai

Hi Som and Suman,

Thank you! 8:00 PM IST (7:30 AM PST) tomorrow works for me, and I look forward to walking you both through the demo.

To clarify, the application is a working prototype rather than a production-ready build. While the Loom video covers the core functionality, the app itself is not currently hosted on a public URL. If you would like to access it directly before our call, it would take me about 30 minutes to set up a shareable link for you. Please let me know if you’d like me to send that over ahead of time.

See you tomorrow.

Best regards,

Dhruv Jain

som.gollakota@adaptailabs.ai
Tue, May 5, 11:24 PM (11 hours ago)
to me, Suman

A working prototype and not production ready. Understood.

 

Would love to get my hands on the prototype and play with it a bit. Whether it is before or after the demo is your call.

 

Thanks!!