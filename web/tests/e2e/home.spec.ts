import { test, expect } from '@playwright/test';

test('ana sayfa başlığı ve plan rozetini gösterir', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Medknowledge')).toBeVisible();
  // plan rozeti yazısı (Free/Premium/Pro) — seed ile Free beklenir
  await expect(page.getByText(/Free|Premium|Pro/)).toBeVisible();
});
