# 🪙 Aura Vault — Sovereign Bullion Wealth & Custody Architecture

<p align="center">
  <img src="assets/images/icon.png" width="128" height="128" alt="Aura Vault App Icon" />
</p>

<p align="center">
  <b>Ultra-luxury, offline-first mobile vault designed for private bullion collectors, sovereign wealth preservers, and physical precious metals investors.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS-08090C?style=for-the-badge&logo=android&logoColor=D4AF37" alt="Platform" />
  <img src="https://img.shields.io/badge/Framework-React%20Native%20(Expo%20SDK%2052)-08090C?style=for-the-badge&logo=react&logoColor=61DAFB" alt="Framework" />
  <img src="https://img.shields.io/badge/Architecture-New%20Architecture%20(Fabric%20%2B%20TurboModules)-08090C?style=for-the-badge&logo=apollographql&logoColor=D4AF37" alt="Architecture" />
  <img src="https://img.shields.io/badge/Security-Hardware%20Biometrics%20%2B%20AES--256-08090C?style=for-the-badge&logo=bitwarden&logoColor=4CAF50" alt="Security" />
  <img src="https://img.shields.io/badge/Storage-Local%20SQLite%20(Zero%20Cloud)-08090C?style=for-the-badge&logo=sqlite&logoColor=003B57" alt="Database" />
</p>

---

## 📖 Overview

**Aura Vault** is a high-security, ultra-luxury asset tracking system crafted specifically for physical gold and silver investors. Unlike generic portfolio apps or stock trackers, Aura Vault treats physical bullion with the fiduciary rigor and precision it demands:

- **Exact Karat & Purity Normalization** (24K 99.9%, 22K 91.6%, 18K 75.0%, 999 Fine Silver, 925 Sterling).
- **Statutory Indian Landed Cost Engine** (3% GST computation, making charges, break-even spot rate per pure gram).
- **Real-Time Market Rate Synchronization** (direct live feeds from Indian market benchmarks like GoodReturns Kolhapur).
- **Zero-Cloud Fiduciary Privacy**: All custody locations, weights, certificates, and invoices remain strictly on the user's physical device in an encrypted SQLite database.

---

## ✨ Key Features

### 1. 🛡️ Sovereign Security & Privacy Shield
- **Hardware-Level Biometric Lock**: Uses Android Fingerprint / Face Unlock via `expo-local-authentication` with app state listener to auto-lock the vault whenever minimized or switched.
- **Ghost Mode (Privacy Cloak)**: One-tap toggle in the top bar hides all net worth amounts, acquisition costs, and weights (`₹ ••••••••`), ideal when opening the app in public or around company.
- **Zero Cloud Leakage**: No telemetry, no external database servers, no mandatory account sign-up. 100% offline-first sovereignty.
- **Panic Data Wipe**: One-click vault purge action in the Security console to scrub all records and metadata from the device hardware.

### 2. 📊 Dynamic Financial & Valuation Engine
- **Accurate Purity Normalization**:
  $$\text{Pure Weight} = \text{Gross Weight} \times \text{Purity Percentage}$$
- **Statutory Acquisition Cost & Break-Even Rate**:
  $$\text{Taxable Value} = (\text{Gross Weight} \times \text{Purchase Rate}) + \text{Making Charges}$$
  $$\text{GST Amount} = \text{Taxable Value} \times 3\%$$
  $$\text{Total Cost} = \text{Taxable Value} + \text{GST Amount}$$
  $$\text{Break-Even Spot Rate} = \frac{\text{Total Cost}}{\text{Pure Weight}}$$
- **Dynamic Valuation Trajectory Graph**:
  - Interactive timeframe switcher (`1W`, `1M`, `1Y`, `2Y`, `3Y`, `5Y`, `ALL`).
  - Computes real SVG bezier curves based on actual historical acquisition dates, purchase prices, and live spot valuations.
  - Plots an invested-cost reference baseline to visualize profit/loss trajectories in real time.

### 3. 🪙 Bullion Spot Market Intelligence
- **Live Localized Market Rates**: Native feed synchronized with Indian domestic spot rates (e.g. GoodReturns Kolhapur benchmark).
- **Multi-Purity Breakdown Table**:
  - **Gold**: 24K Pure Gold, 22K Hallmarked Jewelry, 18K Sovereign.
  - **Silver**: 999 Fine Silver (1g, 100g bar, 1kg bar), 925 Sterling Silver.
- **Gold-to-Silver Ratio Indicator**: Displays the real-time monetary ratio (e.g., `62.0 : 1`) to assist in bullion rebalancing.

### 4. 📜 Ledger & Vault Custody Management
- **Detailed Physical Inventory**: Filter holdings by Gold, Silver, or All with high-contrast luxury badges.
- **HUID / BIS Hallmarking Verification**: Dedicated fields for 6-character alphanumeric Bureau of Indian Standards (BIS) Hallmark Unique Identification (HUID).
- **Custody Location Tracking**: Categorize assets across Home Safes, Bank Lockers (with box numbers), or Private Vault depositories.
- **Invoice & Certificate Archival**: Optional local invoice photo storage using `expo-image-picker`.
- **Holding Details & Deletion**: Inspect breakdown of making charges, GST breakdown, break-even vs current spot rate, and net P&L.

### 5. 🎨 Dark Luxury Aesthetics & Edge-to-Edge Responsiveness
- **Obsidian & Pure Gold Theme**: Precision color architecture using Deep Obsidian (`#08090C`), Card Surface (`#10131A`), Classic Gold (`#D4AF37`), Pale Gold (`#F5DF77`), and Profit Green (`#10B981`).
- **One UI & Modern Android Edge-to-Edge Compatibility**: Built with `react-native-safe-area-context` to guarantee zero notch, punch-hole, or gesture navigation bar obstruction across devices like Samsung Galaxy S23 FE.
- **Bespoke 2D Vector Logo**: Minimalist mathematical 2D bank vault wheel icon that renders crisply across all display densities.

---

## 🏛️ System Architecture

```mermaid
graph TD
    A[App Entry / _layout.tsx] --> B[Biometric Guard / Auth Provider]
    B --> C[Bottom Tab Router / (tabs)]
    
    subgraph Screens
        C --> D[Vault Dashboard (index.tsx)]
        C --> E[Holdings Ledger (ledger.tsx)]
        C --> F[Spot Market (spot.tsx)]
        C --> G[Security Vault (security.tsx)]
        C --> H[Add Holding (entry/add.tsx)]
        C --> I[Holding Details (entry/[id].tsx)]
    end

    subgraph State Management [Zustand Store]
        J[useVaultStore] --> D
        J --> E
        J --> F
        J --> G
    end

    subgraph Business Logic & Persistence
        J --> K[Financial Engine: calculations.ts]
        J --> L[Local SQLite: repository.ts]
        J --> M[Market Feed: goldApi.ts]
    end

    subgraph Hardware Layer
        N[expo-local-authentication] -. Biometrics .-> B
        O[expo-image-picker] -. Invoices .-> H
        P[react-native-safe-area-context] -. Insets .-> C
    end
```

---

## 📁 Repository Structure

```
aura-vault/
├── app/                              # Expo Router file-based routes
│   ├── _layout.tsx                   # Root layout, Safe Area & Auth providers
│   ├── (auth)/
│   │   └── lock.tsx                  # Biometric Master Lock Screen
│   ├── (tabs)/
│   │   ├── _layout.tsx               # Luxury bottom navigation tabs
│   │   ├── index.tsx                 # Portfolio Dashboard & Hero metrics
│   │   ├── ledger.tsx                # Inventory & holdings list
│   │   ├── spot.tsx                  # Live bullion rates & market intelligence
│   │   └── security.tsx              # Security console & vault wipe tools
│   └── entry/
│       ├── add.tsx                   # Add new gold/silver holding
│       └── [id].tsx                  # Holding detail view & delete modal
├── assets/
│   └── images/                       # App icons & splash screen graphics
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       ├── PortfolioHero.tsx     # Net worth, invested, and P&L cards
│   │       ├── AllocationBar.tsx     # Gold vs. Silver allocation bar
│   │       └── ReturnsChart.tsx      # Real record-based valuation trajectory
│   ├── db/
│   │   ├── client.ts                 # SQLite connection initialization
│   │   └── repository.ts             # CRUD operations & queries
│   ├── services/
│   │   └── goldApi.ts                # Real-time bullion price fetcher & parser
│   ├── store/
│   │   └── useVaultStore.ts          # Reactive Zustand state store
│   ├── theme/
│   │   └── colors.ts                 # Luxury color palette & token system
│   ├── types/
│   │   └── bullion.ts                # TypeScript domain models & interfaces
│   └── utils/
│       ├── calculations.ts           # Financial pure-weight & GST engine
│       └── __tests__/                # Financial unit test battery
├── android/                          # Native Android project configuration
├── app.json                          # Expo configuration & permissions
├── package.json                      # Project dependencies & scripts
└── tsconfig.json                     # TypeScript configuration
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Language** | TypeScript (Strict mode enabled) |
| **Framework** | React Native 0.86.3 / Expo SDK 52 |
| **Navigation** | Expo Router v4 (File-based routing) |
| **State Management** | Zustand |
| **Local Database** | `expo-sqlite` (Zero-cloud on-device storage) |
| **Security & Auth** | `expo-local-authentication`, `expo-secure-store` |
| **Media & Assets** | `expo-image-picker` |
| **Graphics & Charts** | `react-native-svg` (Dynamic Bezier Curves) |
| **Haptics** | `expo-haptics` |
| **Iconography** | `lucide-react-native` |

---

## 🧪 Testing & Verification

The core financial calculations are covered by a dedicated test suite verifying:
- Purity multiplication factor accuracy.
- Gross weight to pure weight normalization.
- 3% GST calculation on metal rate + making charges.
- Acquisition total cost & break-even spot rate per pure gram.
- Portfolio summary and asset allocation distribution.

To run the verification suite:
```bash
npx tsx src/utils/__tests__/calculations.test.ts
```

To run TypeScript verification:
```bash
npx tsc --noEmit
```

---

## 🚀 Building & Running

### Prerequisites
- Node.js 18+
- Android Studio & Android SDK (API 34+)
- JDK 21

### Local Development
```bash
# Clone the repository
git clone https://github.com/MetriSomesh/Aura-Vault.git
cd Aura-Vault

# Install dependencies
npm install

# Start Metro bundler
npx expo start
```

### Build Standalone Release APK
```bash
cd android
./gradlew assembleRelease
```
The output APK will be generated at:
`android/app/build/outputs/apk/release/app-release.apk`

---

## 🔒 Security Best Practices
- **No Cloud Sync by Design**: Prevents government overreach, database leaks, and third-party profiling of your physical bullion holdings.
- **Biometric Enclave**: Authentication requests are handled natively via the Android BiometricPrompt hardware security module.
- **Local Receipt Encryption**: Invoices and receipt images remain in isolated application sandbox storage.

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).
