/**
 * Accessibility Testing Suite
 *
 * This file contains automated accessibility tests using Playwright and axe-core.
 * Tests verify WCAG 2.1 AA compliance across key application pages and components.
 *
 * Setup:
 * 1. Install dependencies:
 *    npm install --save-dev @playwright/test axe-playwright @axe-core/playwright
 *
 * 2. Run tests:
 *    npx playwright test tests/accessibility.test.ts
 *
 * 3. View report:
 *    npx playwright show-report
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Base URL for the application
const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || "http://localhost:3000";

test.describe("Accessibility Tests", () => {
	test.describe("Homepage and Authentication", () => {
		test("homepage should not have accessibility violations", async ({ page }) => {
			await page.goto(BASE_URL);

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		});

		test("login page should be accessible", async ({ page }) => {
			await page.goto(`${BASE_URL}/auth/login`);

			const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		});
	});

	test.describe("Drive Interface", () => {
		// Note: These tests assume user is logged in
		// You may need to add authentication setup in beforeEach

		test("file list should be accessible", async ({ page }) => {
			await page.goto(`${BASE_URL}/`);

			// Wait for file list to load
			await page.waitForSelector("table", { timeout: 5000 });

			const accessibilityScanResults = await new AxeBuilder({ page })
				.include("table") // Focus on the file list table
				.analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		});

		test("file list table headers should be accessible", async ({ page }) => {
			await page.goto(`${BASE_URL}/`);
			await page.waitForSelector("table", { timeout: 5000 });

			// Check that table has caption
			const caption = await page.locator("table caption.sr-only");
			await expect(caption).toHaveCount(1);

			// Check that headers have scope="col"
			const headers = await page.locator("th[scope='col']");
			await expect(headers).toHaveCount(4); // Name, Size, Created At, Actions
		});

		test("sort buttons should be keyboard accessible", async ({ page }) => {
			await page.goto(`${BASE_URL}/`);
			await page.waitForSelector("table", { timeout: 5000 });

			// Find sort button and test keyboard interaction
			const sortButton = page.locator("button", { hasText: "Name" }).first();
			await sortButton.focus();

			// Verify button is focusable
			await expect(sortButton).toBeFocused();

			// Test keyboard activation (Enter key)
			await sortButton.press("Enter");

			// Verify aria-sort attribute changed
			const header = page.locator("th[aria-sort]").first();
			await expect(header).toHaveAttribute("aria-sort", /ascending|descending/);
		});
	});

	test.describe("Navigation", () => {
		test("sidebar navigation should be accessible", async ({ page }) => {
			await page.goto(BASE_URL);

			const accessibilityScanResults = await new AxeBuilder({ page })
				.include("aside") // Sidebar element
				.analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		});

		test("skip-to-content link should be present and functional", async ({ page }) => {
			await page.goto(BASE_URL);

			// Find skip link
			const skipLink = page.locator('a[href="#main-content"]');
			await expect(skipLink).toHaveCount(1);

			// Focus skip link (it's visually hidden until focused)
			await skipLink.focus();

			// Verify it becomes visible on focus
			await expect(skipLink).toBeVisible();

			// Click skip link
			await skipLink.click();

			// Verify main content is focused
			const mainContent = page.locator("#main-content");
			await expect(mainContent).toBeFocused();
		});

		test("current page should be indicated with aria-current", async ({ page }) => {
			await page.goto(BASE_URL);

			// Find active navigation link
			const activeLink = page.locator('a[aria-current="page"]');
			await expect(activeLink).toHaveCount(1);
		});
	});

	test.describe("Forms and Dialogs", () => {
		test("form fields should have proper labels", async ({ page }) => {
			await page.goto(`${BASE_URL}/contacts`);

			// Find form inputs
			const inputs = page.locator("input");
			const inputCount = await inputs.count();

			// Verify each input has an associated label or aria-label
			for (let i = 0; i < inputCount; i++) {
				const input = inputs.nth(i);
				const id = await input.getAttribute("id");
				const ariaLabel = await input.getAttribute("aria-label");

				if (id) {
					// Check for associated label
					const label = page.locator(`label[for="${id}"]`);
					const hasLabel = (await label.count()) > 0;
					const hasAriaLabel = !!ariaLabel;

					expect(hasLabel || hasAriaLabel).toBeTruthy();
				}
			}
		});

		test("icon-only buttons should have aria-labels", async ({ page }) => {
			await page.goto(BASE_URL);
			await page.waitForSelector("table", { timeout: 5000 });

			// Find all buttons with icons (using common icon button selector)
			const iconButtons = page.locator("button[aria-label]");
			const buttonCount = await iconButtons.count();

			// Verify icon buttons have aria-labels
			expect(buttonCount).toBeGreaterThan(0);

			// Verify each has a meaningful label
			for (let i = 0; i < buttonCount; i++) {
				const ariaLabel = await iconButtons.nth(i).getAttribute("aria-label");
				expect(ariaLabel).toBeTruthy();
				expect(ariaLabel!.length).toBeGreaterThan(0);
			}
		});
	});

	test.describe("Dynamic Content", () => {
		test("live regions should be present for announcements", async ({ page }) => {
			await page.goto(BASE_URL);

			// Check for live region elements
			const liveRegions = page.locator('[aria-live="polite"], [aria-live="assertive"], [role="status"]');
			const count = await liveRegions.count();

			// We expect at least one live region for loading states
			expect(count).toBeGreaterThan(0);
		});
	});

	test.describe("Media Content", () => {
		test("video elements should have captions track", async ({ page }) => {
			// This test assumes you have a video file to preview
			// You may need to adjust based on your test data

			const videoElements = page.locator("video");
			const videoCount = await videoElements.count();

			if (videoCount > 0) {
				for (let i = 0; i < videoCount; i++) {
					const video = videoElements.nth(i);

					// Check for track element
					const track = video.locator("track[kind='captions']");
					await expect(track).toHaveCount(1);

					// Check for aria-label
					const ariaLabel = await video.getAttribute("aria-label");
					expect(ariaLabel).toBeTruthy();
				}
			}
		});
	});

	test.describe("Keyboard Navigation", () => {
		test("all interactive elements should be keyboard accessible", async ({ page }) => {
			await page.goto(BASE_URL);

			// Get all focusable elements
			const focusableElements = page.locator(
				'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);
			const count = await focusableElements.count();

			expect(count).toBeGreaterThan(0);

			// Tab through first few elements to verify focus order
			await page.keyboard.press("Tab");
			await page.keyboard.press("Tab");
			await page.keyboard.press("Tab");

			// Verify something is focused
			const focusedElement = page.locator(":focus");
			await expect(focusedElement).toHaveCount(1);
		});
	});
});

test.describe("Accessibility Standards Compliance", () => {
	test("should pass WCAG 2.1 AA standards on main pages", async ({ page }) => {
		const pages = [BASE_URL, `${BASE_URL}/contacts`, `${BASE_URL}/knowledge-bases`, `${BASE_URL}/settings`];

		for (const url of pages) {
			await page.goto(url);

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
				.analyze();

			expect(accessibilityScanResults.violations).toEqual([]);
		}
	});
});
