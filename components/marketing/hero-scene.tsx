"use client";

import { motion } from "framer-motion";
import { HeartHandshake, Sparkles, Trophy } from "lucide-react";

import { Card } from "@/components/ui/card";

const cards = [
  {
    title: "Subscribers fund impact",
    value: "10% minimum",
    icon: HeartHandshake
  },
  {
    title: "Latest score set",
    value: "Top 5 retained",
    icon: Sparkles
  },
  {
    title: "Monthly reward engine",
    value: "3 prize tiers",
    icon: Trophy
  }
];

export function HeroScene() {
  return (
    <div className="relative">
      <div className="absolute -left-4 top-4 h-44 w-44 rounded-full bg-accent/20 blur-3xl" />
      <div className="absolute -right-4 bottom-0 h-52 w-52 rounded-full bg-secondary/15 blur-3xl" />
      <div className="relative grid gap-4">
        {cards.map((card, index) => {
          const Icon = card.icon;

          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 * index }}
            >
              <Card className="mesh-panel rounded-[32px] p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="eyebrow">{card.title}</p>
                    <p className="serif mt-4 text-3xl">{card.value}</p>
                  </div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/12 text-accent">
                    <Icon className="size-5" />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
