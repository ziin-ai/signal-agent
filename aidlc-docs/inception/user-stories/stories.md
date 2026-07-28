# User Stories — AdSense Readiness

## Personas

| Persona | Goal |
| --- | --- |
| P1 Googlebot / AdSense reviewer | Read substantive HTML articles + policies without login |
| P2 Korean retail reader | Learn frameworks (guides) and daily calls without template fatigue |
| P3 Publisher operator | Clear About/Contact identity; crawlable legal pages |

## Stories

### US-01 Evergreen depth
As a reviewer (P1), I can open educational guides with enough original explanation that the site does not look like a thin AI news feed.  
**AC:** Existing 3 guides expanded; 5 new guides published (`draft: false`, tag includes `교육`).

### US-02 Publisher identity
As a reviewer (P1), I can tell who operates the site from About.  
**AC:** About states personal/team operation, contact path, business registry “추후”; no fake registration numbers.

### US-03 Landing first impression
As a reviewer landing on `/`, I see publisher purpose and links to articles/guides before scrolling the interactive timeline.  
**AC:** Short intro block with links to about, posts, and at least 3 guides.

### US-04 Crawl hardening
As Googlebot, I receive build-time HTML for legal and posts index.  
**AC:** `prerender = true` on listed pages.

### US-05 Daily voice sample
As a reader (P2), recent outlook samples lead with a ranked call and falsifier, not equal-weight N variables.  
**AC:** Five outlook files rewritten; 2026-07-24 already compliant remains.

## Personas file
See also `personas.md` (same content condensed).
