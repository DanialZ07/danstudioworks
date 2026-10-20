# DanStudio Works

> **Precision-Crafted Digital Experiences**

A private-queue web design studio portfolio and client management system. DanStudio Works is a boutique digital studio based in Malaysia that operates on a selective, invitation-style client queue — ensuring every project receives undivided attention and meticulous craftsmanship.

---

## Tech Stack

- **Pure HTML5** — Semantic, accessible markup
- **CSS3** — Custom properties, glass morphism, aurora gradients
- **JavaScript (ES6+)** — Vanilla JS, no frameworks
- **No build tools required** — Zero-config static site
- **Cloudflare Pages** — Global edge deployment with custom headers & redirects

---

## Project Structure

```
DanStudio Works/
├── index.html              # Homepage — hero, services, testimonials
├── projects.html           # Portfolio showcase with filtering
├── packages.html           # Pricing tiers & add-on calculator
├── contact.html            # Client application form
├── assets/
│   ├── css/
│   │   ├── styles.css      # Global styles & design system
│   │   ├── home.css        # Homepage-specific styles
│   │   ├── projects.css    # Projects page styles
│   │   ├── packages.css    # Packages page styles
│   │   └── contact.css     # Contact page styles
│   ├── js/
│   │   ├── main.js         # Shared navigation & utilities
│   │   ├── home.js         # Homepage interactions
│   │   ├── projects.js     # Portfolio filtering & modals
│   │   ├── packages.js     # Pricing calculator logic
│   │   └── contact.js      # Form validation & submission
│   └── images/             # Optimized image assets
├── _headers                # Cloudflare Pages security headers
├── _redirects              # Cloudflare Pages URL redirects
├── robots.txt              # Search engine crawling rules
├── sitemap.xml             # XML sitemap for SEO
├── package.json            # Project metadata & scripts
└── README.md               # This file
```

---

## Features

- **Silk & Aurora Dark Theme** — Deep midnight background (#07080E) with luminous cyan and magenta accents
- **Responsive Glass Morphism UI** — Frosted-glass cards with backdrop-blur and subtle borders
- **Private Client Application Queue** — Selective intake via a structured application form
- **Developer 2FA Authentication** — Secure admin access with two-factor verification
- **Queue Management Console** — Backend dashboard for managing client pipeline
- **Interactive Pricing Calculator** — Dynamic add-on selection with real-time cost preview
- **SEO Optimized** — Semantic HTML, Open Graph tags, structured data, XML sitemap
- **Mobile-First Design** — Thumb-friendly bottom dock navigation on mobile devices
- **Smooth Animations** — Cubic-bezier transitions, scroll-triggered reveals, aurora gradients

---

## Getting Started

```bash
# Clone the repository
git clone <repo-url>
cd danstudio-works

# Option 1: Serve with npx
npx serve .

# Option 2: Serve with Python
python -m http.server 8000

# Option 3: Use the npm script
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000) (or port 8000 for Python) in your browser.

---

## Brand Colors

| Token           | Hex       | Usage                        |
| --------------- | --------- | ---------------------------- |
| Midnight        | `#07080E` | Background                   |
| Luminous Cyan   | `#22D3EE` | Primary accent, CTAs, links  |
| Magenta Orchid  | `#D946EF` | Secondary accent, gradients  |
| Pearl White     | `#F1F5F9` | Primary text                 |
| Slate           | `#94A3B8` | Secondary / muted text       |

---

## Developer Access

The developer console is accessed via an easter egg:

1. **Click the DanStudio logo 5 times rapidly** (within 2 seconds)
2. A 2FA authentication modal will appear
3. Enter valid credentials to access the queue management dashboard

> ⚠️ Credentials are required. Unauthorized access attempts are logged.

---

## Deployment

This project is configured for **Cloudflare Pages**:

- `_headers` — Security headers (CSP, X-Frame-Options, etc.) and caching rules
- `_redirects` — Legacy URL redirects (301 permanent)
- `robots.txt` — Crawling directives with sitemap reference
- `sitemap.xml` — Full sitemap for search engine indexing

Simply connect the repository to Cloudflare Pages — no build command is needed.

---

## License

**Private** — All rights reserved © 2024 DanStudio Works

This project and its source code are proprietary. Unauthorized copying, modification, distribution, or use of any part of this project is strictly prohibited without explicit written permission from DanStudio Works.
