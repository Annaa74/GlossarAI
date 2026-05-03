# GlosserAI Privacy Policy

**Last updated:** 2026-05-03
**Effective date:** 2026-05-03

GlosserAI ("we", "our", or "the app") is a vocabulary-learning application provided by an independent developer. This Privacy Policy explains what information we collect, how we use it, and the choices you have.

## 1. Information we collect

### 1.1 Account information (only when you sign up)

If you create an account using email and password (or Google sign-in), we collect:

- Your **email address**
- A **display name** you choose
- An **encrypted authentication credential** managed by Google Firebase Authentication (we never see or store your raw password)
- The **date you created the account**

### 1.2 Learning data

To power spaced repetition and progress tracking, we store:

- Which vocabulary cards you have marked **known**, **learning**, or **favorite**
- Your **study streak** (consecutive days studied)
- Your **last study date**
- Your **notification preferences** (whether reminders are on, the time of day, and frequency)

### 1.3 Information we do NOT collect

- We do **not** collect your real name, phone number, address, or payment information.
- We do **not** track your location.
- We do **not** read your contacts, photos, microphone, or other personal device data.
- We do **not** sell your data to anyone, ever.
- We do **not** display advertising.

### 1.4 Guest mode

If you use the app in **Guest mode** (the "Continue as guest" option), no information is sent off your device. Everything is stored locally and is erased if you uninstall the app or clear its data.

## 2. How we use your information

We use the information described above to:

- Authenticate you when you sign in
- Sync your progress across devices you sign in on
- Send the daily-reminder notifications you have opted in to
- Maintain and improve the app

We do not use your information for advertising, profiling for third parties, or any purpose unrelated to running GlosserAI.

## 3. Third-party services

GlosserAI is built on the following third-party services, each governed by its own privacy policy:

| Service                        | Purpose                                                                                                                                                          | Privacy policy                              |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| Google Firebase Authentication | Account sign-in                                                                                                                                                  | https://firebase.google.com/support/privacy |
| Google Cloud Firestore         | Storing your account profile and progress                                                                                                                        | https://firebase.google.com/support/privacy |
| Anthropic (Claude API)         | (Optional) Generating "explain like I'm five" rewrites and weekly trending vocabulary updates. Requests are anonymized — we do not send your account identifier. | https://www.anthropic.com/legal/privacy     |
| Expo / EAS                     | Build and over-the-air update infrastructure                                                                                                                     | https://expo.dev/privacy                    |

## 4. Data retention and deletion

You can **delete your account at any time** from the in-app **Profile → Delete Account** menu. When you do:

- Your account is permanently deleted from Firebase Authentication
- Your profile document and all associated learning data is permanently deleted from Firestore
- Local cached data is cleared on your next app launch
- The deletion is immediate and irreversible

If you would prefer to delete your account by email, contact us at the address in Section 8 and we will action your request within 30 days.

## 5. Children's privacy

GlosserAI is not directed to children under 13, and we do not knowingly collect personal information from children under 13. If you believe a child has provided us with information, contact us and we will delete it.

## 6. Security

- Passwords are handled exclusively by Firebase Authentication and are never stored or transmitted in plain text.
- Data in transit between your device and Firebase is encrypted using TLS.
- Data at rest in Firebase is encrypted by Google.
- Access to your profile document is restricted by Firestore security rules so only you (when signed in) can read or modify it.

No system is perfectly secure. If we ever discover a breach affecting your data, we will notify you within 72 hours.

## 7. Your rights

Depending on where you live (notably under GDPR in the EU/UK and CCPA in California), you may have the right to:

- **Access** the data we hold about you
- **Correct** inaccurate data
- **Delete** your data (also available in-app — see Section 4)
- **Export** your data in a portable format
- **Object** to processing

To exercise any of these rights, contact us at the address in Section 8.

## 8. Contact

For privacy questions or requests, email: **vdhruvyt@gmail.com**

## 9. Changes to this policy

We may update this Privacy Policy from time to time. When we make material changes, we will:

- Update the "Last updated" date at the top
- Show an in-app notice on next launch
- For significant changes, ask you to re-accept

The latest version is always available at the URL where you found this document.
