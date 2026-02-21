<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=timeGradient&height=200&section=header&text=Dukaan.AI&fontSize=70&animation=fadeIn&fontAlignY=35&desc=AI-Powered%20Business%20OS%20for%20Bharat&descAlignY=55&descAlign=45" />

### AI-Powered Business Operating System for Bharat’s Local Stores

**Local-first. AI-native. Cloud-optional.**

<br/>

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)

</div>

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Triangular%20Flag.png" alt="Flag" width="25" height="25" /> Problem

India has over **6+ crore small businesses**, yet most operate:

- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Cross%20Mark.png" alt="Cross" width="15" height="15" /> Without structured digital inventory
- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Cross%20Mark.png" alt="Cross" width="15" height="15" /> Without analytics
- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Cross%20Mark.png" alt="Cross" width="15" height="15" /> Without automation
- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Cross%20Mark.png" alt="Cross" width="15" height="15" /> With heavy manual data entry

Existing POS tools are:

- Complex
- English-heavy
- Not built for Bharat
- Not AI-native

---

## <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f4a1/512.gif" alt="Light Bulb" width="30" height="30" /> Solution — Dukaan.AI

Dukaan.AI is a **local-first AI business operating system** that transforms small offline stores into intelligent, data-driven businesses.

It removes friction by applying AI directly at the point of interaction — not as a separate analytics layer.

---

## <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/26a1/512.gif" alt="High Voltage" width="30" height="30" /> Core Capabilities

### 1️⃣ AI-Powered Onboarding <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Rocket.png" alt="Rocket" width="25" height="25" />

Instead of rigid forms, onboarding dynamically adapts using **Gemini 2.5 Flash**, generating structured business intelligence in real time.

- Business-type aware questions
- Context-based prompts
- Structured JSON output
- Fallback-safe architecture

---

### 2️⃣ Multi-Modal Data Ingestion <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Inbox%20Tray.png" alt="Inbox" width="25" height="25" />

Manual entry is optional.

Merchants can:

- 📸 **Scan bills** via Gemini Vision
- 💬 **Paste WhatsApp** order text
- 📊 **Upload CSV** bulk data

All unstructured input is normalized into clean JSON objects via AI + deterministic fallback logic.

No backend required.

---

### 3️⃣ Inventory-Aware AI Insights <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Bar%20Chart.png" alt="Bar Chart" width="25" height="25" />

The system continuously analyzes:

- Inventory stock
- Sales patterns
- Product velocity

Gemini generates contextual, multilingual business advice in real time.

If AI fails → deterministic logic keeps app functional.

---

### 4️⃣ Local-First Architecture <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Mobile%20Phone.png" alt="Mobile" width="25" height="25" />

Dukaan.AI works **100% offline** via `localStorage`.

Why?

- No dependency on hackathon WiFi
- Instant performance
- Zero onboarding friction

Cloud sync via **Firebase Firestore** is additive and optional.

If cloud fails → local state remains intact.

---

### 5️⃣ Hybrid Cloud Sync <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Cloud.png" alt="Cloud" width="25" height="25" />

- Firestore integration (non-blocking)
- Optional authentication
- Future-ready multi-device architecture
- Zero impact on demo stability

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Building%20Construction.png" alt="Construction" width="25" height="25" /> Architecture Overview

```mermaid
graph TD;
    UI[UI React + Tailwind] --> Context[Context Layer State Management];
    Context --> Storage[(LocalStorage Primary Source of Truth)];
    Storage --> AI[AI Service Layer Gemini];
    AI --> Fallback{Deterministic Fallback Engine};
    Fallback --> Sync[(Optional Firestore Sync)];
```

Key design principle:

> **No AI call can block or crash core business functionality.**

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Smilies/Brain.png" alt="Brain" width="25" height="25" /> AI Integration Points

Gemini 2.5 Flash powers:

- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png" alt="Check" width="20" height="20" /> Onboarding question generation
- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png" alt="Check" width="20" height="20" /> Receipt OCR (Vision API)
- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png" alt="Check" width="20" height="20" /> WhatsApp parsing
- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png" alt="Check" width="20" height="20" /> CSV normalization
- <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Symbols/Check%20Mark%20Button.png" alt="Check" width="20" height="20" /> Inventory insights

All calls:

- Enforced JSON structure
- Wrapped in try/catch
- Timeout controlled
- Fail-safe fallback implemented

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Wrench.png" alt="Wrench" width="25" height="25" /> Tech Stack

| Domain               | Technology                                                 |
| -------------------- | ---------------------------------------------------------- |
| **Frontend**         | React 19, Vite, Strict TypeScript, Tailwind CSS            |
| **State Management** | React Context API                                          |
| **Persistence**      | LocalStorage (Primary), Firebase Firestore (Additive Sync) |
| **AI Engine**        | `@google/genai`, Gemini 2.5 Flash                          |
| **Deployment**       | GitHub Pages                                               |

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Locked%20with%20Key.png" alt="Lock" width="25" height="25" /> Security & Tradeoffs

For hackathon velocity:

- API keys are client-exposed
- No auth requirement for demo

Production roadmap:

- Move AI calls to serverless functions
- Secure keys server-side
- Enforce authentication
- Introduce schema validation

---

## <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png" alt="Rocket" width="25" height="25" /> Run Locally

```bash
git clone https://github.com/dishudhalwal12/dukaan-ai.git
cd dukaan-ai/in
npm install

# Add your environment variables:
# VITE_GEMINI_API_KEY
# VITE_FIREBASE_API_KEY
# VITE_FIREBASE_PROJECT_ID
# etc.

npm run dev
```

<br>
<div align="center">
  <img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Hand%20gestures/Handshake.png" alt="Handshake" width="60" height="60" />
</div>
