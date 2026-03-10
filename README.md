# CrowdSync | AI-Powered DJ Library Toolkit 🎧

CrowdSync is a specialized tool designed for DJs to automate the tedious process of crate organization and harmonic matching. It analyzes local music libraries and provides intelligent setlist arrangements and mashup suggestions based on musical theory.

## 🚀 Live Demo
[Check it out on Vercel](https://crowd-sync-nu.vercel.app)

## ✨ Core Features
- **Intelligent Setlist Arranger:** An automated algorithm that sorts your tracks based on the Camelot Wheel (Harmonic Mixing) and BPM energy flow.
- **Track Lab:** Real-time mashup detection. Find which tracks in your library are compatible for seamless overlays.
- **Library Intelligence:** Dynamic dashboard showing BPM distribution and harmonic profile of your entire crate.
- **FastAPI Integration:** High-performance Python backend for complex musical logic processing.

## 🛠️ The Tech Stack
- **Frontend:** React.js, TypeScript, Tailwind CSS, Vite.
- **Backend:** Python, FastAPI, Uvicorn.
- **State Management:** React Context API (Global Library State).
- **Deployment:** Vercel (Frontend), Render (Backend).

## 🧠 What I Implemented
- **Harmonic Mixing Logic:** Developed a greedy algorithm to calculate optimal transitions between tracks using musical keys.
- **File System Handling:** Implemented browser-side directory scanning and metadata extraction.
- **Full-Stack Communication:** Architected a seamless bridge between a React UI and a Python microservice with CORS handling.