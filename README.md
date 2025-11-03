# 💰 Salary Calculator

A simple and modern **web-based salary calculator** that helps you track workdays, breaks, and earnings.  
This project includes two versions:

- **Online Version** — built with **React + TailwindCSS** (runs in browser via CDN)
- **Offline Version** — built with a **custom lightweight React-like framework (no internet required)**

---

## 📁 Project Structure

```
salary-calculator/
├── salary_calculator_online.html   # Online React version (uses Tailwind, Babel CDN)
├── salary_calculator_offline.html  # Offline version (no dependencies)
├── script.js                       # Logic for offline version
├── style.css                       # Shared CSS styling
└── README.md                       # Documentation
```

---

## 🚀 Features

✅ Create and manage multiple **profiles** (e.g., different workplaces or people)  
✅ Add, edit, and delete **workdays**  
✅ Automatically detect **weekends**  
✅ Support for **holidays** and **night shifts**  
✅ Dynamic **hourly rate calculation** based on total monthly hours  
✅ **Gross/Net earnings** with Schengen tax toggle (15%)  
✅ Import/export your data as JSON  
✅ Works entirely **offline** (for the offline version)

---

## 🌐 Online Version

**File:** `salary_calculator_online.html`

### ▶ Run
Just open the file in any modern browser — no installation required.

It uses:
- [React 18](https://react.dev/)
- [ReactDOM 18](https://react.dev/reference/react-dom)
- [Babel Standalone](https://babeljs.io/)
- [TailwindCSS CDN](https://tailwindcss.com/)

The app runs React JSX directly in the browser via Babel.

---

## 💻 Offline Version

**Files:**  
- `salary_calculator_offline.html`  
- `script.js`  
- `style.css`

### ▶ Run
Open **`salary_calculator_offline.html`** in your browser.  
Everything (logic, UI, and storage) works 100% **offline** — no internet required.

### ⚙ How it Works
- The `script.js` file includes a **mini React-like implementation** with custom `useState`, `useEffect`, and virtual DOM rendering.
- Data is stored in **localStorage**.
- The same UI and functionality as the online version, but without external libraries.

---

## 🎨 Styling

All visual styles are defined in **`style.css`**:
- Responsive layout using a lightweight utility-class approach (similar to Tailwind)
- Gradient backgrounds, cards, grids, buttons, tables, etc.
- Works consistently in both versions.

---

## 💾 Data Persistence

Your profiles and workdays are saved in the browser’s **localStorage**:
- Online version: `salaryCalculatorData`
- Offline version: `salaryCalc`

You can also **export** and **import** `.json` files for backup or sharing.

---

## 📊 Calculations

- **Base hourly rate** depends on monthly total hours:
  ```
  < 40h     → 1675 Ft/hour  
  40–80h    → 1795 Ft/hour  
  81–100h   → 1835 Ft/hour  
  101–120h  → 1885 Ft/hour  
  121–150h  → 1925 Ft/hour  
  > 150h    → 1975 Ft/hour
  ```
- **Night hours (22:00–06:00):** +40% rate  
- **Evening hours (18:00–22:00):** +30% rate  
- **Weekend:** +20% rate  
- **Holiday:** double pay  
- **Non-Schengen:** 15% tax deduction

---

## 🧩 Technical Summary

| Version | Framework | Dependencies | Works Offline | File |
|----------|------------|---------------|----------------|------|
| **Online** | React + Tailwind | React, ReactDOM, Babel, Tailwind CDN | ❌ | `salary_calculator_online.html` |
| **Offline** | Custom JS framework | None | ✅ | `salary_calculator_offline.html`, `script.js`, `style.css` |

---

## 🧠 Author Notes

- Designed for personal use or small teams needing quick salary tracking.
- Fully client-side — **no backend or server required.**
- Compatible with Chrome, Firefox, Edge, Safari.

---

## 🪪 License

This project is released under the **MIT License**.  
You are free to use, modify, and distribute it with attribution.
