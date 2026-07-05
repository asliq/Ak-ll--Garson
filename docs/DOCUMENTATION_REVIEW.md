# Documentation Vendor-Neutrality Review

**Date:** 2026-07-04  
**Scope:** All project documentation (`README.md`, `api/README.md`, `docs/*.md`)  
**Goal:** Remove references to specific companies, brands, and commercial software vendors so the repository reads as an **independent software engineering portfolio**, not material targeted at a particular organization.

---

## Summary

| Metric | Count |
|--------|------:|
| Markdown files reviewed | 22 |
| Files updated | 10 |
| Files unchanged (already neutral) | 12 |
| Named vendors removed | 28+ references |
| False positives retained | UI terms (`toast`, `adisyon`, `logo` as brand mark) |

A final repository-wide scan of `docs/` and root READMEs confirms **no remaining named commercial vendor references** in project-owned documentation.

---

## Files updated

| File | Changes |
|------|---------|
| `docs/DEMO_UX_REPORT.md` | Audience line: vendor list → neutral evaluator / SaaS framing |
| `docs/PRODUCT_POLISH_REPORT.md` | Reference segment + footer: portfolio-oriented wording |
| `docs/MASTER-PROJECT-REPORT.md` | Purpose, billing, competitors, stakeholder section, RFP row, monitoring, payment notes |
| `docs/MENU-DATABASE-TASARIMI.md` | Payment pattern example: named gateways → industry-neutral phrasing |
| `docs/TEKNIK-DURUM.md` | Error tracking roadmap: `Sentry` → generic APM wording |
| `docs/YOL-HARITASI.md` | Payment, billing, messaging, delivery, accounting roadmap items |
| `docs/PROJE-RAPORU.md` | POS integration + error monitoring roadmap |
| `docs/MIMARI-TASARIM.md` | SaaS billing module description |
| `docs/TAM-RAPOR.md` | POS, monitoring, delivery, accounting integration lines |
| `docs/DOMAIN-ANALIZI.md` | Order channel + accounting export references |

## Files reviewed — no changes required

| File | Reason |
|------|--------|
| `README.md` | No vendor or company names; already framed as independent engineering work |
| `api/README.md` | Technical setup only; no vendor references |
| `docs/BACKEND-ISKELET.md` | Architecture skeleton; neutral |
| `docs/DEMO_AUDIT.md` | Runtime audit; `toast` = UI notification library term |
| `docs/DEMO_READY_REPORT.md` | Demo stabilization; neutral |
| `docs/RC1_RUNTIME_AUDIT.md` | QA audit; neutral |
| `docs/RC1_STABILIZATION_REPORT.md` | Fix log; neutral |
| `docs/IS-KURALLARI.md` | Domain rules; `adisyon` = receipt (Turkish), not a vendor |
| `docs/MIMARI-TASARIM.md` | *(billing line updated; remainder neutral)* |
| `docs/MENU-DOMAIN-TASARIMI.md` | Domain design; neutral |
| `docs/MENU-CREATE-CATEGORY-USE-CASE.md` | Use-case spec; neutral |
| `docs/MENU-PRISMA-M1-RAPOR.md` | Migration report; neutral |

---

## Company / vendor names removed

### Turkish ERP / retail / restaurant software (explicit user list)

| Removed | Replaced with |
|---------|----------------|
| AKINSOFT | *(removed from lists)* |
| Logo Yazılım | *(removed; disambiguated from UI “logo” in polish report)* |
| Nebim | *(removed)* |
| IdeaSoft | *(removed)* |
| Ticimax | *(removed)* |
| ikas | *(removed)* |
| Akinon | *(removed)* |
| Workcube | *(removed)* |

### Additional vendors found during review

| Category | Names removed | Neutral replacement |
|----------|---------------|---------------------|
| Restaurant POS / QR | Adisyo, Menulux, Restajet | Yerel restoran POS platformları; dijital menü çözümleri |
| Delivery platforms | Yemeksepeti, Getir | Yemek teslimat platformu entegrasyonları |
| Global POS / payments | Toast, Square | Global restoran POS ve ödeme platformları |
| Payment gateways | Stripe, Adyen, Square, iyzico, PayTR, Ingenico | Ödeme gateway; SaaS faturalandırma; kurumsal ödeme platformları |
| Accounting | Logo, Mikro | Muhasebe yazılımı entegrasyonu |
| Observability | Sentry, Grafana, Datadog | Merkezi hata izleme; APM / gözlemlenebilirlik |
| Messaging | Twilio, SendGrid | Üçüncü taraf mesajlaşma sağlayıcıları |

---

## Wording improvements

| Before (pattern) | After (pattern) |
|------------------|-----------------|
| `Hedef kitle: Logo, AKINSOFT, Nebim…` | Teknik mülakat panelleri, kurumsal yazılım değerlendiricileri, modern SaaS platform sunumları |
| `Referans segment: AKINSOFT, Logo Yazılım…` | Kurumsal ERP yazılımları, modern SaaS platformları, restoran yönetim platformları |
| `yazılım firması sunumları` | Bağımsız yazılım mühendisliği portföyü sunumları |
| `## Yazılım Firması` | `## Kurumsal Teknik Değerlendirici` |
| `Kurumsal yazılım firması RFP` | Kurumsal satın alma / RFP süreçleri |
| `Türkiye ödeme entegrasyonu` | Bölgesel ödeme ve mali mevzuat entegrasyonu |
| `Stripe / iyzico abonelik` | SaaS abonelik faturalandırma entegrasyonu |
| `Stripe, Adyen, Square aynı pattern` | Kurumsal ödeme platformlarında yaygın minor-units pattern |
| Named competitor table rows | Category-based market landscape table |

---

## Consistency improvements

1. **Audience framing** — Demo and polish reports now describe the same neutral audience: technical interview panels and portfolio reviewers, not a named vendor shortlist.

2. **Integration roadmap language** — `YOL-HARITASI.md`, `TAM-RAPOR.md`, `PROJE-RAPORU.md`, and `MIMARI-TASARIM.md` use the same generic phrases for payments, billing, delivery, accounting, and messaging.

3. **Stakeholder personas** — `MASTER-PROJECT-REPORT.md` uses role-based labels (CTO, Product Manager, Kurumsal Teknik Değerlendirici) instead of implying a specific employer context.

4. **Competitive analysis** — Named competitor rows replaced with **market categories** (local POS, QR solutions, delivery ecosystems, global reference architectures).

5. **Preserved intentional terms** — The following were **not** changed because they are not vendor references:
   - `react-hot-toast` (npm package name)
   - `toast` / `toast bildirimleri` (UI notification pattern)
   - `adisyon` (Turkish for bill/receipt)
   - `Logo` in UI/branding tables (product mark, not Logo Yazılım)
   - `e-Fatura`, `ÖKC`, `GİB` (regulatory / government concepts)
   - Open-source stack names in README badges (React, NestJS, PostgreSQL, Prisma)

---

## Verification

Post-review grep across `docs/` and project READMEs for known vendor tokens:

```
AKINSOFT, Logo Yazılım, Nebim, IdeaSoft, Ticimax, ikas, Akinon, Workcube,
Adisyo, Menulux, Restajet, Yemeksepeti, Getir, iyzico, PayTR, Ingenico,
Stripe, Adyen, Square, Toast, Sentry, Twilio, SendGrid, Grafana, Datadog
```

**Result:** No matches in project-owned documentation (`node_modules` excluded).

---

## Recommendation

When adding new documentation:

- Describe **categories** (enterprise SaaS, restaurant POS, payment gateway) instead of **vendor names**.
- Frame the project as a **software engineering portfolio** or **technical demonstration**, not a deliverable for a named company.
- Keep regulatory terms (e-Fatura, KVKK) where they describe compliance domains, not products.

---

*This review completes the vendor-neutrality pass for RC1 documentation.*
