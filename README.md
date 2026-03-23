# StudySathi AI 🎓
## Your private, offline AI study companion.

StudySathi AI is a state-of-the-art **private, offline-first AI exam preparation assistant** designed for students. It enables a distraction-free, privacy-preserving study experience by running powerful AI models directly on your device.

---

## 🚀 Vision
Built for the local AI hackathon, StudySathi AI solves the problem of student data privacy and dependence on high-latency cloud models. By utilizing **RunAnywhere Web SDK**, we bring GPT-level intelligence directly into the browser tab, ensuring your study notes never leave your machine.

## ✨ Core Features
- 📝 **Smart Notes**: Paste or upload `.txt` study materials.
- 📑 **Exam Summarizer**: Get concise summaries and key bullet points.
- ✍️ **Answer Generator**: Instantly draft 2-mark, 5-mark, and 10-mark structured exam answers.
- 🧠 **Interactive Quizzes**: Generate MCQ quizzes to test your knowledge.
- ⚡ **Revision Flashcards**: Flip and learn with AI-generated cards.
- 🤖 **AI Chat Tutor**: A context-aware chatbot that knows your notes inside out.
- 🎙️ **Voice Tutor**: Integrated Speak-to-Learn capabilities.
- 🔒 **100% Private**: No cloud calls (in Primary Mode). Offline-ready.

---

## 🧱 Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Styling**: Tailwind CSS (Premium Dark Theme)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **Primary AI (Hackathon Mode)**: RunAnywhere Web SDK (Local LLM/STT/TTS)

---

## 🛠️ Setup & Installation

### 1. Clone & Install
```bash
git clone <repository-url>
cd studysathi-ai
npm install
```

### 2. Environment Variables
Create a `.env` file in the root directory:
```env
VITE_AI_PROVIDER=runanywhere
VITE_STRICT_OFFLINE=true
VITE_RUNANYWHERE_API_KEY=your_runanywhere_api_key
VITE_RUNANYWHERE_BASE_URL=https://runanywhere-backend-production.up.railway.app
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 🤖 AI Provider Architecture
The application uses a unified `AIService` layer which dynamically routes calls based on the selected provider.

- **Primary Mode (`runanywhere`)**: Official hackathon mode. Uses local inference for zero-cost, private AI.

The app runs in strict offline mode (`VITE_STRICT_OFFLINE=true`). In this mode, cloud provider selection and cloud API calls are blocked at runtime.

> [!NOTE]
> StudySathi AI is configured as offline-only for privacy-first usage.

---

## 🎯 Hackathon Pitch
StudySathi AI is more than just a wrapper. It's a rethink of how AI can be integrated into education without compromising privacy or incurring high cloud costs. By targeting on-device processing, we make high-quality education accessible even in low-connectivity areas.

---
**Build with ❤️ for the AI Hackathon 2026.**
