"use client"

import { ArrowRight, Github, Sparkles } from "lucide-react";
import Link from "next/link";
//import { Button } from "../ui/button";
import { motion } from "motion/react";
import BackgroundVideo from "../ui/backgroundvideo";

export default function HeroSection() {
  return (
    <section
      className="relative flex flex-col items-center justify-center py-20"
      aria-label="Nextjs Starter Kit Hero"
    >
      {/* Background gradient 
      <div className="absolute inset-0 -z-10 h-full w-full bg-white dark:bg-black bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
    </div>

      <div className="absolute inset-0 -z-10 ">
        <img
          src="/images/alex0.jpg"
          alt="National Harbor Background"
          className="object-cover w-full h-full"
        />
      </div>
  */}

      <div className="space-y-6 text-center max-w-4xl px-4">

        {/* Pill badge
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto w-fit rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1 mb-6"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-blue-900 dark:text-blue-200">
            <Sparkles className="h-4 w-4" />
            <span>The Ultimate Reunion Starter Kit</span>
          </div>
        </motion.div>
 */}
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-yellow-800 to-gray-900 dark:from-white dark:via-yellow-300 dark:to-white animate-gradient-x pb-2"
        >
          See You at Wiley Swift <br className="hidden sm:block" />
          Reunion 2025
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
        >
          Get Ready for more Magic Moments! Wiley Swift Family Reunion is Coming to Alexandria!
        </motion.p>

        {/* CTA Buttons 
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center items-center gap-4 pt-4"
        >
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-8 h-12"
            >
              Register Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </motion.div>*/}
      </div>
    </section>
  );
}
