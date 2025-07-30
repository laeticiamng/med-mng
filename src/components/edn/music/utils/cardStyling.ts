
export const getCardStyling = (rang: 'A' | 'B' | 'AB') => {
  const isRangA = rang === 'A';
  const isRangAB = rang === 'AB';
  
  return {
    cardColor: isRangAB ? 'purple' : isRangA ? 'amber' : 'blue',
    gradientFrom: isRangAB ? 'from-purple-50' : isRangA ? 'from-amber-50' : 'from-blue-50',
    gradientTo: isRangAB ? 'to-pink-50' : isRangA ? 'to-orange-50' : 'to-indigo-50',
    borderColor: isRangAB ? 'border-purple-300' : isRangA ? 'border-amber-300' : 'border-blue-300',
    textColor: isRangAB ? 'text-purple-900' : isRangA ? 'text-amber-900' : 'text-blue-900',
    iconColor: isRangAB ? 'text-purple-600' : isRangA ? 'text-amber-600' : 'text-blue-600',
    buttonColor: isRangAB ? 'bg-purple-600 hover:bg-purple-700' : isRangA ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
  };
};
