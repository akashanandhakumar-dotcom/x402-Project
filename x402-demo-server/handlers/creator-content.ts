/**
 * 📦 Creator Content Handler
 *
 * Example handler for exclusive creator content and premium resources.
 * Demonstrates how to implement a payment-protected content endpoint.
 */

import type { Context } from 'hono';

// Mock content database (in production, use a real database)
const contentDatabase: Record<string, any> = {
  '1': {
    id: '1',
    title: 'Advanced Pitch Deck Templates',
    description: 'Premium pitch deck templates used by YC-backed startups',
    type: 'template',
    creator: 'GlassPitch Team',
    price: '$0.05',
    content: {
      templates: ['Series A Deck', 'Seed Round Deck', 'Demo Day Deck'],
      downloadUrl: 'https://example.com/templates/premium.zip',
    },
  },
  '2': {
    id: '2',
    title: 'Investor Outreach Playbook',
    description: 'Step-by-step guide to reaching investors effectively',
    type: 'guide',
    creator: 'GlassPitch Team',
    price: '$0.05',
    content: {
      chapters: ['Finding Investors', 'Crafting the Perfect Email', 'Following Up'],
      downloadUrl: 'https://example.com/guides/outreach.pdf',
    },
  },
  '3': {
    id: '3',
    title: 'Financial Model Spreadsheet',
    description: 'Detailed financial modeling template for startups',
    type: 'spreadsheet',
    creator: 'GlassPitch Team',
    price: '$0.05',
    content: {
      sheets: ['Revenue Projections', 'Cost Analysis', 'Cash Flow'],
      downloadUrl: 'https://example.com/models/financial.xlsx',
    },
  },
};

export function handleCreatorContentRequest(c: Context) {
  try {
    console.log('✓ PAYMENT VERIFIED - GET /creator-content/:id handler executing');

    // Get content ID from params
    const contentId = c.req.param('id') as string;

    // Look up content
    const content = contentDatabase[contentId];

    if (!content) {
      return c.json({
        success: false,
        error: 'Content not found',
        availableContent: Object.keys(contentDatabase),
      }, 404);
    }

    return c.json({
      success: true,
      data: content,
      timestamp: new Date().toISOString(),
      source: 'GlassPitch AI Creator Content API',
      cost: '$0.05 USDC',
    });
  } catch (error) {
    console.error('Creator content handler error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch creator content',
    }, 500);
  }
}
