---
name: brand-styling
description: dstack brand identity, colors, typography, and visual styling guidelines. Use when creating UI components, pages, or any visual elements.
disable-model-invocation: true
---

# dstack branding

## Overview

To access dstack's official brand identity and style resources, use this skill.

Keywords: branding, corporate identity, visual identity, styling, brand colors, typography, dstack brand, visual formatting, visual design, dstack

## Brand Guidelines

### Colors

Main Colors:

Teal:
#0da5a1 - Primary brand color, calls to action, active states

Background:
#f7f7f4 - Page background (warm off-white, not pure white)

Foreground:
#26251e - Primary text and dark elements

Card:
#f2f1ed - Card surfaces and elevated containers

Muted:
#6e6c5e - Secondary text and subdued labels

Border:
#d5d4cd - Borders, dividers, and separators

Accent Colors:

Teal Gradient Start:
#0da5a1 - Brand gradient start (287deg angle)

Teal Gradient End:
#00d4cf - Brand gradient end (lighter teal)

Semantic Colors:

Success:
#25935f - Success states and positive indicators

Warning:
#ec9c13 - Warning states and caution indicators

Error:
#dc2828 - Error states and destructive actions

Card Hierarchy (light to dark):

#f2f1ed - Card (base surface)
#f0efeb - Card-01 (slightly elevated)
#ebeae5 - Card-02 (mid elevation)
#e6e5e0 - Card-03 (high elevation)
#e1e0db - Card-04 (highest elevation)

### Typography

Display/Brand: Manrope (with system sans-serif fallback)
Body Text: Inter (with system sans-serif fallback)
Data/Labels: System monospace (SF Mono, Menlo, Consolas)

## Features

### Smart Font Application

- Applies Manrope to brand and display text (logo, hero sections, loading screens, onboarding)
- Applies Inter at light weight to all body text
- Applies monospace to data labels, statistics, tabular numbers, status badges, and micro-labels
- Manrope should use tight letter-spacing for brand moments
- Standard UI text (form labels, table cells, body copy) stays on Inter

### Text Styling

- Headings and brand moments: Manrope, tight tracking
- Body text: Inter, light weight
- Data and metrics: Monospace, small size (10-11px), uppercase, wide tracking
- Tabular numbers always use monospace for alignment
- Smart color selection based on surface — darker text on light surfaces, lighter text on dark
- Preserves text hierarchy and formatting

### Color Application

- Warm neutral palette throughout — cream and off-white tones, never stark white
- Brand teal used for primary actions, focus rings, and interactive highlights
- Brand gradient reserved for premium or highlight elements — use sparingly
- Card hierarchy provides layered depth through progressively darker warm neutrals
- Semantic colors (success, warning, error) only for their intended status meaning

### Shape and Accent Colors

- Non-text elements use the brand teal or card hierarchy colors
- Brand gradient cycles from #0da5a1 to #00d4cf at a 287deg angle
- Maintains visual interest while staying on-brand
- No emojis anywhere — not in UI, copy, or documentation
