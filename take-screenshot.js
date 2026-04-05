import { chromium } from '@playwright/test';

(async () => {
  console.log("Iniciando Playwright...");
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();
  console.log("Navegando para http://127.0.0.1:8080...");
  await page.goto('http://127.0.0.1:8080', { waitUntil: 'networkidle' });
  console.log("Esperando os dados do Google Sheets carregarem...");
  await page.waitForTimeout(4000);
  console.log("Tirando o print (Aba de Materiais)...");
  await page.screenshot({ path: 'public/screenshot-materiais.png', fullPage: false });

  // Tentar clicar na aba de Tecidos
  console.log("Trocando para a aba de Tecidos...");
  try {
    await page.click('text=Tecidos');
    await page.waitForTimeout(2000);
    console.log("Tirando o print (Aba de Tecidos)...");
    await page.screenshot({ path: 'public/screenshot-tecidos.png', fullPage: false });
  } catch (e) {
    console.log("Não foi possível clicar na aba de Tecidos.", e);
  }

  await browser.close();
  console.log("Prints salvos na pasta public!");
})();
