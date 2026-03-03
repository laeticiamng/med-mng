import { forwardRef, useEffect, useState } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Button } from '@/components/ui/button';

export const StickyMobileCTA = forwardRef<HTMLDivElement>((_, ref) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.on('change', (y) => {
      setVisible(y > window.innerHeight * 0.7);
    });
  }, [scrollY]);

  return (
    <motion.div
      ref={ref}
      initial={{ y: 100 }}
      animate={{ y: visible ? 0 : 100 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
    >
      <div className="bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 safe-area-bottom">
        <Button
          size="lg"
          onClick={() => navigate(ROUTE_PATHS.medMngSignup)}
          className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary-hover shadow-lg shadow-primary/25"
        >
          <Sparkles className="h-4 w-4 mr-2" />
          Essayer gratuitement
        </Button>
      </div>
    </motion.div>
  );
});

StickyMobileCTA.displayName = 'StickyMobileCTA';
