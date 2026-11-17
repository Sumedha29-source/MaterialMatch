# ♻️ MaterialMatch

### Turning Waste into Resources.

MaterialMatch is a waste-to-resource exchange platform that connects people and businesses who have reusable surplus materials with individuals and organizations that can give those materials a second life.

Instead of allowing useful materials to go to waste, MaterialMatch makes it easier to list, discover, and request materials for reuse.

## 🌍 The Problem

A significant amount of potentially reusable material is discarded because waste generators and people who could reuse those materials often have no easy way to connect.

This leads to:
- Unnecessary waste generation.
- Underutilization of reusable resources.
- Higher material procurement costs.
- Missed opportunities for a circular economy.

## 💡 Our Solution

MaterialMatch provides a digital marketplace where users can:

- List surplus or reusable materials.
- Browse available materials.
- Search listings by material name, category, or location.
- View material details, quantity, condition, and pricing.
- Submit requests for materials.
- Track exchange request statuses through the backend.

Our goal is to make material reuse easier, more accessible, and more organized.

## ✨ Features

- **Material Listings:** Add reusable materials with descriptions, quantities, conditions, locations, and pricing.
- **Marketplace:** Browse available material listings.
- **Search and Filter:** Find materials by name, category, and location.
- **Material Details:** View complete information about individual listings.
- **Exchange Requests:** Submit requests for available materials.
- **Stock Management:** Backend updates material quantities when requests are accepted.
- **Database Integration:** Store material listings and exchange requests using MongoDB.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, Tailwind CSS |
| Backend | Python, Flask |
| Database | MongoDB Community Server |
| HTTP Requests | Axios |
| Icons | Lucide React |
| Mapping (planned integration) | Leaflet, OpenStreetMap |
| Data Visualization (planned integration) | Recharts |

## 🏗️ Project Structure

```text
MaterialMatch/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MaterialForm.jsx
│   │   │   └── MaterialDetails.jsx
│   │   ├── App.jsx
│   │   ├── api.js
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

## 🚀 Getting Started

Follow these steps to run MaterialMatch locally.

### Prerequisites

Install the following:

- Python 3.10 or later
- Node.js and npm
- MongoDB Community Server
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Sumedha29-source/MaterialMatch.git
cd MaterialMatch
```

### 2. Set up the MongoDB database

Make sure your MongoDB service is running locally.

The application uses:

```text
mongodb://127.0.0.1:27017/
```

### 3. Set up the backend

```bash
cd backend
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

**Windows Command Prompt:**

```cmd
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file inside the backend folder:

```env
MONGO_URI=mongodb://127.0.0.1:27017/
```

Start the Flask server:

```bash
python app.py
```

Backend runs at:

```text
http://127.0.0.1:5000
```

### 4. Set up the frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```text
http://localhost:5173
```

Open the frontend URL in your browser.

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Check backend health |
| GET | `/api/materials` | Retrieve material listings |
| POST | `/api/materials` | Create a material listing |
| GET | `/api/materials/<id>` | Retrieve a specific material |
| DELETE | `/api/materials/<id>` | Delete a material listing |
| GET | `/api/requests` | Retrieve exchange requests |
| POST | `/api/requests` | Create an exchange request |
| PATCH | `/api/requests/<id>/status` | Accept or reject a request |

## 🗺️ Future Improvements

MaterialMatch is an evolving project. Planned improvements include:

- Intelligent material matching and recommendations.
- Image-based material identification using computer vision.
- Interactive maps to locate nearby reusable materials.
- User authentication and individual dashboards.
- Environmental impact tracking and analytics.
- In-platform communication between material providers and requesters.

## 🌱 Vision

We believe that one person's waste can become another person's resource.

MaterialMatch aims to encourage reuse, reduce unnecessary disposal, and help build a more sustainable, resource-efficient future.

---

## 👩‍💻 Developed By

**Sumedha Basu**

B.Tech Student | AI/ML & Full-Stack Development

- GitHub: [@Sumedha29-source](https://github.com/Sumedha29-source)

---

*Built with the vision of making waste valuable again.* ♻️