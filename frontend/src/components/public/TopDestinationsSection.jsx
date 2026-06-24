import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { TOP_MBA_DESTINATIONS } from '@/constants/homepageData';

export function TopDestinationsSection() {
  return (
    <section id="destinations" className="mba-destinations">
      <div className="mba-container">
        <div className="text-center">
          <p className="mba-eyebrow">Where ambition meets opportunity</p>
          <h2 className="mba-heading mt-2 text-2xl md:text-3xl">Top MBA Destinations</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600 md:text-base">
            Explore world-class business education across the most sought-after MBA markets.
          </p>
        </div>

        <div className="mba-destinations__grid mt-8">
          {TOP_MBA_DESTINATIONS.map((dest, i) => (
            <motion.div
              key={dest.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
            >
              <Link to="/register" className="mba-destination-card group">
                <div className="mba-destination-card__visual">
                  <img src={dest.image} alt="" loading="lazy" />
                  <div className="mba-destination-card__overlay" />
                  <span className="mba-destination-card__flag" aria-hidden>
                    {dest.flag}
                  </span>
                </div>
                <div className="mba-destination-card__body">
                  <h3>{dest.label}</h3>
                  <p>{dest.tagline}</p>
                  <span className="mba-destination-card__stat">{dest.schools}</span>
                  <span className="mba-destination-card__link">
                    Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
