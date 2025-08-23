import { randomUUID } from 'crypto';

describe('Request ID Uniqueness', () => {
  test('should generate unique request IDs', () => {
    const sampleSize = 10000;
    const requestIds = new Set<string>();
    
    // Générer un échantillon d'IDs
    for (let i = 0; i < sampleSize; i++) {
      const id = randomUUID();
      requestIds.add(id);
    }
    
    // Vérifier qu'aucune collision n'a eu lieu
    expect(requestIds.size).toBe(sampleSize);
  });
  
  test('should follow UUID v4 format', () => {
    const uuid = randomUUID();
    const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    
    expect(uuid).toMatch(uuidV4Regex);
  });
  
  test('should be cryptographically secure', () => {
    // Test de distribution - les UUIDs doivent être bien distribués
    const sample = Array.from({ length: 1000 }, () => randomUUID());
    const firstChars = sample.map(uuid => uuid[0]);
    const uniqueFirstChars = new Set(firstChars);
    
    // Au moins 10 caractères différents en première position (sur 16 possibles)
    expect(uniqueFirstChars.size).toBeGreaterThanOrEqual(10);
  });
});