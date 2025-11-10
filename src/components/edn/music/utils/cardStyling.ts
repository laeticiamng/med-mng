
export const getCardStyling = (rang: 'A' | 'B') => {
  const isRangA = rang === 'A';
  
  return {
    cardColor: isRangA ? 'warning' : 'primary',
    gradientFrom: isRangA ? 'from-warning/10' : 'from-primary/10',
    gradientTo: isRangA ? 'to-warning/5' : 'to-primary/5',
    borderColor: isRangA ? 'border-warning/30' : 'border-primary/30',
    textColor: isRangA ? 'text-warning-foreground' : 'text-primary-foreground',
    iconColor: isRangA ? 'text-warning' : 'text-primary',
    buttonVariant: (isRangA ? 'default' : 'secondary') as 'default' | 'secondary'
  };
};
