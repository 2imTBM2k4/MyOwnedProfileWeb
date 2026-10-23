"use client";

import { useRef, type PointerEvent } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import styles from "@/app/profile.module.css";

type ProjectPreviewProps = { image: string; title: string; href?: string };

export default function ProjectPreview({ image, title, href }: ProjectPreviewProps) {
  const reducedMotion = useReducedMotion();
  const frame = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(x, { stiffness: 220, damping: 28 });
  const rotateY = useSpring(y, { stiffness: 220, damping: 28 });

  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (reducedMotion || event.pointerType !== "mouse" || !frame.current) return;
    const bounds = frame.current.getBoundingClientRect();
    x.set(((event.clientY - bounds.top) / bounds.height - 0.5) * -5);
    y.set(((event.clientX - bounds.left) / bounds.width - 0.5) * 5);
  };
  const reset = () => { x.set(0); y.set(0); };
  const picture = <motion.div className={styles.previewPlane} style={reducedMotion ? undefined : { rotateX, rotateY }}>
    <img src={image} alt={`Giao diện ${title}`} loading="lazy" width="1440" height="900" />
    {href && <span className={styles.previewAction} aria-hidden="true"><ArrowUpRight size={22} /></span>}
  </motion.div>;

  return <div ref={frame} className={styles.projectPreview} onPointerMove={move} onPointerLeave={reset} data-project-preview>
    {href ? <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Mở ${title} (tab mới)`}>{picture}</a> : picture}
  </div>;
}
