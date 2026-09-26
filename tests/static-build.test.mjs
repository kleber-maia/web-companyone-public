import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import { COPY } from "../app/i18n.ts";
function builtJavascript() {
  return readdirSync("dist/assets").filter(file => file.endsWith(".js")).map(file => readFileSync(join("dist/assets", file), "utf8")).join("\n");
}
test("GitHub Pages artifact preserves the production host and static distribution", () => {
  for (const path of ["index.html", "CNAME", ".nojekyll", "distribution/agent.txt", "favicon.svg", "social/companyone-social.png", "product/home.jpg", "product/calendar.jpg", "art/companyos-sculpture.jpg", "art/companyos-team.jpg", ...["computer", "work", "agents", "system"].map(part => `art/assembly-${part}.jpg`), "robots.txt"]) assert.ok(existsSync(`dist/${path}`), `missing ${path}`);
  assert.equal(readFileSync("dist/CNAME", "utf8").trim(), "operaos.ai");
  const html = readFileSync("dist/index.html", "utf8");
  assert.match(html, /CompanyONE \| Your company\. One system\./);
  assert.match(html, /information system on your own infrastructure/);
  assert.match(html, /hreflang="pt-BR"/);
  assert.match(html, /hreflang="es-419"/);
  assert.match(html, /property="og:image" content="https:\/\/operaos\.ai\/social\/companyone-social\.png"/);
  assert.match(html, /name="twitter:card" content="summary_large_image"/);
  assert.doesNotMatch(html, /\/api\//);
});
test("all three languages include the three-part product story", () => {
  const javascript = builtJavascript();
  for (const text of ["Your computer", "Your system", "Your team", "Seu computador", "Seu sistema", "Sua equipe", "Tu computadora", "Tu sistema", "Tu equipo", "Agent One", "Dev One", "Bring the work you’ve already done.", "Traga o trabalho que você já fez.", "Trae el trabajo que ya hiciste.", "Automatic backups", "Backups automáticos", "Respaldos automáticos"]) assert.ok(javascript.includes(text), `missing built copy: ${text}`);
});
test("FAQ provides fourteen localized native accordion items", () => {
  const page = readFileSync("app/page.tsx", "utf8");
  assert.match(page, /id="faq"/);
  assert.match(page, /\["#why", "#ownership", "#system", "#work", "#customization", "#story", "#faq"\]/);
  assert.match(page, /<details className="faq-item"/);
  assert.match(page, /<summary>/);
  assert.match(page, /setFaqOpen\(true\)/);
  assert.match(page, /setFaqOpen\(false\)/);
  const closingIndex = page.indexOf('<section className="closing inverse"');
  const faqIndex = page.indexOf('<section ref={faq}');
  const mainEndIndex = page.indexOf("</main>");
  assert.ok(closingIndex !== -1 && closingIndex < faqIndex && faqIndex < mainEndIndex, "FAQ should be the final section after the closing CTA");
  for (const locale of ["en", "pt-BR", "es-419"]) {
    const faq = COPY[locale].faq;
    assert.equal(COPY[locale].nav.at(-1), locale === "en" ? "FAQ" : locale === "pt-BR" ? "Perguntas" : "Preguntas", `${locale} FAQ link should be last in navigation`);
    assert.equal(faq.items.length, 14, `${locale} should have fourteen FAQ items`);
    assert.equal(new Set(faq.items.map(([question]) => question)).size, 14, `${locale} FAQ questions should be unique`);
    assert.ok(faq.expandAll && faq.collapseAll && faq.label, `${locale} should localize FAQ controls and label`);
    for (const [question, direct, detail] of faq.items) assert.ok(question && direct && detail, `${locale} FAQ entries should contain all three copy levels`);
    const brandMentions = (faq.items.flat().join(" ").match(/CompanyONE/g) || []).length;
    assert.equal(brandMentions, 2, `${locale} FAQ should establish CompanyONE in the first item without repeating it mechanically`);
  }
  const javascript = builtJavascript();
  for (const text of ["What features are included?", "Quais recursos estão incluídos?", "¿Qué funciones incluye?", "Expand all", "Abrir todas", "Cerrar todas", "No. Agent One and Dev One are your operations and engineering team."]) assert.ok(javascript.includes(text), `missing built FAQ copy: ${text}`);
});
test("public page uses the CompanyONE identity without obsolete sales paths", () => {
  const content = ["app/i18n.ts", "app/page.tsx", "index.html", "README.md"].map(file => readFileSync(file, "utf8")).join("\n");
  const javascript = builtJavascript();
  assert.doesNotMatch(`${content}\n${javascript}`, /OperateOS|OperaOS|OS Operator|OS Developer|Developer One/);
  for (const text of ["CompanyONE", "Agent One", "Dev One"]) assert.ok(javascript.includes(text), `missing canonical built identity: ${text}`);
  assert.doesNotMatch(javascript, /mailto:|Join the beta waitlist|Entrar na lista de espera|Unirme a la lista de espera/);
});
