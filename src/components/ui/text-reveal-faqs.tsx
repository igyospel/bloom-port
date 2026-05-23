import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion'
import { motion } from "framer-motion";

const faqItems = [
  {
    id: 'item-1',
    question: 'What is Bloomport?',
    answer: 'Bloomport is an AI-powered mindful productivity platform that helps you declutter your mind, find focus, and rediscover calm through conversational intelligence and guided reflection tools.',
  },
  {
    id: 'item-2',
    question: 'How does Bloomport help with mindfulness?',
    answer: 'Bloomport combines LLM-powered journaling, focus sessions with intelligent reminders, and personalized insights based on your conversation patterns to support mental clarity and intentional living.',
  },
  {
    id: 'item-3',
    question: 'Is my data private and secure?',
    answer: 'Absolutely. Privacy is at the core of Bloomport. Your reflections, conversations, and personal data are encrypted and never shared with third parties. You remain in full control of your information.',
  },
  {
    id: 'item-4',
    question: 'Can teams use Bloomport together?',
    answer: 'Yes! Bloomport offers Team Mindfulness features that allow colleagues to share their journey, build a culture of intentional thinking, and support each other in maintaining focus and wellbeing.',
  },
  {
    id: 'item-5',
    question: 'What platforms does Bloomport support?',
    answer: 'Bloomport is available on web, iOS, and Android, with seamless sync across all your devices. Start a reflection on your phone and continue on your desktop without missing a beat.',
  },
];

function BlurredStagger({ text }: { text: string }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
    },
  };

  return (
    <div className="w-full">
      <motion.p
        variants={container}
        initial="hidden"
        animate="show"
        className="text-base leading-relaxed break-words whitespace-normal text-white/80"
      >
        {text.split("").map((char, index) => (
          <motion.span
            key={index}
            variants={letterAnimation}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.p>
    </div>
  );
}

export default function TextRevealFAQs() {
  return (
    <section className="py-12 sm:py-16 md:py-24 bg-[#0a0a0a] border-t border-white/5">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-6 sm:gap-8 md:grid-cols-5 md:gap-12">
          <div className="md:col-span-2">
            <h2 className="text-white text-3xl sm:text-4xl font-semibold font-serif">FAQs</h2>
            <p className="text-white/60 mt-3 sm:mt-4 text-balance text-base sm:text-lg">
              Everything you need to know about Bloomport
            </p>
            <p className="text-white/40 mt-4 sm:mt-6 hidden md:block text-sm sm:text-base">
              Can't find what you're looking for? Reach out to our{' '}
              <a
                href="#"
                className="text-brand-accent font-medium hover:underline"
              >
                Bloomport support team
              </a>{' '}
              for assistance.
            </p>
          </div>

          <div className="md:col-span-3">
            <Accordion
              type="single"
              collapsible>
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-b border-white/10">
                  <AccordionTrigger className="cursor-pointer text-base font-medium text-white hover:no-underline hover:text-white/80">{item.question}</AccordionTrigger>
                  <AccordionContent>
                    <BlurredStagger text={item.answer} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          <p className="text-white/40 mt-4 sm:mt-6 md:hidden text-sm">
            Can't find what you're looking for? Contact our{' '}
            <a
              href="#"
              className="text-brand-accent font-medium hover:underline">
              customer support team
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
