---
slug: GSAP
title: 用 Next.js 与 GSAP 打造丝滑动效
date: 2025-08-16
authors: cuiji
tags: [react, nextjs, GSAP]
keywords: [react, nextjs, GSAP]
description: 用 Next.js 与 GSAP 打造丝滑动效
---

用 Next.js 与 GSAP 打造丝滑动效
<!-- truncate -->

先给大家分享一个小故事，聊聊我是如何接触到 **GSAP** 的，以及为什么要在 Next.js 项目里引入它。

------

## 一、遇见 GSAP 的小故事

前段时间，我在翻阅各大汽车厂商的官网设计，看到某汽车品牌的首页动效非常出色：

- 首屏的标题缓缓浮现
- 滚动到车型展示区时，3D 视差动画十分流畅
- 底部 CTA 按钮还有细微弹性反馈

当时单纯好奇，没想过是库，就以为这个车厂好，官网都做得这么细，汽车本质差不了，本想自己复现一下，发现越写越麻烦，然后就去翻控制台发现它们用的是一套定制化动画引擎，回头一查，才知道原来业内的头部大厂大都在使用 **GSAP (GreenSock Animation Platform)**，以前工作几乎很少写复杂的动画，基本一些简单的animation就可以，所以这里就记录一下。GSAP 作为 **框架无关** 的高级动画库，可以无缝支持 CSS、SVG、Canvas、React、Vue、WebGL 等所有可由 JavaScript 操控的对象。

------

## 二、在 Next.js 中引入 GSAP

为了在 Next.js 应用中使用 GSAP，你需要先安装核心包以及 React 适配包：

```bash
pnpm install gsap @gsap/react
```

注意，为了减少把NextJS逐渐写成了React，要将注册单独放入一个空间注册

```tsx
//components/GSAPInitializer.tsx
'use client';

import { useEffect } from 'react';

import { gsapInit } from '@/app/utils/gsapInit';

const GSAPInitializer: React.FC = () => {
    useEffect(() => {
        gsapInit();
    }, []);

    return null;
};

export default GSAPInitializer;
```
```ts
// utils/gsapInit.ts
// 注册插件的纯模块
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

let hasRegistered = false;

export const gsapInit = (): void => {
    if (!hasRegistered) {
        gsap.registerPlugin(useGSAP);
        hasRegistered = true;
        if (process.env.NODE_ENV === 'development') {
            console.log('GSAP plugin registered.');
        }
    }
};
```

然后去到根目录，正常引入就好，这样就不会污染`layout.tsx` 服务端组件，它只是**渲染了一个客户端子组件**，不会强制自己变成客户端。这样就完美分离了 SSR 和动画初始化逻辑

```js
import type { Metadata } from 'next';

import './styles/index.css';

import type { FC, PropsWithChildren } from 'react';

import GSAPInitializer from './_components/GSAP/GSAPInitializer';

export const metadata: Metadata = {
    title: 'nextapp',
    description: '我的记录本',
};

const RootLayout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <html lang="en">
            <GSAPInitializer />
            <body>{children}</body>
        </html>
    );
};

export default RootLayout;
```

以上代码展示了如何用 `import { useGSAP } from '@gsap/react'` 将动画钩子和 GSAP 结合，方便在 React 环境下使用，并自动处理生命周期。

------

## 三、封装「底部向上渐显」文字组件

在实际项目中，我们经常需要将一段段文字**从底部向上**按行依次淡入。

### 3.1 组件代码

```jsx
// gsap: 从下至上渐显动画
'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useRef } from 'react';

interface FadeUpProps {
    children: React.ReactNode; //内容
    duration?: number; //执行时间
    delay?: number; //延迟
    distance?: number; //距离
    stagger?: number; //比例
    index?: number; //索引
}

export default function FadeUp({
    children,
    duration = 1,
    delay = 0,
    distance = 50,
    stagger = 0.3,
    index = 1,
}: FadeUpProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useGSAP(() => {
        gsap.fromTo(
            wrapperRef.current,
            { y: distance, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration,
                delay: delay || (index * stagger).toFixed(1),
                ease: 'power3.out',
            },
        );
    });

    return <div ref={wrapperRef}>{children}</div>;
}
```

### 3.2 使用示例

```jsx
import type { FC } from 'react';
import FadeUp from '../_components/GSAP/FadeUp';
const App: FC = () => {
    return (
        <main>
            <FadeUp>欢迎来到cuiji的档案室，这里是cuiji的代码人生和生活的记录</FadeUp>
        </main>
    );
};
export default App;

```

------

## 四、GSAP 常用 API 总览

以下是 GSAP 在日常使用中最常见的几组 API，皆摘自官方速查表，可快速上手：

| 功能             | 语法示例                                                     | 说明                                                         |
| ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| Tween 动画       | `gsap.to('.box',{ x:100, opacity:0.5, duration:1 })`         | 基本补间动画，将目标属性在指定时长内过渡到指定值。           |
| from / fromTo    | `gsap.from('.box',{ y:50 })` / `gsap.fromTo('.box',{y:50},{y:0, duration:1})` | `from`：从指定状态过渡到默认；`fromTo`：可同时指定起始和结束状态。 |
| Timeline 编排    | `const tl=gsap.timeline(); tl.to(...).to(...);`              | 让多个动画按时间线依次执行，可用 `<`, `>` 等控制位置偏移。   |
| 控制方法         | `tween.play()/pause()/reverse()/seek(1.5)/timeScale(2)`      | 获取 `Tween` 或 `Timeline` 实例后，可灵活控制动画播放、暂停、倒放、加速等。 |
| 缓动函数（Ease） | `ease:'power1.inOut'`, `'elastic.out(1,0.5)'`, `'bounce'`    | 内置多种缓动曲线，可用可视化工具挑选曲线，亦支持自定义。     |
| ScrollTrigger    | Bundled 插件，需注册，示例：`gsap.to('.e',{ scrollTrigger:{ trigger:'.e', scrub:true } })` | 实现**滚动触发动画**，支持 `start/end`、`pin`、`scrub`、`markers`、`toggleActions`。 |
| Draggable 等     | `import { Draggable } from 'gsap/Draggable'; gsap.registerPlugin(Draggable);` | 配合插件可实现拖拽、SVG 变形、路径动画等高级效果。           |

------

**参考文献**  
 • GSAP 官方 GitHub 与文档
 • React 中更简单的使用 gsap 的方式：useGSAP 钩子介绍
 • GSAP Cheat Sheet（基础动画与控制方法）
 • ScrollTrigger 插件深度示例与总结