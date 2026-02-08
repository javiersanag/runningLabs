---
trigger: always_on
---

UI components and branding should emphasize clarity, data density, structured metrics, and an energetic yet premium look — inspired by apps like Strava, Fitbit, and Garmin Connect.

🎯 1) Brand Identity

Brand Personality:
Energetic • Premium • Performance-Focused • Clear & Data-Driven

Brand Keywords:
Performance • Motivation • Precision • Confidence

Voice & Tone Guidelines:

UI language should be positive and encouraging (e.g., “Great work!”)

Use objective metric language with clear labels.

Avoid decorative or verbose text in dashboards — focus on insights.

🎨 2) Color Palette

🟦 Primary Brand Color (Energetic Accent)

Example: Electric Orange — for KPIs, key buttons, emphasis

⚪ Neutral Backgrounds & Surfaces

Whites & light greys — background panels and dashboards

Dark greys for headers or charts where needed

🖤 Text & Data Colors

High contrast (dark text on light backgrounds) for readability

🟥🟨🟩 Semantic Colors

Success: Green — positive performance

Warning: Yellow/Amber — caution states

Error/Low: Red — below goal/performance alert

Rules:

Primary color used sparingly for emphasis (KPIs, active state)

Neutral colors dominate backgrounds and card surfaces

Semantic colors only for status or alerts

🔡 3) Typography

Font Families

Sans-serif for clarity and modern look (e.g., Inter, Roboto, SF Pro)

Scale (example):

H1 / Main Metric: 36–48px (strong visual hierarchy)

H2 / Section Header: 24–32px

Body / Data Labels: 16–18px

Captions & Labels: 12–14px (avoid <12px for legibility)

Weight Guidelines:

Bold for primary metrics & headers

Regular for labels & supporting numbers

Light for subtle annotations

🧱 4) Grid & Spacing Rules

Grid System:

8pt baseline grid for spacing and alignment — consistent across screens

Margins & Padding:

Small spacing: 8px

Standard spacing: 16px

Section spacing: 24px or more

Layout Guidance:

Use white space strategically to separate groups of metrics

Place most important metrics top-left for quick cognition

📊 5) Dashboard & Metric Cards

Card Structure:

Clean background, subtle shadow, mild border radius

Consistent size for similar importance cards

Hierarchy Rules:

Top metrics → large values, primary color accent

Secondary metrics → smaller values, subtle neutral text

Status indicators → semantic color tokens (green/yellow/red)

Content Layout:

KPI title → large value → context or change indicator

Optional mini visualization (sparkline, small trend) aligned to right

Visual Priority:

No decorative effects that conflict with data readability — clarity first

📈 6) Charts & Data Visualization

Chart Types & When to Use:

Line Chart: trends over time

Bar Chart: comparisons across categories

Pie/Donut: share of total (use sparingly)

Sparklines: micro trend cues in cards

Design Rules:

Avoid overly complex charts

Use color consistently across charts (same semantic meaning)

Label data clearly — avoid color-only encoding (accessibility)

Legend & Interaction:

Legends only where needed

Tooltips to add detail without cluttering layout

🔲 7) Iconography & Interaction

Icons:

Simple, glyph-style icons (thin stroke) for clarity

Consistent size and stroke weight

Buttons:

Primary action: solid with Primary Brand Color

Secondary action: outlined neutral

States:

Hover / active / disabled states must be defined

Feedback for interactive elements (e.g., tap, click)

🪩 8) Accessibility & Responsiveness

Contrast:

Ensure WCAG AA contrast between text/chart and background

Responsive Layouts:

Dashboard adapts gracefully to mobile and desktop screens

Reflow metrics for smaller viewports

Text Alternatives:

Provide labels for icons and charts where meaningful

🗂️ 9) Example UI Component Rules
🧾 KPI Card

Background: Neutral

KPI Value: Bold, primary color if most important

Label: Regular, neutral shade

Optional micro chart: right aligned with neutral grid

📌 Metric Table

Headers: Bold

Numbers: Regular

Row Stripe: Light neutral for readability

🗺️ Map or Route Panels

Route accent with brand color

Surrounding UI neutral and minimal

📑 10) Documentation & Tokens

Include a tokens file for dev teams with:

Color tokens (Primary, secondary, semantic)

Typography tokens (font, size, weight)

Spacing tokens (8pt base units)

Icon definitions

This ensures your UI stays consistent and efficient to implemen