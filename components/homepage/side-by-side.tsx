"use client"
import { Computer, Network, Sparkles } from 'lucide-react'
import { FaBusinessTime } from 'react-icons/fa'
import { OrbitingCirclesComponent } from './orbiting-circles'
import { motion } from "motion/react"
import {HeroCarousel } from './HeroCarousel'

const features = [
  {
    name: 'Preserving Family History and Traditions',
    description:
      'Our gatherings are a chance to share stories, learn about family heritage, and pass down traditions, ensuring that younger generations remain connected to their roots',
    icon: Computer,
  },
  {
    name: 'Strengthening Family Bonds',
    description: 'Wiley Swift Reunions provide opportunities for family members to reconnect, spend quality time together, and strengthen existing relationships',
    icon: FaBusinessTime,
  },
  {
    name: 'Creating Lasting Memories',
    description: 'Wiley Swift Family Reunions offer unique opportunities to create new memories and celebrate shared experiences, fostering a sense of belonging and connection',
    icon: Network,
  },
]

export default function SideBySide() {
  return (
    <section className="py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-16 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:pr-8 lg:pt-4"
          >
            <div className="lg:max-w-lg">
              {/* Pill badge */}
              <div className="mb-6 w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1">
                <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
                  <Sparkles className="h-4 w-4" />
                  <span>Join the Celebration</span>
                </div>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-300 dark:to-white pb-2">
              Remember the Magic Moment of 2023?
              </h2>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300">
              It was wonderful to reconnect and simply be family! Now, get ready for more magic in 2025! Our theme says it all: Family, Food, and Love – just what the Wiley-Swift clan does best! We in the DMV are excited to host and are working hard to make this reunion the best one yet!.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature, index) => (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    key={feature.name}
                    className="relative pl-12 group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-xl transition-colors"
                  >
                    <dt className="inline font-semibold text-gray-900 dark:text-white">
                      <feature.icon
                        className="absolute left-3 top-5 h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform"
                        aria-hidden="true"
                      />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline text-gray-600 dark:text-gray-300">{feature.description}</dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-background/20 via-background/5 to-background/0 z-10"></div>
              <HeroCarousel />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
