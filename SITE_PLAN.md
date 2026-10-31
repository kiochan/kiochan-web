# Personal website plan

## Purpose and pages

Introduce Kiochan, show real work, share useful engineering notes, and provide a working contact path.

- Home: introduction, selected projects, latest notes, and contact invitation.
- Projects: curated index and individual project pages.
- Lab: a growing collection of runnable tools at `/lab/<slug>`, with separate workspace ownership for each embedded experiment. See LAB.md.
- Notes: original articles about this repository's real theme and deployment decisions.
- About: concise introduction and working principles.
- Contact: GitHub profile and project issue links.
- Supporting routes: useful 404 page, sitemap, robots, and existing health endpoints.

## Content boundaries

Feature only verified public projects selected for the website. Do not publish private repository information, personal contact details, credentials, fictional employers, testimonials, or performance claims. Do not fabricate article publication dates or advertise retired demos.

Keep editorial data in apps/web/src/content/site.ts. A CMS, authentication, visitor tracking, newsletter, and contact-form backend are outside this release. Contact uses genuine GitHub destinations rather than a nonfunctional form.

## Design and implementation

Use a technical visual language with cool blue/cyan accents, a fine grid, an animated orbital illustration, readable typography, and restrained glow. Add route-entry motion, progressive scroll reveals, hover feedback, real navigation progress, and lazy experiment loading. Keep palette values in packages/theme. Preserve light/dark/system preferences, reduced-motion behavior, static SEO content, and small-screen usability.

Pages remain statically renderable without PostgreSQL or GitHub API requests. Add metadata, keyboard focus, a skip link, reduced-motion support, and real empty/error destinations. Verify navigation, detail pages, 404s, theme persistence, console errors, and narrow-screen layout. Run quality checks before an English commit. Do not push or deploy without authorization.
