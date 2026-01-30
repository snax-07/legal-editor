# LegalBridge Document Editor - Technical Documentation

A high-fidelity, A4-compliant legal document editor built with **Next.js 16**, **TypeScript**, and **Tiptap**. Engineered to handle the specific constraints of USCIS legal filings.

---

## 🚀 The Evolution of Our Approach

During development, three distinct architectural patterns were considered for the pagination system. Below is the analysis of why we chose the final implementation.

### 1. The "Physical Node Split" (Discarded)
* **Method:** Programmatically splitting Tiptap JSON nodes into separate arrays when a height limit is reached.
* **Why we moved on:** This breaks the native browser "Undo/Redo" history and causes the cursor to jump erratically when typing at the boundary of two pages. It is not suitable for a professional-grade editor.

### 2. The "CSS Overlay & Masking" (Discarded)
* **Method:** Using CSS background gradients to "hide" text in the margin areas.
* **Why we moved on:** While visually pleasing, it created "Text Overlap" where letters could still technically be typed *under* the margin, making it difficult for users to see what they were writing at the page break.

### 3. The "Virtual Flow & Ghost Paper" (Final Choice)
* **Method:** A layered architecture where a transparent **ProseMirror Content Layer** sits atop a dynamic **UI Paper Stack**.
* **Why we used this:** * **Data Integrity:** Keeps the document as a single, continuous JSON object.
    * **Visual Fidelity:** Uses a `scrollHeight` observer and CSS `linear-gradient` to create a "Safe Zone."
    * **Word-Like Experience:** Text flows naturally across pages. By adjusting the `background-size` to match the A4 height exactly, we create a visual "jump" that mimics the page-break behavior of Microsoft Word or Google Docs.

---

## 🛠️ Technical Implementation Details

### USCIS Standard Configuration
* **Page Size:** 794px x 1123px (A4 @ 96 DPI).
* **Margins:** Strict 1-inch ($96px$) padding on all four sides.
* **Typography:** Times New Roman, 12pt, 1.15 line-height (optimized for legal readability).

### Stability & Next.js 16 Integration
To handle the cutting-edge Next.js 16 environment (Turbopack), the following safeguards were implemented:
* **Hydration Shield:** Used a `mounted` state pattern to prevent the editor from attempting to render on the server, which avoids the common `localsInner` Turbopack runtime error.
* **ImmediateRender False:** Specifically disabled to allow React to take full control of the DOM lifecycle.

---

## 🏗️ Extension Architecture

| Extension | Role in Legal Drafting |
| :--- | :--- |
| **Table** | Used for organizing petitioner data, evidence lists, and financial summaries. |
| **TextAlign** | Critical for signature blocks and right-aligned headers (e.g., "To: Department of Homeland Security"). |
| **StarterKit** | Handles the heavy lifting of bold, italic, and document history. |

---

## 📦 Installation

1. **Clone & Install:**
   ```bash
   npm install