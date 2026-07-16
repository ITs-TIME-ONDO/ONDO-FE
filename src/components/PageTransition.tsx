import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const variants = {
  initial: { scale: 0.997 },
  animate: { scale: 1 },
  exit: { scale: 1 },
}

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="w-full"
    >
      {children}
    </motion.div>
  )
}
