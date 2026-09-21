# Repository instructions

## Git and production deployment

- Work directly on `master`. Do not create feature branches, do not switch to feature branches, and do not open pull requests.
- Before changing the site, run `git switch master` and `git pull --ff-only origin master`.
- After requested changes, run `npm test`, commit the verified files, and push with `git push origin master`.
- The target canonical production URL is `https://companyone.ai`. During the DNS
  transition, `https://operaos.ai` remains the active public address; do not change
  the Pages custom domain until the CompanyONE DNS records are present and verified.
- GitHub Pages publishes from `master` through `.github/workflows/pages.yml`. A push anywhere else does not update the public website.
- After pushing, monitor the `Deploy GitHub Pages` workflow until it succeeds, then verify the canonical production URL contains the expected new content. Do not report that the site is updated merely because Git accepted the push.
- The production website is static. It does not need a persistent application or development server.
- Do not create a separate hosted preview or use Sites hosting unless the user explicitly requests one.

## Production hostnames and tunnels

- `companyone.ai` is served by GitHub Pages. It should use the four GitHub Pages
  apex `A` records in Cloudflare DNS with proxying disabled; it is not a Cloudflare
  Tunnel route. Until that cutover, `operaos.ai` remains the compatibility hostname.
- `app.companyone.ai` is the target proxied Cloudflare Tunnel route to
  `http://127.0.0.1:3000`; the legacy `app.operaos.ai` route stays active until the
  new hostname has been verified.
- `dev.companyone.ai` is the target proxied Cloudflare Tunnel route to
  `http://127.0.0.1:3100`; the legacy `dev.operaos.ai` route stays active until the
  new hostname has been verified.
- Converge tunnel configs and user LaunchAgents to CompanyONE names during the DNS
  cutover. Keep the legacy configs and labels only as rollback compatibility until
  the new routes have passed public HTTPS checks.
- Before changing tunnel routes, verify both local ports, both active tunnel connectors, the Cloudflare DNS records, and the public HTTPS responses.

## Development previews

- Start `npm run dev` only when a development preview is useful or requested.
- When sharing a development preview, never provide a `localhost` URL. Use the LAN `Network` URL printed by Vite.
- Keep the preview process running while the user is reviewing it. Do not stop it until the review is finished or the user asks for production publication instead.
- If the user is not on the same network, publish through `master`; do not substitute an unrelated preview host.

## CompanyONE copy model

- `CompanyONE` is the solution: a self-hosted operating system for a company.
- `Agent One` is the private AI agent embedded inside CompanyONE.
- Alternate naturally between `Agent One` and `the agent` after the relationship has been established. Never use a bare `AI` label to identify Agent One.
- Describe the connected business layer as an information system, not merely as software.
- Modules are examples and starting points, not the definition or fixed boundary of CompanyONE. The company can create and extend its own modules, workflows, and capabilities as its needs evolve.
- Keep marketing copy aligned across English, Brazilian Portuguese, and Latin American Spanish in `app/i18n.ts`, and keep the default metadata in `index.html` aligned with the English copy.
