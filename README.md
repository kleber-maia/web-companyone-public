# CompanyONE website

The public website for CompanyONE: a private, adaptable ERP and CRM for small businesses with Agent One for business work and Dev One for extending the system. It is a pure client-side React site compiled by Vite into static HTML, CSS, and JavaScript for GitHub Pages.

## Repository workflow

Work directly on `master`. This repository does not use feature branches or pull requests for website changes.

Before editing:

```bash
git switch master
git pull --ff-only origin master
```

After editing:

```bash
npm test
git add <changed-files>
git commit -m "Describe the change"
git push origin master
```

Pushing another branch does not update the public site.

## Local development

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Vite prints local and network addresses. Share the LAN `Network` address for review, never the `localhost` address. The development server must remain running while that preview is in use.

## Production build

```bash
npm test
```

The deployable site is written to `dist/`. The build also copies the `CNAME` and `distribution/` release files and creates `.nojekyll` for GitHub Pages. Production is fully static and does not require a persistent server.

## Production deployment

The canonical website is [https://operaos.ai](https://operaos.ai).

The workflow in `.github/workflows/pages.yml` builds and publishes `dist/` after every push to `master`. Repository Pages settings must use **GitHub Actions** as the source.

After pushing, wait for the **Deploy GitHub Pages** workflow to succeed and verify the canonical URL serves the new content. A successful Git push alone does not mean the public page has finished deploying.

## Production hostnames

- `https://operaos.ai` is the static GitHub Pages website. Cloudflare DNS points the apex directly to the four GitHub Pages IPv4 addresses with proxying disabled.
- `https://app.operaos.ai` is routed through the `operaos-app` Cloudflare Tunnel to the local service on port `3000`.
- `https://dev.operaos.ai` is routed through the `operaos-dev` Cloudflare Tunnel to the local service on port `3100`.

The two tunnels run as persistent macOS user services. Their configurations are `~/.cloudflared/operaos-app.yml` and `~/.cloudflared/operaos-dev.yml`; their LaunchAgent labels are `ai.operaos.cloudflared.app` and `ai.operaos.cloudflared.dev`.

## Copy conventions

- CompanyONE is a company-owned information system for small-business owners.
- The three parts are company-controlled infrastructure, a customizable information system, and AI agents on the team.
- Agent One handles business tasks. Dev One helps customize, extend, and maintain the system.
- CompanyONE runs on company hardware, on premises or with a company-selected cloud provider. Backups are automatic. This is a hosting claim, not a claim that all model processing happens locally.
- Existing data can be imported. ERP and CRM modules are starting points, not fixed product boundaries.
- This page is an informational pamphlet. It intentionally has no sales, contact, or waitlist calls to action.
- Keep English, Brazilian Portuguese, Latin American Spanish, and default metadata aligned.

## Design and product assets

Approved visual direction C: bold editorial typography, ivory, blue-violet, and deliberately inverted dark sections. Locally bundled Anton and Geist fonts. Screenshots are small evidence of the real product, not a feature demo.

The hero assembles four independently masked artwork layers bottom-up: computer, team (work and agent layers), then the upper system modules. The 20-second sequence holds the completed stack before repeating; the hero index selects computer-only, team layers, or the complete system, and Play returns to automatic assembly. The original still is retained for reduced motion and failed layer loads. It is an animated raster composition, not an interactive WebGL model. Motion pauses offscreen, on hidden tabs, with the pause control, or under reduced-motion preferences.

Assets in `public/art/` were produced using the built-in image generation tool. Prompts: a matte charcoal computer with interlocking ivory business modules and blue-violet Agent One / Dev One components; a dark close-up of the two blue-violet agent components installed in a shared system. The approved direction uses color #7052F5 on ivory #F4F2EB and charcoal #17151E.

`public/product/` contains the supplied early product screenshots. Only home and calendar are shown as secondary proof. Captions identify the evolving interface. No fictional customer endorsements or performance statistics are used.

Assembly assets: `public/art/assembly-{computer,work,agents,system}.jpg`. Generated with the built-in image tool from the original sculpture, then encoded for delivery. Prompt: isolate only the named component, retaining canvas, perspective, materials, lettering, and position; remove all other objects. The generated background is excluded with SVG outline masks in the component.
