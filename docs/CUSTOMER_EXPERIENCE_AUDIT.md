# Customer Experience Audit — Akıllı Garson

**Date:** 2026-07-06  
**Role:** Senior Product Manager · UX Designer · Restaurant Operations Consultant  
**Scope:** End-to-end customer journey (QR → leave restaurant)  
**Method:** Product walkthrough of customer routes, copy, states, and staff-side parity — no code changes  
**Assumption:** Customer has never seen the app; only entry point is a QR code on the table

---

## Executive summary

The **core ordering loop** (scan QR → browse menu → add to cart → place order → see status) is **functional and largely intuitive** for a demo restaurant. The customer UI is mobile-oriented, visually cleaner than many staff screens, and the status timeline on the orders page is a genuine product strength.

However, the journey **stops halfway** through a real dining experience. Steps 10–11 (request bill, pay, leave) are **not implemented** despite copy and translation keys that imply they exist. Several trust-breaking gaps remain: order notes are collected but not sent, login page promises “Güvenli Ödeme,” and order numbers are full UUIDs.

**Verdict:** Suitable for an **RC1 demo of digital ordering + kitchen tracking**. Not yet suitable as a **complete self-service dining product** without staff intervention for payment and service calls.

| Dimension | Score (1–10) | Notes |
|-----------|--------------|-------|
| **UX Score** | **6.8** | Strong menu + cart; weak post-order and payment journey |
| **Professionalism Score** | **6.2** | Polished shell; placeholder images, misleading payment copy, technical order IDs |
| **Demo Readiness** | **7.0** | QR → order → track works for investor/staff walkthrough |
| **Self-service readiness** | **4.5** | Customer cannot complete meal without waiter for bill/payment |

**Would a real customer understand it without explanation?**  
**Partially.** On the happy QR path, yes for ordering. No for payment, bill, or what the back button does. A first-time user would ask: *“Nasıl ödeme yapacağım?”* and *“Garsonu nasıl çağırırım?”*

---

## Customer journey map

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────────┐
│ 1. Scan QR  │───▶│ 2. Menu load │───▶│ 3. Browse   │───▶│ 4. Product   │
│  ?token=…   │    │  (auto-skip  │    │ categories  │    │ detail modal │
│             │    │   login)     │    │ + search    │    │              │
└─────────────┘    └──────────────┘    └─────────────┘    └──────┬───────┘
                                                                   │
┌─────────────┐    ┌──────────────┐    ┌─────────────┐             │
│ 8. Kitchen  │◀───│ 7. Place     │◀───│ 5–6. Cart   │◀────────────┘
│ wait        │    │ order        │    │ add/edit    │
│ (polling)   │    │              │    │             │
└──────┬──────┘    └──────────────┘    └─────────────┘
       │
       ▼
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│ 9. Status   │───▶│ 10. Bill     │───▶│ 11. Leave   │
│ updates     │    │ ❌ NOT BUILT │    │ ❌ NO FLOW  │
│ timeline    │    │              │    │             │
└─────────────┘    └──────────────┘    └─────────────┘
```

| Step | Screen / route | Primary action | Status |
|------|----------------|----------------|--------|
| 1 | `/customer?token=qr-masa-1` | Auto-redirect to menu | ✅ Works |
| 2 | `/customer/menu` | Load public menu | ✅ Works |
| 3 | Category chips + search | Filter items | ✅ Works |
| 4 | Item card / detail modal | View name, desc, price | ⚠️ Partial (no allergens in API data) |
| 5 | `+ Ekle` / in-card qty | Add to cart | ✅ Works |
| 6 | Cart sidebar | Edit qty, remove, notes | ⚠️ Notes UI only — not persisted |
| 7 | `Sipariş Ver` | POST `/public/orders` | ✅ Works |
| 8 | Redirect to orders | Wait for kitchen | ✅ Passive wait |
| 9 | `/customer/orders` | Timeline + 15s poll | ✅ Works (delayed) |
| 10 | — | Request bill / pay | ❌ Missing |
| 11 | — | Thank you / session end | ❌ Missing |

---

## Step-by-step journey evaluation

### 1. Scan QR code

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ Yes — token in URL auto-stores session and opens menu |
| Missing info? | ⚠️ No restaurant name on first paint; customer may not know which venue they’re in |
| Confusing? | ⚠️ Brief flash of login page possible before redirect |
| Confidence? | ✅ Feels modern; no app install required |
| Wording | ✅ N/A on auto-path |
| Loading | ⚠️ “Menü yükleniyor…” plain text, no branded loader |
| Extra clicks? | ✅ Zero clicks on happy path |
| Staff parity | ✅ Same menu data as staff `Menu` page (public API) |

**Notes:** Primary path is well designed. Fallback `/customer` manual entry is a different product (table number vs token) and should not be the QR customer’s path.

---

### 2. Open menu

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ Header shows table (“Masa 1”); search + categories visible |
| Missing info? | ❌ **Restaurant name** (`publicMenu.restaurantName`) returned by API but **not displayed** |
| Confusing? | ⚠️ Back arrow returns to login — illogical after QR entry |
| Confidence? | ✅ Clean layout; sticky header |
| Wording | ✅ “Menüde ara…” is clear |
| Loading | ⚠️ Text-only loader; error state is functional (“Menü yüklenemedi” + retry) |
| Extra clicks? | ✅ None |
| Staff parity | ⚠️ Staff sees categories in sidebar nav; customer sees horizontal chips — acceptable |

---

### 3. Browse categories

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ Horizontal scroll chips with counts (“Tümü 12”, “Ana Yemekler 4”) |
| Missing info? | — |
| Confusing? | — |
| Confidence? | ✅ Active state clear (filled primary chip) |
| Wording | ✅ Turkish category names match staff menu |
| Loading | — |
| Extra clicks? | ✅ One tap per category |
| Staff parity | ✅ Same category taxonomy |

---

### 4. View products

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ Card grid: image, name, description, price, CTA |
| Missing info? | ⚠️ Allergens/calories UI exists in modal but **not populated** from public API; prep time not shown |
| Confusing? | ⚠️ Info (ℹ️) button only appears on **hover** — invisible on mobile touch |
| Confidence? | ❌ **Same stock photo for every dish** undermines trust (“is this really their food?”) |
| Wording | ✅ Descriptions are appetizing and professional |
| Loading | — |
| Extra clicks? | Optional modal tap for detail — good |
| Staff parity | ⚠️ Staff menu shows prep time; customer does not |

---

### 5. Add items to cart

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ “Ekle” → inline +/- controls; cart badge updates |
| Missing info? | ⚠️ No haptic/audio feedback; no “added to cart” micro-confirmation beyond badge |
| Confusing? | — |
| Confidence? | ✅ Price visible before add |
| Wording | ✅ “Ekle” is universal |
| Loading | — |
| Extra clicks? | ✅ Minimal (1 tap to add) |
| Staff parity | ✅ Same prices (public menu API) |

**Nice touch:** “Tekrar Sipariş” chips for recent items (localStorage) — good for repeat orders within session.

---

### 6. Edit cart

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ Sidebar cart: qty, remove, total |
| Missing info? | ❌ **Order notes field is shown but never sent to API** — customer believes kitchen sees the note |
| Confusing? | ⚠️ Cart opens from header icon only; no floating “Sepet (3)” bar when items exist |
| Confidence? | ⚠️ No tax/service line items; single “Toplam” only |
| Wording | ✅ “Sepetim”, “Sipariş notu (opsiyonel)” professional |
| Loading | — |
| Extra clicks? | 2 taps to open cart (icon → review) — acceptable |
| Staff parity | ⚠️ Staff order notes exist in domain; customer notes not wired |

---

### 7. Place order

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ “Sipariş Ver” with check icon |
| Missing info? | ❌ No estimated wait time; no order summary confirmation step |
| Confusing? | ⚠️ No disabled/loading state on button during submit |
| Confidence? | ✅ Toast “Siparişiniz alındı” + redirect to tracking |
| Wording | ✅ Clear CTA |
| Loading | ⚠️ Button does not show spinner while `createOrder.isPending` |
| Extra clicks? | ✅ One tap to confirm |
| Staff parity | ✅ Order appears on staff Orders/Kitchen immediately |

---

### 8. Wait for kitchen

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ⚠️ Customer must navigate to “Siparişlerim” (auto after order, or bottom bar) |
| Missing info? | ❌ No “estimated ready in X min”; no push notification |
| Confusing? | ⚠️ Passive wait — customer may return to menu and forget to check orders |
| Confidence? | ⚠️ 15-second polling feels sluggish vs real-time kitchen |
| Wording | — |
| Loading | ⚠️ Generic “Yükleniyor…” on orders page |
| Extra clicks? | — |
| Staff parity | ⚠️ Staff has WebSocket; customer polls HTTP |

---

### 9. Receive order status updates

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ✅ **Status timeline** (Alındı → Hazırlanıyor → Hazır → Servis) is excellent |
| Missing info? | ⚠️ Status descriptions help; no staff name or pickup instruction |
| Confusing? | ❌ **Order #660e8400-e29b-41d4-a716-446655443001** — UUID frightens non-technical users |
| Confidence? | ✅ Color-coded status badges; cancel while pending |
| Wording | ✅ “Sipariş Alındı”, “Hazırlanıyor”, “Afiyet olsun!” — warm and professional |
| Loading | Manual refresh button available |
| Extra clicks? | Tap card for detail modal — optional |
| Staff parity | ⚠️ Staff: “Bekliyor”; customer: “Sipariş Alındı” — semantically aligned, labels differ |

**Cancel flow:** `window.confirm` is functional but feels native/desktop, not app-quality.

---

### 10. Request bill

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ❌ **No UI** — translation keys exist (`callWaiter`, `requestBill`) but no buttons |
| Missing info? | ❌ Entire step absent |
| Confusing? | ❌ Login page says “Güvenli Ödeme”; orders page shows payment method icons — implies payment exists |
| Confidence? | ❌ Breaks trust at end of meal |
| Wording | N/A |
| Loading | N/A |
| Extra clicks | Customer must flag waiter physically |
| Staff parity | Staff handles payment in Orders module (staff-only, `API_ENABLED.payments: false` on customer) |

---

### 11. Leave restaurant

| Criterion | Assessment |
|-----------|------------|
| Intuitive? | ❌ No closing experience |
| Missing info? | ❌ No receipt, thank-you, rating, or session end |
| Confusing? | localStorage session persists indefinitely |
| Confidence? | — |
| Wording | `thankYou` key exists in i18n but unused |
| Staff parity | Staff marks order completed; customer may still see “Servis Edildi” without closure |

---

## Screen-by-screen review

### Customer Login (`/customer`)

| Area | Rating | Findings |
|------|--------|----------|
| First impression | ⚠️ | Dark premium hero — **visually disconnected** from light menu/orders |
| QR path | ✅ | Auto-redirect works; customer rarely sees this screen |
| Manual path | ❌ | Label “Masa Numarası” but field expects **token** (`qr-masa-1`), not “5” |
| Quick select 1–6 | ⚠️ | Demo convenience; real tokens are opaque strings |
| Trust claims | ❌ | “Güvenli Ödeme” with 💳 — **no payment flow exists** |
| Copy | ⚠️ | “Giriş yapılıyor…” for instant localStorage write — overstates work |
| Mobile | ✅ | Responsive @480px; large tap targets on submit |

---

### Customer Menu (`/customer/menu`)

| Area | Rating | Findings |
|------|--------|----------|
| Layout | ✅ | Sticky header, search, category chips, 2-col → 1-col grid on mobile |
| Cart | ✅ | Right sidebar; full-width on mobile |
| Empty states | ✅ | “Arama sonucu bulunamadı”; empty cart message |
| Error states | ✅ | Retry + back; improved in RC1 runtime pass |
| Loading | ⚠️ | Text-only “Menü yükleniyor…” |
| Touch targets | ⚠️ | Header 40×40 OK; in-card qty buttons 28×28 — **below 44px guideline** |
| Typography | ✅ | Clear hierarchy; prices prominent |
| i18n | ⚠️ | Most strings hardcoded Turkish; `useTranslation` used sparingly |
| Branding | ❌ | No logo, no restaurant name in header |

---

### Customer Cart (sidebar)

| Area | Rating | Findings |
|------|--------|----------|
| Edit qty | ✅ | +/- and remove |
| Notes | ❌ | **Collected, never submitted** — critical trust issue |
| Total | ✅ | Single total line |
| Submit | ⚠️ | No pending state on “Sipariş Ver” |
| Discovery | ⚠️ | Badge on cart icon only; no bottom “Checkout” when items > 0 |

---

### Customer Orders (`/customer/orders`)

| Area | Rating | Findings |
|------|--------|----------|
| Tracking | ✅ | Timeline + active/history sections |
| Empty state | ✅ | “Henüz sipariş yok” + CTA to menu |
| Error state | ✅ | Retry + navigate to menu |
| Loading | ⚠️ | Plain “Yükleniyor…” |
| Order ID | ❌ | Full UUID shown twice (card + modal) |
| Real-time | ⚠️ | 15s poll; no WebSocket for customer |
| Payment display | ⚠️ | Shows payment method if set by staff — customer cannot initiate |
| Mobile | ✅ | Cards stack well; modal scrollable |

---

### Order tracking (timeline component)

| Area | Rating | Findings |
|------|--------|----------|
| Clarity | ✅ | Best-in-app UX pattern |
| Accuracy | ✅ | Maps to staff status transitions |
| Gaps | ⚠️ | No notification when status → “Hazır” (customer must poll) |

---

## Cross-cutting themes

### Mobile responsiveness

- Dedicated `@media` breakpoints on menu (768px), login (480px), orders (768px).
- Fixed bottom “Siparişlerim” bar respects `padding-bottom: 80px` on scroll content.
- Cart sidebar goes full-width on small screens — good.
- **Gap:** No safe-area-inset for iPhone notch/home indicator on fixed bars.

### Typography & visual language

- Customer menu uses design tokens (`--bg-page`, `--primary`) — consistent internal system.
- Login uses Playfair Display + dark gradient — **feels like a different product**.
- Staff panel: dense operations UI; customer: consumer card grid — **appropriate split**, but login should match menu tone.

### Consistency with staff panel

| Element | Customer | Staff | Aligned? |
|---------|----------|-------|----------|
| Menu items | Public API | Staff API | ✅ Same catalog |
| Prices | ₺ whole lira | ₺ whole lira | ✅ |
| Order status labels | Sipariş Alındı / Hazırlanıyor | Bekliyor / Hazırlanıyor | ⚠️ Close |
| Order ID format | UUID | UUID | ⚠️ Both technical |
| Real-time | HTTP poll 15s | WebSocket | ❌ |
| Payment | Not available | Roadmap/staff modal | ❌ |
| Call waiter | i18n only | Notifications (staff) | ❌ |

### Loading, empty, and error states

| State | Menu | Orders | Login |
|-------|------|--------|-------|
| Loading | Text | Text | N/A (instant) |
| Empty | Search no results | No orders CTA | — |
| Error | Retry + back | Retry / menu link | Inline alert |

**Recommendation pattern for RC2:** Branded skeleton cards on menu; spinner + “Siparişiniz iletiliyor…” on submit; short order ref (#004) instead of UUID.

---

## Pain points (prioritized)

### Critical (trust / broken promise)

| ID | Pain point | Customer impact |
|----|------------|-----------------|
| P1 | Order notes UI not sent to kitchen | Customer writes “az acılı”; kitchen never sees it |
| P2 | “Güvenli Ödeme” on login, no payment | Feels deceptive at end of meal |
| P3 | No bill / pay / call waiter | Journey incomplete; must get physical waiter |
| P4 | UUID as order number | Confusion, feels “broken” or “technical” |

### High (friction / confusion)

| ID | Pain point | Customer impact |
|----|------------|-----------------|
| P5 | Back button → login after QR | Accidental logout from menu |
| P6 | Restaurant name not shown | “Am I in the right place?” |
| P7 | Identical placeholder images | Low appetite appeal; looks like template |
| P8 | Info button hover-only | Mobile users can’t discover detail modal easily |
| P9 | No submit loading on “Sipariş Ver” | Double-tap risk; uncertainty |
| P10 | 15s status polling | “Hazır” feels delayed vs kitchen reality |

### Medium (polish)

| ID | Pain point | Customer impact |
|----|------------|-----------------|
| P11 | Login dark theme vs menu light theme | Jarring if manual path used |
| P12 | `window.confirm` for cancel | Breaks app immersion |
| P13 | Manual login “Masa Numarası” mislabel | Wrong input for token-based QR system |
| P14 | No session end / thank you | Abrupt experience |
| P15 | Small touch targets on qty controls (28px) | Mis-taps on phones |
| P16 | i18n incomplete (hardcoded TR strings) | Blocks EN tourist use |

---

## Quick wins (1–3 days each, high ROI)

| # | Improvement | Addresses | Effort |
|---|-------------|-----------|--------|
| Q1 | Show `restaurantName` under table in menu header | P6 | Low |
| Q2 | Replace order display ID with short ref (last 4–6 chars or sequential) | P4 | Low |
| Q3 | Hide or disable order notes field until API supports it **OR** wire notes to API | P1 | Low–Med |
| Q4 | Remove “Güvenli Ödeme” from login until payment ships | P2 | Low |
| Q5 | Back button → confirm “Menüden çık?” or hide on QR-only sessions | P5 | Low |
| Q6 | Disable + spinner on “Sipariş Ver” while pending | P9 | Low |
| Q7 | Make info/detail tap open modal on image tap (already works); remove hover-only info btn | P8 | Low |
| Q8 | Branded loading skeleton on menu (match staff `SkeletonCard` pattern) | Loading | Low |
| Q9 | Floating cart bar when `cartCount > 0`: “Sepet · 3 ürün · ₺X →” | Cart discovery | Med |
| Q10 | Use `tableName` from API in orders header instead of raw token | Consistency | Low |

---

## High priority improvements (RC2 scope)

| # | Improvement | Rationale |
|---|-------------|-----------|
| H1 | **“Hesap İste” + “Garson Çağır”** bottom actions (i18n keys already exist) | Completes steps 10–11 minimally; ops-standard for QR dining |
| H2 | **Customer WebSocket or SSE** for order status | Parity with staff; “Hazır” feels instant |
| H3 | **Real menu photography** per item (or category placeholders) | Professionalism jump |
| H4 | **Order confirmation sheet** before submit (items, total, estimated wait) | Reduces errors and anxiety |
| H5 | **Payment handoff** — even “Pay at counter” or “Waiter will bring bill” explicit copy | Sets expectation honestly |
| H6 | **Unified customer visual theme** (login matches menu) | Brand coherence |
| H7 | **Push notification / sound** when status → ready (PWA) | High perceived value |
| H8 | **Allergen / dietary tags** on public menu API | Safety and confidence |

---

## Nice-to-have improvements

| # | Idea |
|---|------|
| N1 | Tip suggestion on bill request |
| N2 | Split bill between table guests |
| N3 | Rate your meal after `completed` |
| N4 | Multi-language toggle (EN/TR) on customer header |
| N5 | Apple Pay / Google Pay integration |
| N6 | “Order again” from history (beyond localStorage chips) |
| N7 | Estimated prep time per item (staff menu has `preparationTime`) |
| N8 | Dark mode for evening dining |
| N9 | Accessibility: larger text mode |
| N10 | Session timeout + privacy (“Clear my data when I leave”) |

---

## Demo readiness assessment

### What works today (show confidently)

1. Scan `?token=qr-masa-1` → lands on menu in ~2s  
2. Browse 12 items across 4 categories  
3. Add items, open cart, place order  
4. Kitchen/staff sees order on Orders + Kitchen  
5. Customer sees timeline update as staff advances status  
6. Cancel while pending  

### What to avoid in demo

- Do not mention payment or “Güvenli Ödeme”  
- Do not type order notes (they don’t arrive)  
- Do not use back arrow from menu  
- Do not point at order UUID — say “sipariş takip ekranı”  
- Do not promise bill from phone  

### Demo script (3 minutes)

```
1. Phone scans QR → menu opens on Masa 1
2. Add Mercimek Çorbası + Izgara Köfte
3. Open cart → Sipariş Ver
4. Show Siparişlerim timeline
5. Staff advances Kitchen → customer refresh shows Hazırlanıyor → Hazır
6. Verbal: "Ödeme ve hesap şu an garson üzerinden; mobil ödeme RC2'de"
```

---

## Final scores & recommendation

| Metric | Score | Target for RC1 | Target for GA |
|--------|-------|----------------|---------------|
| UX Score | **6.8 / 10** | 7.0 | 8.5 |
| Professionalism | **6.2 / 10** | 6.5 | 8.0 |
| Demo Readiness | **7.0 / 10** | 7.5 | — |
| Self-service completeness | **4.5 / 10** | 5.0 | 8.0 |

**RC1 recommendation:** Ship customer flow as **“QR Order & Track”** — not **“Full QR Dining.”** Label clearly in README and in-restaurant signage: *“Sipariş verin, durumu takip edin; ödeme masada.”*

**Top 3 actions before any customer-facing pilot:**

1. Fix or remove order notes (P1)  
2. Remove misleading payment copy (P2)  
3. Add “Hesap İste / Garson Çağır” or honest “Ödeme masada” banner (P3)  

---

## Appendix: Route inventory

| Route | Purpose | RC1 status |
|-------|---------|------------|
| `/customer` | Manual table entry (fallback) | ⚠️ Demo only |
| `/customer?token=*` | QR entry | ✅ Primary |
| `/customer/menu` | Browse + cart + order | ✅ |
| `/customer/orders` | Track + cancel | ✅ |
| `/customer/bill` | — | ❌ Not routed |
| `/customer/pay` | — | ❌ Not routed |

---

*Audit based on customer pages (`CustomerLogin`, `CustomerMenu`, `CustomerOrders`), public API contracts, i18n (`tr.js` customer section), runtime verification logs, and screenshot `06-customer-menu.png`. No code was modified during this review.*
