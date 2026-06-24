import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { JOURNEY_STEPS } from '@/constants/homepageData';

export function HeroJourneyBar() {
  return (
    <div className="mba-journey-bar">
      <div className="mba-container">
        <motion.div
          className="mba-journey-bar__track"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.12 } },
          }}
        >
          {JOURNEY_STEPS.map((step, i) => (
            <motion.div
              key={step}
              className="mba-journey-bar__step"
              variants={{
                hidden: { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
              }}
            >
              <span className="mba-journey-bar__num">{i + 1}</span>
              <span className="mba-journey-bar__label">{step}</span>
              {i < JOURNEY_STEPS.length - 1 && (
                <ChevronDown className="mba-journey-bar__arrow hidden sm:block" aria-hidden />
              )}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
