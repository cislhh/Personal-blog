import { type Variants, motion } from 'framer-motion'
import FadeUp from '../../GSAP/FadeUp'

import Translate from '@docusaurus/Translate'

import HeroSvg from './img/hero.svg'

import SocialLinks from '@site/src/components/SocialLinks'
import { MovingButton } from '../../magicui/moving-border'
import styles from './styles.module.css'

import { useHistory } from 'react-router-dom'

const variants: Variants = {
  visible: i => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 100,
      duration: 0.3,
      delay: i * 0.3,
    },
  }),
  hidden: { opacity: 0, y: 30 },
}

function Circle() {
  return <div className={styles.circle} />
}

function Name() {
  return (
    <FadeUp index={1}>
      <div
        className={styles.hero_text}
      >
        <Translate id="homepage.hero.greet">你好! 我是</Translate>
        <span
          className={styles.name}
          onMouseMove={(e) => {
            const bounding = e.currentTarget.getBoundingClientRect()
            e.currentTarget.style.setProperty('--mouse-x', `${bounding.x}px`)
            e.currentTarget.style.setProperty('--mouse-y', `${bounding.y}px`)
          }}
        >
          <Translate id="homepage.hero.name">淬己</Translate>
        </span>
        <span className="ml-1">👋</span>
      </div>
    </FadeUp>
  )
}

export default function Hero() {
  const history = useHistory()
  const movingAbout = () => {
    history.push('/about')
  }
  // console.log(movingAbout, 'data----movingAbout')
  return (
    <div className={styles.hero}>
      <div className={styles.intro}>
        <Name />
        <FadeUp index={2}>
          <p className="max-lg:px-4">
            <Translate id="homepage.hero.text">
              在这里我会分享各类技术栈所遇到问题与解决方案，带你了解最新的技术栈以及实际开发中如何应用，并希望我的开发经历对你有所启发。
            </Translate>
          </p>
        </FadeUp>
        <FadeUp index={3}>
          <SocialLinks />
        </FadeUp>

        <FadeUp index={4}>
          <div className="mt-4 flex">
            <MovingButton
              onClick={movingAbout}
              borderRadius="1.25rem"
              className="relative flex cursor-pointer items-center rounded-2xl border border-solid border-neutral-200 bg-background px-5 py-3 text-center text-base font-semibold dark:border-neutral-800"
            >
              <a className="font-semibold">
                <Translate id="hompage.hero.introduce">自我介绍</Translate>
              </a>
            </MovingButton>
          </div>

        </FadeUp>

      </div>
      <motion.div className={styles.background}>
        <HeroSvg />
        <Circle />
      </motion.div>
    </div>
  )
}
