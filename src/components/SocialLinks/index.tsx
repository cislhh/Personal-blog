import { Icon } from '@iconify/react'
import social from '@site/data/social'
import Tooltip from '@site/src/components/Tooltip'
import React, { ReactElement, useState } from 'react'
import Image from '@theme/IdealImage'
import styles from './styles.module.css'

export type Social = {
  github?: string
  twitter?: string
  juejin?: string
  csdn?: string
  qq?: string
  wx?: string
  cloudmusic?: string
  zhihu?: string
  email?: string
}

interface Props {
  href: string
  title: string
  color?: string
  icon: string | JSX.Element
  type: string
  style: React.CSSProperties & { [key: string]: string }
}

const renderers: Record<string, (params: { icon: React.ReactNode, title: string }) => React.ReactNode> = {
  wx: ({ icon, title, ...prop }) => {
    const [showImage, setShowImage] = useState(false)
    const wximg = 'img/mywx.png'
    return (
      <a
        title={title}
        {...prop}
        onClick={() => setShowImage(!showImage)}
      >
        {icon}
        {showImage && (
          <Image src={wximg} alt={wximg} img="" className={styles.wximg} />
        )}
      </a>
    )
  },
}

function SocialLink({ href, icon, title, color, type, ...prop }: Props) {
  const iconNode = typeof icon === 'string' ? <Icon icon={icon} /> : icon
  const content = (renderers[type]
    ? renderers[type]({ icon: iconNode, title, ...prop })
    : (
        <a href={href} target="_blank" {...prop} title={title}>
          {iconNode}
        </a>
      ))
  return (
    <Tooltip key={title} text={title} anchorEl="#__docusaurus" id={`tooltip-${title}`}>
      {content as ReactElement}
    </Tooltip>
  )
}

export default function SocialLinks({ ...prop }) {
  return (
    <div className={styles.socialLinks} {...prop}>
      {Object.entries(social)
        .filter(([_key, { href }]) => href)
        .map(([key, { href, icon, title, color, type }]) => {
          return <SocialLink key={key} href={href!} title={title} icon={icon} type={type as string} style={{ '--color': color, 'position': 'relative', 'cursor': 'pointer' }} />
        })}
    </div>
  )
}
