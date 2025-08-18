test l test 2
# MyProductiveSpace (mps_v1)

[# mps_v1
myproductivespace]

> A flexible, minute-by-minute co-working space booking platform.

MyProductiveSpace lets users discover and book co-working seats or rooms in half-hour increments, pay instantly via PayNow, and manage their reservations—all in a sleek, responsive web app.

---

## 📁 Project Structure

```
mps_v1/
├── frontend/           # Next.js web client (see README inside for details)
├── backend/            # (TBD) REST API / business logic
└── README.md           # ← You are here
```
---

## 🚀 Getting Started

### Prerequisites *(now with nvm support)*

| Requirement                                                  | Why you need it                                                                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| **Node.js ≥ 20**                                             | Runs the Next.js frontend and (eventually) the backend.                                                        |
| **Package Manager** – one of `npm`, `yarn`, `pnpm`, or `bun` | Installs dependencies & runs scripts.                                                                          |
| **nvm** (Node Version Manager) ***recommended***             | Lets every contributor pin exactly the Node version the project expects without touching their global install. |

---
## 🏃 Ways to Run
Choose whichever fits your workflow:

### Method 1: Direct **npm**

1. Clone & install:
   ```bash
   git clone https://github.com/your-org/mps_v1.git
   cd mps_v1/frontend
   npm install
   ```
2. Launch the dev server:

   ```bash
   npm run dev
   ```
3. Open your browser at [http://localhost:3000](http://localhost:3000).

---
### Method 2: Using **nvm** (recommended if dont want docker setup)

> Great if you switch Node versions between projects.

> *If you already have Node 20+ globally and won’t be switching versions for other projects, you can skip this. But `nvm` keeps life simpler across teams.*

#### macOS / Linux install guide for nvm [(link to install)](!https://medium.com/@sabirsafder/how-to-install-nvm-node-version-manager-on-windows-mac-os-46b367448103)

```bash
# 1. Install nvm (via curl)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v{add cuurent latest version here}/install.sh | bash
#    – or – with Homebrew
# brew install nvm && mkdir ~/.nvm

# 2. Reload your shell so `nvm` is in PATH
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 3. Install & use the project’s Node version
nvm install 20   # or any >=20 version you prefer
nvm use 20

# 4. (Optional) Make it the default for new shells
nvm alias default 20
```

#### Windows

1. **Install *nvm-windows***

   * The easiest path is with Chocolatey:

     ```powershell
     choco install nvm
     ```
   * Or download the MSI from the official repo: [https://github.com/coreybutler/nvm-windows/releases](https://github.com/coreybutler/nvm-windows/releases)

2. **Open PowerShell / CMD** and point `nvm` at the right version:

   ```powershell
   nvm install 20.20.0
   nvm use 20.20.0
   ```

3. **Verify**:

   ```bash
   node -v   # → v20.20.0
   ```

Now continue with the usual steps:

```bash
git clone https://github.com/your-org/mps_v1.git
cd mps_v1/frontend
npm install        # or pnpm / yarn
npm run dev
```

That’s it! Everyone on the team can stay in sync with the exact Node version, no matter their OS.
<!---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or later  
- One of: **npm**, **yarn**, **pnpm** or **bun**

### Local Development

1. **Clone the repo**  
    ```bash
    git clone https://github.com/your-org/mps_v1.git
    cd mps_v1
    ```

2. **Install and launch the frontend**  
    ```bash
    cd frontend
    npm install         # or yarn / pnpm install
    npm run dev         # or yarn dev / pnpm dev / bun dev
    ```

3. **Open your browser** at [http://localhost:3000](http://localhost:3000)
-->

---

### Method 3: **Makefile & Docker (Most recommended)**

> One-liner to spin up a containerized dev environment.

1. Ensure `docker/.env` is configured (e.g. `APP_PORT=3000`, `APP_HOST=0.0.0.0`).
2. From the repo root:

   ```bash
   make dev        # builds the dev image (once) and runs it with hot-reload
   ```

   * After the initial build, to just restart:

     ```bash
     make run-dev
     ```
3. When you’re done:

   ```bash
   docker stop mps-frontend-dev
   # or
   make compose-down
   ```
4. For production (not needed yet):

   ```bash
   make prod       # build+run prod image
   # or
   make build-prod
   make run-prod
   ```


---


## 📝 Available Scripts

*All scripts live in the `frontend/` folder unless using Docker/Make:*

| Command             | Description                                       |
| ------------------- | ------------------------------------------------- |
| `npm run dev`       | Start Next.js development server                  |
| `npm run build`     | Create a production build                         |
| `npm start`         | Serve the production build (after `build`)        |
| `npm run lint`      | Run ESLint                                        |
| `make dev`          | Build & run the Docker dev container (hot-reload) |
| `make run-dev`      | Run existing Docker dev container                 |
| `make prod`         | Build & run the Docker prod container             |
| `make build-prod`   | Build the Docker prod image only                  |
| `make compose-up`   | `docker-compose up --build -d` (both services)    |
| `make compose-down` | `docker-compose down`                             |
| `make logs`         | `docker-compose logs -f`                          |


This gives clear, separate instructions for:

1. **Pure npm**  
2. **nvm-managed npm**  
3. **Containerized dev & prod** via your Makefile and Dockerfiles.


---

## ✨ Features (TBC)

- **Landing Page** with scrollable “About”, “What We Offer”, “Why Choose Us”  
- **Flexible Booking** in 30-minute blocks  
- **Real-Time Availability** across multiple locations  
- **PayNow Integration** for seamless payments  
- **User Accounts** (signup, login, password reset)  
- **Admin Dashboard** for managing locations, rates, and bookings  

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui  
- **Fonts**: Optimized with `next/font`  
- **Styling**: `/styles/globals.css` + component-level styles  
- **Future Backend**: Node.js (Express/Koa) or Python (FastAPI), PostgreSQL/SQLite  

---

## 🤝 Contributing

1. Fork the repo  
2. Create a feature branch:  
   ```bash
   git checkout -b feat/YourFeature
   ```  
3. Commit your changes:  
   ```bash
   git commit -m "feat: add YourFeature"
   ```  
4. Push to your branch:  
   ```bash
   git push origin feat/YourFeature
   ```  
5. Open a Pull Request  

> Please follow conventional commits and run `npm run lint` before submitting.

---

## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](LICENSE) (tbc) for details.  

