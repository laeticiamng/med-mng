export const getOicItemParentCandidates = (itemCode: string): string[] => {
  const trimmedCode = itemCode.trim();
  if (!trimmedCode) return [];

  const upperCode = trimmedCode.toUpperCase();
  let numericPart = upperCode;

  if (upperCode.startsWith('IC-')) {
    numericPart = upperCode.replace('IC-', '');
  } else if (upperCode.startsWith('OIC-')) {
    numericPart = upperCode.replace('OIC-', '').split('-')[0];
  }

  const rawNumeric = numericPart.replace(/^0+/, '') || numericPart;
  const paddedNumeric = numericPart.padStart(3, '0');
  const candidates = new Set<string>([numericPart, rawNumeric, paddedNumeric]);

  if (upperCode.startsWith('IC-')) {
    candidates.add(`IC-${rawNumeric}`);
    candidates.add(`IC-${paddedNumeric}`);
    candidates.add(trimmedCode);
  }

  if (upperCode.startsWith('OIC-')) {
    candidates.add(`OIC-${paddedNumeric}`);
  }

  return Array.from(candidates).filter(Boolean);
};
