import { Product } from '../types';
import { MOCK_PRODUCTS } from '../data/mockData';

export interface RecommendationProvider {
  getForYou(userId?: string, limit?: number): Promise<Product[]>;
  getTrending(limit?: number): Promise<Product[]>;
  getBecauseYouViewed(productId: string, limit?: number): Promise<Product[]>;
  getFrequentlyBoughtTogether(productId: string, limit?: number): Promise<Product[]>;
  getSimilarProducts(productId: string, limit?: number): Promise<Product[]>;
  getRecentlyViewed(viewedIds: string[]): Promise<Product[]>;
}

class RuleBasedRecommendationEngine implements RecommendationProvider {
  private products: Product[] = MOCK_PRODUCTS;

  async getForYou(userId?: string, limit = 4): Promise<Product[]> {
    // Rule-based heuristic: High rated + featured products
    return [...this.products]
      .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
      .slice(0, limit);
  }

  async getTrending(limit = 4): Promise<Product[]> {
    return this.products
      .filter((p) => p.trending || p.bestSeller)
      .slice(0, limit);
  }

  async getBecauseYouViewed(productId: string, limit = 4): Promise<Product[]> {
    const current = this.products.find((p) => p.id === productId);
    if (!current) return this.products.slice(0, limit);
    return this.products
      .filter((p) => p.id !== productId && (p.category === current.category || p.brand === current.brand))
      .slice(0, limit);
  }

  async getFrequentlyBoughtTogether(productId: string, limit = 3): Promise<Product[]> {
    // E.g., workspace desk shelf + lightbar or keyboard
    const current = this.products.find((p) => p.id === productId);
    if (!current) return this.products.slice(0, limit);

    return this.products
      .filter((p) => p.id !== productId)
      .sort((a, b) => (b.category === current.category ? 1 : -1))
      .slice(0, limit);
  }

  async getSimilarProducts(productId: string, limit = 4): Promise<Product[]> {
    const current = this.products.find((p) => p.id === productId);
    if (!current) return this.products.slice(0, limit);

    return this.products
      .filter((p) => p.id !== productId && (p.category === current.category || p.tags.some((t) => current.tags.includes(t))))
      .slice(0, limit);
  }

  async getRecentlyViewed(viewedIds: string[]): Promise<Product[]> {
    if (!viewedIds.length) return [];
    return viewedIds
      .map((id) => this.products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  }
}

// Export singleton instance conforming to the recommendation provider interface
export const recommendationEngine: RecommendationProvider = new RuleBasedRecommendationEngine();
