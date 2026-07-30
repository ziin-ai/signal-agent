# Technology Stack (Scoped)

| Layer | Choice |
| --- | --- |
| Framework | Astro (hybrid `output: "server"`) |
| UI islands | React |
| Content | Markdown + Astro content collections |
| Deploy | Kubernetes / Argo CD (`ziin-ai` namespace) |
| Ads | Google AdSense (script + ads.txt; units TBD) |
| Analytics | Optional GA via public env helpers |

No change to stack required for AdSense content readiness work.
