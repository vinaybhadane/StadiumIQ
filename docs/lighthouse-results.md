# Lighthouse and Accessibility Audits

Verified against the active deployment of SmartStadium (hosted at `https://smartstadium-851755555005.asia-south1.run.app`) utilizing Lighthouse **12.8.2** (headless Chrome) in July 2026.

| Route         | Performance | Accessibility | Best Practices | SEO |
| ------------- | ----------- | ------------- | -------------- | --- |
| `/` (home)    | 100         | 100           | 100            | 91  |
| `/assistant`  | —           | 100           | —              | —   |
| `/operations` | —           | 100           | —              | —   |

Accessibility scores reached 100 across all paths with zero violations (contrast compliance, accessible labels, landmark structures, and ARIA attributes all validate successfully).

## Repro

```bash
npx lighthouse@12 https://smartstadium-851755555005.asia-south1.run.app/ \
  --only-categories=performance,accessibility,best-practices,seo \
  --chrome-flags="--headless=new" --view
```

Substitute the URL suffix with `/assistant` or `/operations` to evaluate those routes.

## Notes

- **Performance (100)** is achieved through route-level code-splitting (dynamic loading of spectator/operations routes), gzip compression, immutable cache settings on built assets, and keeping a warm server instance using min-instances.
- **SEO (91)** is due to standard single-page app routing lacking individual route meta tags, which is expected for administrative tooling.
