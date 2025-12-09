<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🧠 Visual Study Buddy
> **From Handwriting to Code: The Multimodal STEM Workstation.**
> *Built for the Google AI Studio "Vibe Coding" Hackathon.*

---

## 💡 Inspiration
As Data Science and STEM students, we don't just work with text. We live in a world of **handwritten integrals, complex neural network architectures, and messy whiteboard sketches**.

Generic AI chatbots fail to understand this visual context. We needed a tool that could "see" the problem, understand the theory, and even write the implementation code. That's why we built **Visual Study Buddy**.

## 🚀 What It Does
Visual Study Buddy is a multimodal workstation that combines **Deep Reasoning** with **Code Execution**. It operates in three specific modes:

### 1. 📐 The Math Professor (Calculus Mode)
* **Input:** Upload a photo of a handwritten math problem (e.g., Integration by Parts).
* **AI Action:** Recognizes handwriting, identifies the mathematical rule, and solves it step-by-step.
* **Tech:** Gemini Vision + LaTeX Rendering.

### 2. 🎨 The Illustrator (Visualizer Mode)
* **Input:** Ask the chat to "Visualize a Neural Network" or "Draw a Logic Circuit."
* **AI Action:** Instantly generates an accurate technical diagram to explain the concept.
* **Tech:** Gemini Image Generation.

### 3. 💻 The Engineer (Code Generation Mode)
* **Input:** Upload a sketch (or generated diagram) of a system architecture.
* **AI Action:** Analyzes the nodes and connections to write production-ready **Python/NumPy/PyTorch** code.
* **Live Execution:** Runs the generated code directly in the browser using a built-in Python environment.

---

## 🛠️ How to Run Locally
This app was built using Google AI Studio. Follow these steps to run it on your machine.

**Prerequisites:** Node.js

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Setup API Key:**
    * Create a file named `.env.local` in the root directory.
    * Add your Gemini API key:
        ```text
        GEMINI_API_KEY=your_api_key_here
        ```
    * *Note: You can also enter the API key directly in the app UI via the Settings gear icon.*

3.  **Run the app:**
    ```bash
    npm run dev
    ```
    Open your browser to the local URL provided (usually `http://localhost:5173`).

---

## 🏆 Hackathon Tracks
* **Education:** Reimagining how students learn abstract concepts visually.
* **Technology:** Pushing the boundaries of code generation from visual inputs.
* **Science:** Accelerating discovery by solving complex math instantly.

## 🛠️ Tech Stack
* **AI Model:** Google Gemini 1.5 Pro & Flash
* **Platform:** Google AI Studio
* **Execution:** Pyodide (Python in Browser)
* **Frontend:** React / Node.js

---
*Built with ❤️ for the Gemini API Developer Competition.*
