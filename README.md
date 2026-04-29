# MLens - A Visual Machine Learning Dashboard

![Next.js](https://img.shields.io/badge/Next.js-000?logo=nextdotjs)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-000000)
![D3.js](https://img.shields.io/badge/D3.js-F9A03C?logo=d3&logoColor=black)
![TensorFlow.js](https://img.shields.io/badge/TensorFlow.js-FF6F00?logo=tensorflow&logoColor=white)

---

An interactive, frontend-heavy web application for exploring datasets, configuring Neural Network models, and visualizing machine learning workflows, all directly in the browser.

🔗 **Live Demo:** https://mlens-dashboard.vercel.app

---

## 🚀 Demo

![MLens Demo](./demo.gif)

---

## 💡 Motivation

This project was built to bridge my professional experience in frontend engineering with my academic background in machine learning.

Instead of building a traditional ML backend, the goal was to design a **complex, data-intensive user interface** that simulates real-world ML workflows and is entirely client-side.

---

## ✨ Features

### 📂 Data Handling
- Upload and parse CSV datasets
- Automatic feature type detection
- Target column inference

### 📊 Exploratory Data Analysis (EDA)
- Correlation heatmaps
- Scatter plots
- Feature distributions
- Class balance insights

### 🧠 Model Training
- Train neural networks directly in the browser
- Support for both:
  - **Classification**
  - **Regression**
- Interactive configurable architecture (layers, activations, hyperparameters)
  
### 📈 Visualization & Feedback
- Real-time training metrics (loss curves)
- Live updates during training

### 📉 Evaluation
- **Classification:** accuracy, precision, recall, F1-score, ROC curve  
- **Regression:** RMSE, MSE loss, R² score  

### 🔬 Prediction & Insights
- Feature importance analysis
- Interactive prediction panel

---

## 🧩 Frontend Highlights

This project focuses heavily on frontend engineering challenges:

- ⚙️ **Complex global state management** with Zustand + Immer  
- 🔄 **Real-time UI updates** during model training  
- 🧱 **Modular architecture** across multiple pages (Upload page, Dashboard, Dataset viewer, EDA, Train, Results)  
- 📊 **Data-heavy visualizations** using D3.js and Recharts  
- 🎛 **Dynamic UI systems** (neural network builder, interactive forms)  
- 🚀 **Fully client-side architecture** (no backend dependency)  

---

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript  
- **Styling:** Tailwind CSS  
- **State Management:** Zustand + Immer  
- **Visualization:** D3.js, Recharts  
- **Machine Learning:** TensorFlow.js  
- **Data Processing:** PapaParse

---

## 🏗 Architecture Overview

The app is structured into modular layers:

- Data Layer → parsing, statistics, preprocessing
- State Layer → Zustand stores
- ML Layer → TensorFlow.js (model building & training)
- UI Layer → dashboards, charts, interactive components

---

## ⚡ Getting Started

```bash
git clone https://github.com/Mahsa-Goudarzi/ml-models-dashboard.git
cd ml-models-dashboard

npm install
npm run dev
```
---

## 📌 Notes
- Runs entirely in the browser, with no backend required
- Designed as a **frontend-focused system** with ML as a complex use case 
- Best experienced on desktop

--- 

## 👤 Author
**Mahsa Goudarzi** | Frontend Developer

You can find me here:

LinkedIn: https://www.linkedin.com/in/MahsaGoudarzi

GitHub: https://github.com/mahsa-goudarzi

---

## ⭐️ If you like this project...
Give it a star. Or even better, try it out and break it 😄
