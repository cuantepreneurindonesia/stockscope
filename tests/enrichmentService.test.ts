import { enrichStocks, enrichStock } from '../src/lib/services/enrichmentService';

describe('Enrichment Service', () => {
  it('should successfully enrich standard stocks with AI scores and market data', () => {
    const mockStock = {
      id: 'mock-id',
      code: 'BBCA',
      issuer: 'Bank Central Asia Tbk',
      hierarchyLevel: 'High',
    };
    
    // @ts-ignore - Ignoring missing other fields from Stock type for testing purposes
    const result = enrichStock(mockStock);
    
    expect(result.scores).toBeDefined();
    expect(result.scores.composite).toBeGreaterThan(0);
    expect(result.price).toBe(9425); // Matching MARKET_DATA map
    expect(result.sector).toBe('Finance');
    expect(result.aiTier).toBeDefined();
  });

  it('should generate mock data for unknown stock codes', () => {
    const unknownStock = {
      id: 'unknown-id',
      code: 'UNKNOWN',
      issuer: 'Unknown Corp',
      hierarchyLevel: 'Moderate',
    };

    // @ts-ignore
    const result = enrichStock(unknownStock);

    expect(result.scores).toBeDefined();
    expect(result.price).toBeDefined();
    // Verify deterministic generation
    expect(result.sector).toBe('Infrastructure'); // based on Moderate hierarchy
  });

  it('should handle batch enrichment', () => {
    const list = [
      { code: 'BBCA', issuer: 'BCA', hierarchyLevel: 'High' },
      { code: 'BBRI', issuer: 'BRI', hierarchyLevel: 'High' }
    ];

    // @ts-ignore
    const mapped = enrichStocks(list);
    
    expect(mapped.length).toBe(2);
    expect(mapped[0].code).toBe('BBCA');
    expect(mapped[1].code).toBe('BBRI');
  });
});
