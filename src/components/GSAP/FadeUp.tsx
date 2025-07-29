// gsap: 从下至上渐显动画
import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface FadeUpProps {
  children: React.ReactNode
  duration?: number// 持续多久
  delay?: number// 延迟多久
  distance?: number// 位移距离
  stagger?: number// 间隔比例
  index?: number// 索引
}

export default function FadeUp({
  children, duration = 1, delay = 0, distance = 50, index = 1, stagger = 0.3,
}: FadeUpProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (wrapperRef.current) {
      gsap.fromTo(
        wrapperRef.current,
        { y: distance, opacity: 0 },
        { y: 0, opacity: 1, duration, delay: (index * stagger).toFixed(1), ease: 'power3.out' },
      )
    }
  }, [index, duration, delay, distance, stagger])

  return <div ref={wrapperRef}>{children}</div>
}
