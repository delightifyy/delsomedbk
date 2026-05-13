## Goal
Turn the existing MediCare admin (`/doctor-portal/admin`) into a complete Landing Page CMS that controls every section of the existing MediCare landing page (`/doctor-portal`). No redesign of the public page — only wire its content to admin-managed settings.

## Approach
Keep using the existing `medicareSettings` localStorage store (already powering branding/hero/about/faqs/testimonials/partners). Extend its schema to cover every section listed, then:
1. Expand `src/lib/medicareSettings.ts` with new typed sections + sensible defaults that mirror the *current* hard-coded landing page content (so nothing visually changes on first load).
2. Refactor `src/pages/MediCare.tsx` to read every section from `useMediCareSettings()` instead of hard-coded JSX. Preserve current layout, classes, animations.
3. Rebuild `src/pages/MediCareAdmin.tsx` as a tabbed CMS with one tab per section + Media Library + SEO. Reuse the existing sidebar shell.

## Sections / data model added
- `nav`: logo, brand, items[{id,label,href,enabled,order}], cta{label,href,enabled}
- `hero`: extends current — badge, headline, description, ctaLabel, ctaHref, bgImage, overlayOpacity, doctorCard{name,role,avatar}, checklistCard{title,items[]}, vitalsCard{label,value,trend}
- `partners`: already exists; add reorder + logo upload
- `about`: extends current — label, title, description, mission{title,body}, vision{title,body}, image, ctaLabel, ctaHref, satisfactionCard{value,label}
- `whyChoose`: label, title, description, image, features[{id,icon,title,description,order,active}]
- `services`: label, title, items[{id,image,icon,title,description,ctaLabel,ctaHref,order,active}]
- `virtualCare`: badge, title, description, checklist[], ctaLabel, ctaHref, mockupImage, dashboardCard{title,stat,sub}, bgImage
- `testimonials`: extends — label, title, items add age/location, image, rating, order
- `ctaBanner`: bgImage, badge, title, description, primaryCta{label,href}, secondaryCta{label,href}, overlayOpacity
- `footer`: logo, description, socials[{platform,href}], specialistLinks[], quickLinks[], supportLinks[], copyright, availabilityText, bgColor
- `media`: items[{id,name,type:'image'|'video',dataUrl,uploadedAt}]
- `seo`: pageTitle, metaDescription, keywords, ogImage, favicon

All images/videos stored as base64 dataURLs in localStorage (consistent with current logo upload). Media Library is a shared picker reused by every section's image/video field.

## Admin UI structure
Sidebar tabs (replacing current 8 with the full set):
Navbar · Hero · Partners · About · Why Choose Us · Services · Virtual Care · Testimonials · CTA Banner · Footer · Media Library · SEO

Per-section pattern:
- Form fields styled with existing `Field` / `inputCls` helpers
- List sections (services, features, testimonials, partners, nav items, social/footer links) get: add row, inline edit, delete with confirm modal, ↑/↓ reorder, enable/disable toggle
- Image/video fields use a `<MediaPicker>` (upload new or pick from library)
- Sticky save bar with Save / Reset / "View landing page" link
- Toast on save/error (sonner already in project)
- "Preview" button opens `/doctor-portal` in new tab (unsaved changes warning)

## Public page wiring (`MediCare.tsx`)
- Replace hard-coded strings/images with `s.nav.*`, `s.hero.*`, `s.whyChoose.features.filter(active).sort(order)`, etc.
- Inject `s.seo.pageTitle` / meta description via `document.title` + meta tags effect (already pattern in file)
- Footer reads from `s.footer`; nav from `s.nav` filtered by enabled+order
- Defaults are seeded to current copy so the page renders identically out of the box

## Out of scope (kept simple)
- No DB migration — stays in localStorage (matches existing architecture). If user later wants multi-device sync, we can move to Supabase.
- No drag-and-drop reorder — use up/down arrows (simpler, mobile-friendly)
- No publish workflow — saves are live immediately (current behavior)

## Files
**Edit**
- `src/lib/medicareSettings.ts` — extend schema + defaults
- `src/pages/MediCare.tsx` — wire every section to settings
- `src/pages/MediCareAdmin.tsx` — replace tabs with full CMS

**Create**
- `src/components/medicare-admin/MediaPicker.tsx` — upload/select image or video
- `src/components/medicare-admin/ConfirmDialog.tsx` — delete confirmation
- `src/components/medicare-admin/SectionEditors/` — one file per section editor (Navbar, Hero, About, WhyChoose, Services, VirtualCare, Testimonials, CtaBanner, Footer, Partners, Media, Seo) to keep `MediCareAdmin.tsx` lean

## Notes
- This is a large change (~12 new files, 3 large rewrites). Public landing page output stays visually identical until admin changes content.
- localStorage has a ~5MB cap; uploaded videos should be small. I'll add a size warning in MediaPicker (>2MB).
