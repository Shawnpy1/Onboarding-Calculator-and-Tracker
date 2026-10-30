# Star Digital Affiliate Marketing &bull; Creator Seeding & Onboarding Target Tracker

A modern, high-precision executive web application built for **Star Digital Affiliate Marketing**. Designed for tracking creator seeding requirements, cumulative targets, and conversion efficiency with full real-time customizability, scenario management, and multi-format data export.

---

## 🚀 Deployment to Vercel

The project is fully production-ready for zero-configuration deployment on **Vercel**.

### Option A: Deploy via GitHub (Recommended)
1. Initialize a git repository in this folder and push to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Star Digital Tracker"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git push -u origin main
   ```
2. Go to **[vercel.com/new](https://vercel.com/new)**.
3. Select your GitHub repository and click **Import**.
4. Leave Framework Preset as **Other** (Vercel automatically detects `index.html` and `vercel.json`).
5. Click **Deploy** &mdash; your app will be live on your custom `.vercel.app` URL in seconds!

### Option B: Deploy via Vercel CLI
If you have Node/npm installed on your machine:
```bash
npx vercel
```
Follow the interactive prompts to deploy directly from your local directory.

---

## 💜 Production Features

- **Star Digital Affiliate Marketing Branding**: Top-left official logo badge, branded favicon, and header.
- **Dynamic Top KPI Cards**:
  - **Conversion Rate**: e.g., `35.0%`
  - **Daily Onboard Target**: e.g., `107 / day`
  - **5-Day Total Target**: e.g., `535`
  - **Cumulative Target**: e.g., `500 / 500`
- **Dual-Axis Chart Engine**: High-DPI canvas rendering with vibrant purple bars (`#7c3aed`), fuchsia progress curve (`#d946ef`), and emerald goal line (`#16a34a`).
- **Scenario Management**:
  - Customize scenario names directly on screen.
  - Save, load, and rename scenarios stored securely in browser `localStorage`.
- **Multi-Format Export**:
  - 📊 **CSV Export** for Excel and Google Sheets.
  - ⚙️ **JSON Export** with complete scenario configurations.
  - 🖼️ **High-Resolution PNG** chart image export branded with Star Digital Affiliate Marketing.
  - 📋 **Copy to Clipboard** formatted table.
  - 🖨️ **Print / PDF Report** formatted for executive presentation.

---

## 📁 Project Structure

```text
├── index.html         # Main dashboard markup & structure
├── styles.css         # Modern purple theme & spacious responsive layout
├── app.js             # Real-time math engine, canvas chart, and scenario storage
├── logo.png           # Star Digital Affiliate Marketing official logo
├── favicon.png        # Web browser tab favicon
├── vercel.json        # Production Vercel deployment configuration
├── package.json       # Project manifest
└── .gitignore         # Clean deployment ignores
```
