# TMS Complaint Mobile App (React Native & Expo)

A cross-platform React Native mobile application built with Expo for the Ticket & Facility Management System (TMS).

---

## 📱 Features

- **Authentication & Secure Storage**: Sign in using `AsyncStorage` session management and configurable backend API IP target.
- **Role-Based Navigation**:
  - **Regular Users**: Submit complaints, attach photos, filter & track personal tickets.
  - **Staff / Admin Users**: Review incoming tickets, update statuses (`Pending`, `In_Progress`, `Resolved`, `Rejected`), and assign staff.
  - **SuperAdmin**: Full CRUD access to Masters (Departments, Users, Programmes, Blocks, Rooms, Roles) & Analytics Reports.
- **Native UI & UX**:
  - Glassmorphic dark theme (`#0F172A`).
  - Native Stack & Bottom Tab Navigation using `@react-navigation`.
  - Expo Vector Icons (`@expo/vector-icons`).
  - Image picker integration for complaint attachments & profile avatars (`expo-image-picker`).

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- [Expo Go App](https://expo.dev/go) installed on your iOS / Android phone **OR** Android Studio / Xcode simulator.

### 2. Installation & Running
From the workspace root directory:

```bash
cd mobile
npm start
```

### 3. Running on Emulator / Physical Device
- **Android Emulator**: Press `a` in the terminal to launch on Android emulator.
- **iOS Simulator** (macOS): Press `i` to launch on iOS simulator.
- **Physical Device**: Scan the generated QR code using the **Expo Go** app on your device (ensure phone and dev computer are on the same Wi-Fi network).

---

## ⚙️ Connecting to Backend API

- Default backend URL for Android Emulator: `http://10.0.2.2:5000/api`
- Default backend URL for Expo Web / iOS Simulator: `http://localhost:5000/api`
- **For Physical Devices**: You can tap **"Configure Backend URL"** on the Login screen or Profile screen and enter your computer's Wi-Fi local IP (e.g., `http://192.168.1.100:5000/api`).
