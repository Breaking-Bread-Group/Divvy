# Divvy

Divvy is a mobile application designed to simplify group expense management. It tackles the common challenge of splitting bills fairly—whether among roommates, friends, couples, or temporary groups—by tracking payments and debts, and automating expense calculations.

## Product Showcase

<img width="250" height="460" alt="Screenshot 2025-05-24 at 6 38 11 PM" src="https://github.com/user-attachments/assets/424b395a-c36c-4000-9d82-0fae83915a7c" />
<img width="250" height="460" alt="Screenshot 2025-05-24 at 6 36 59 PM" src="https://github.com/user-attachments/assets/d717e7dd-41f1-4f83-be01-d8096283acf2" />
<img width="250" height="460" alt="Screenshot 2025-05-24 at 6 37 39 PM" src="https://github.com/user-attachments/assets/86089081-e361-46a1-9285-b5563c70cb45" />
<img width="250" height="460" alt="Screenshot 2025-05-24 at 6 37 27 PM" src="https://github.com/user-attachments/assets/f1140142-7057-4185-bbc5-56f686d0f4af" />
<img width="250" height="460" alt="Screenshot 2025-05-24 at 6 40 57 PM" src="https://github.com/user-attachments/assets/ca95c497-2768-4fb4-81a0-0da34d9d0373" />
<img width="250" height="460" alt="Screenshot 2025-05-24 at 6 40 44 PM" src="https://github.com/user-attachments/assets/9abc5b52-3e04-45b6-b79b-4eb64419e0b8" />

## Features

**User Account Management**
  - Create and delete accounts with secure email verification.
  - Link or update credit card information for seamless payment processing.

**Group Management**
  - Create long-term or one-time groups for recurring or temporary expenses.
  - Invite and manage group members, with options for admins to remove members as needed.

**Expense Tracking and Payment**
  - Log expenses with flexible splitting options (even or percentage-based).
  - Automatically calculate individual contributions and update bill histories.
  - Process payments, handle refunds, and adjust group balances manually when necessary.

**Notifications**
  - Real-time alerts for expense updates, group changes, and payment statuses.

## System Architecture

**Frontend:** Built using React Native to ensure a smooth and responsive mobile experience.
**Backend:** Powered by Node.js with MySQL for secure and efficient data management.
**Security:** Incorporates advanced encryption, hashing, and sanitization techniques to protect user data.

## Key Use Cases

**Account Operations:** 
  - **Registration:** Users create an account with required personal information and confirm via email.
  - **Deletion:** Accounts can be deleted provided there are no outstanding group obligations.

**Group and Expense Management:** 
  - **Group Creation:** Users can form groups to share recurring or one-time expenses.
  - **Expense Creation:** Admins can add expenses, assign splits (fixed or percentage-based), and push them to the group.
  - **Expense Settlement:** Users accept their assigned split and process payments securely.

**Payment Reconciliation:**
  - **Refunds:** Users can request refunds for erroneous or disputed transactions.
  - **Manual Adjustments:** Admins can adjust group balances to account for real-world scenarios like cash payments or corrections.

## Team

**Abdul-Malik Mohammed** – Full-Stack Developer, specializing in cybersecurity and payment integrations.  

**Sommer Hope** – Frontend Developer with expertise in React.js, Tailwind CSS, and modern web design.  

**Minh Nguyen** – Developer skilled in Python, cybersecurity, and data structures.  

**Tyus Wyche** – Developer experienced in Java, Flutter, and database systems.  

**Matthew Martinez** – Systems and Security Specialist with a focus on encryption, webserver development, and open-source project maintenance.

## Getting Started

### Deploy Backend

1. Install dependencies

  ```bash
  cd backend && npm install
  ```

2. Generate certs

  ```bash
  sh ssl.sh
  ```

3. Create ServerSettings.json

  ```bash
  cp ServerSettings.json.template ServerSettings.json
  ```

4. Fill in the blank values of ServerSettings.json with appropriate settings. They are sensitive information and must not be uploaded outside of the machine.

5. Create the database by running SetupServer.sql in your mysql interface of choice

- Commands to build or run it:
  ```
  npm run build              - Build the server, but do not run when finished
  npm run start / npm start  - Run the server, but do not rebuild (will use existing build, make sure it has already been built)
  npm run full               - Build and Run the server when completed
  ```

### Deploy Test Server

1. Install dependencies

   ```bash
   cd frontend/src && npm install
   ```

2. Start the app

   ```bash
    npx expo start
   ```

3. Open the app [Open below link for web, or scan QR code for IOS/Android]

   ```bash
    http://localhost:8081
   ```
In test server, username/password are currently placeholders. Just click Signup/Login to continue.


## Acknowledgements

Special thanks to Dr. Tushara Sadasivuni for guidance, and to our dedicated team for bringing Divvy to life.
