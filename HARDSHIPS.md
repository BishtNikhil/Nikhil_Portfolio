# Engineering Hardships & Solutions (v2.1.0 Climax Release)

Building a robust, fully-integrated, and highly secure AI portfolio involves navigating significant engineering challenges. This document chronicles the major hurdles faced during the `v2.1.0` sprint and how they were overcome.

## 1. Looker Studio & BigQuery IAM Permissions
**The Challenge:**
The Looker Studio iframe was throwing an "Insufficient permissions to the underlying data set" error. The dashboard was successfully linked to the BigQuery `portfolio_data.visitor_logs` dataset, but public viewers couldn't see it.
**The Solution:**
Looker Studio enforces strict Google Account / Cloud IAM permissions. The solution was identifying that Looker Studio sharing settings had to be manually toggled to "Public / Anyone with the link can view". The underlying BigQuery API securely isolates public viewing capability from data manipulation.

## 2. Cloud DLP (Data Loss Prevention) Alignment
**The Challenge:**
Integrating the Google Cloud DLP API seamlessly into the Vertex AI RAG chatbot pipeline without creating unacceptable latency for users chatting with the AI Twin.
**The Solution:**
The DLP screening was securely decoupled to run natively inside the Node.js API Gateway prior to hitting the generative models. The user interface was updated to explicitly highlight this protective layer so users feel safe sharing data, featuring neon-glowing CSS indicators.

## 3. Responsive UI Quirks (Credly & Navigation)
**The Challenge:**
On mobile devices, the Credly badge grid was overflowing and cropping the SVG assets. The navigation bar's flexbox gap caused the primary logo (name) to awkwardly stack into three lines.
**The Solution:**
Implemented deep media queries (`@media (max-width: 768px)`).
- Switched the `.pii-protection-badge` from a standard flexbox to an `inline-block` architecture so the SVG Shield perfectly hugs text when it wraps.
- Stacked the navigation container into a `flex-direction: column` to gracefully preserve the main logo's integrity on phone screens.

## 4. Firestore Security Rules vs. Client Read Latency
**The Challenge:**
We implemented a live views tracker (`Hero.jsx`) that used Firebase client SDK `onSnapshot` to listen to `portfolio_stats/visits`. However, as part of our Security Audit, we enforced Cloud IAM and tight Firestore Security Rules, which unexpectedly severed the frontend's unauthenticated read access, silently breaking the tracker.
**The Solution:**
Instead of recklessly opening Firestore rules back up to the public web, a secure `GET /api/metrics/visits` proxy route was rapidly constructed in the Node.js API Gateway. The frontend was refactored to fetch the total metrics dynamically from the secure backend, preserving our strict security perimeter.

## 5. Security Audit Strictness
**The Challenge:**
Ensuring that moving fast did not introduce vulnerabilities, particularly concerning `.env` secrets or DDOS weaknesses.
**The Solution:**
Enforced a massive `.gitignore` sweep to ensure `.env`, `.env.local`, and `.env.*` files are stripped from GitHub tracking. Validated `helmet`, 10kb JSON payload caps, 15-minute 100-request Rate Limiting, and strict CORS policies inside the API Gateway.
