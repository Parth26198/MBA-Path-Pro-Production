import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardList,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HERO_JOURNEY_STEPS } from '@/constants/homepageData';

const STEP_ICONS = [UserPlus, Building2, BarChart3, Sparkles, ClipboardList, CheckCircle2];

export function HeroJourneyCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24, scale: 0.98 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mba-journey-card"
    >
      <div className="mba-journey-card__glow" aria-hidden />

      <div className="mba-journey-card__header">
        <Sparkles className="h-4 w-4 text-indigo-300" />
        <h3>MBA Journey Starts Here</h3>
      </div>

      <div className="mba-journey-card__roadmap">
        <motion.div
          className="mba-journey-card__line"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: 'easeOut' }}
          style={{ transformOrigin: 'top' }}
          aria-hidden
        />
        <ul className="mba-journey-card__steps">
          {HERO_JOURNEY_STEPS.map((step, i) => {
            const Icon = STEP_ICONS[i] || CheckCircle2;
            return (
              <motion.li
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.45 + i * 0.1, duration: 0.4 }}
                className="mba-journey-card__step"
              >
                <motion.span
                  className="mba-journey-card__dot"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1, type: 'spring', stiffness: 260 }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </motion.span>
                <span className="mba-journey-card__label">{step}</span>
              </motion.li>
            );
          })}
        </ul>
      </div>

      <Button className="mba-journey-card__cta" size="lg" asChild>
        <Link to="/register">Start My MBA Journey</Link>
      </Button>
    </motion.div>
  );
}
