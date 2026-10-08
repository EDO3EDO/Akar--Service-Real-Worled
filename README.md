# 🏠 Akar Service

> A comprehensive web application designed to manage and deliver home maintenance and real estate services efficiently.

---

## 🔗 Quick Links

- **Live Demo:** [View Live on Firebase](https://akar-service-real-world.web.app)
- **Status:** In Progress

---

## 🧪 Test Credentials (Live Demo Access)

You can use the following test account :

- **Email:** `test123@gmail.com`
- **Password:** `Test123@123`

---

## 🎥 Project Demo

![Akar Service Demo](demo.gif)

---

## 🛠️ Tech Stack

- **Frontend:** Angular, Standalone Components, TypeScript, RxJS, Signals
- **Styling & UI:** Bootstrap 5, Font Awesome, Custom CSS (HEX values)
- **Backend & Cloud:** Firebase (Firestore, Cloud Functions, Authentication, Cloud Storage)
- **Payment Integration:** Paymob API (Secure iframe & online transactions)
- **Localization:** ngx-translate (Multi-language support)
- **Deployment:** Firebase Hosting

---

## ✨ Key Features

- **Advanced Admin Management System:** Comprehensive control panel allowing admins to manage and control workers, clients, and supervisors directly from the dashboard.
- **Role-Based Access Control & Guards:** Implemented custom Angular Guards and role-based permissions ensuring users only access authorized pages based on their specific roles.
- **Authentication System:** Secure user registration and login system powered by Firebase Auth.
- **Real-time Order Tracking:** Live status tracking for service requests using Firestore Snapshots.
- **Worker Verification & Management:** Dedicated dashboard and storage for verifying worker credentials, ID cards, and criminal records to ensure platform safety and reliability.
- **Real-time Admin-Client Chat System:** Built-in real-time chat module enabling direct communication between customers and admins to resolve issues instantly.
- **Worker Earnings Wallet:** Financial wallet system for managing worker earnings and expenses accurately.
- **Online Payment:** Integrated with Paymob API for secure online transactions.
- **Admin Analytics Dashboard:** Dedicated dashboard for managers to monitor statistics and key metrics.
- **Multi-Language (AR/EN):** Full bilingual support using `ngx-translate`.

---

## 💡 Technical Challenges & Solutions

1. **Challenge 1 (Role Security & Unauthorized Access):**
   - _Problem:_ Preventing unauthorized users or clients from accessing sensitive admin or supervisor routes/pages.
   - _Solution:_ Developed robust custom **Angular Guards** integrated with role management (`Roles/Permissions`) to intercept routing and secure page access according to user privileges.
2. **Challenge 2 (Incomplete User Profile Data on First Login):**
   - _Problem:_ When users signed up or logged in via external providers, their profiles came with pre-filled basic emails only, leaving critical user details missing.
   - _Solution:_ Developed a dedicated Onboarding/Profile Completion flow that intercepts first-time logins, prompting users to fill in and save their missing data to Firestore seamlessly.
3. **Challenge 3 (Service Pricing Security):**
   - _Problem:_ Service prices were originally hardcoded manually, making them vulnerable to client-side tampering or modification.
   - _Solution:_ Migrated all pricing data to be dynamically fetched and managed securely from the database, preventing unauthorized modifications.
4. **Challenge 4 (UI Rendering Latency & State Lag):**
   - _Problem:_ Frequent UI flickering and performance delays caused by standard variable binding approaches.
   - _Solution:_ Adopted **Angular Signals** to manage reactive state efficiently, resulting in optimized rendering and smoother UI updates.
5. **Challenge 5 (Secure Payment Handling):**
   - _Problem:_ Safely generating and managing Paymob payment keys without exposing secret server credentials on the client side.
   - _Solution:_ Built secure server-side logic using **Firebase Cloud Functions** to handle payment requests and generate keys safely.
6. **Challenge 6 (Real-time Performance & Optimization):**
   - _Problem:_ High Firestore read consumption due to frequent updates on active service listings.
   - _Solution:_ Optimized queries, used `onSnapshot` carefully, and ensured proper unsubscription cleanup to prevent memory leaks.

---

