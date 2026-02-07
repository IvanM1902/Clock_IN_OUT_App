# 🕒 Secure Kiosk Attendance System
A professional, full-stack employee time-tracking solution designed for fixed-location terminals. This system features a proprietary hardware-locking mechanism that ensures staff can only clock in from authorized, on-site devices.

# 🚀 Key Features
Verified Terminal Access: A PIN-based entry system that operates in a secure "Kiosk Mode" environment.

Hardware Safeguard (UUID): A security layer that binds the application to specific hardware, preventing unauthorized access from personal devices or remote locations.

Admin Control Panel: A centralized dashboard to monitor active sessions, manage staff members, and view comprehensive attendance history.

One-Click Authorization: Simplifies the setup of new terminal hardware directly from the administrative interface.

Persistent Session Management: Optimized for long-term stability on dedicated tablets or smartphones.

# 🛠️ Tech Stack
Backend
Java 17+ with Spring Boot

Spring Data JPA (Relational Database Mapping)

H2 / PostgreSQL / MySQL

Lombok (Boilerplate reduction)

Frontend
React.js (Vite)

Tailwind CSS (Utility-first styling)

React Router (Client-side routing)

# 🔐 Security Architecture
To maintain the integrity of location-based attendance without requiring expensive static IP addresses, this system uses a Unique Device Identifier (UUID) model:

Identity Generation: Upon first launch, the terminal generates a unique cryptographic fingerprint stored in the device's persistent localStorage.

Administrative Approval: The administrator must explicitly approve this specific device fingerprint through the secure Settings panel.

Encrypted Validation: Every transaction (Clock-In/Clock-Out) is validated against the database to ensure the request originates from a registered hardware ID.
