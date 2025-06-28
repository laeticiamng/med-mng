
export const getCardStyling = (rang: 'A' | 'B') => {
  const isRangA = rang === 'A';
  
  return {
    cardColor: isRangA ? 'amber' : 'blue',
    gradientFrom: isRangA ? 'from-amber-50' : 'from-blue-50',
    gradientTo: isRangA ? 'to-orange-50' : 'to-indigo-50',
    borderColor: isRangA ? 'border-amber-300' : 'border-blue-300',
    textColor: isRangA ? 'text-amber-900' : 'text-blue-900',
    iconColor: isRangA ? 'text-amber-600' : 'text-blue-600',
    buttonColor: isRangA ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
  };
};
