---
slug: Immer 中间件
title: Immer 中间件
date: 2025-08-20
authors: cuiji
tags: [react, Immer]
keywords: [react, Immer]
description: Immer,Immer 中间件
---
**Immer** 是一个独立的 JavaScript 库，它的核心作用是：**让你可以用「可变」（mutative）的方式，去编写「不可变」（immutable）的更新逻辑**。

在 React 和 Zustand 的世界里，状态更新必须是不可变的。这意味着你不能直接修改状态对象或数组本身，而是必须创建一个新的副本。

<!-- truncate -->
Immer 中间件

## Immer 中间件是什么？

**Immer** 是一个独立的 JavaScript 库，它的核心作用是：**让你可以用「可变」（mutative）的方式，去编写「不可变」（immutable）的更新逻辑**。

在 React 和 Zustand 的世界里，状态更新必须是不可变的。这意味着你不能直接修改状态对象或数组本身，而是必须创建一个新的副本。

**没有 Immer 时，更新深层嵌套状态会很麻烦：**

```javascript
// 为了更新 state.user.profile.address.city，你需要这样写：
set((state) => ({
  ...state,
  user: {
    ...state.user,
    profile: {
      ...state.profile,
      address: {
        ...state.address,
        city: "New York",
      },
    },
  },
}));
```

**使用 Immer 后，你可以像直接修改一样写代码：**

```javascript
set(
  produce((state) => {
    state.user.profile.address.city = "New York";
  })
);
```

Immer 会接收你的「可变」操作，在内部应用这些更改到一个临时的草稿（draft）状态上，然后基于草稿为你**生成一个全新的、不可变的状态对象**。你得到了简单直观的代码，同时保持了不可变性的所有优点。

---

## 它的原理是什么？

Immer 的工作原理可以概括为 **「写时复制」（Copy-on-Write）** 和 **「代理」（Proxy）**。

1.  **创建草稿（Draft）**：

    - 当你调用 `produce(baseState, recipe)` 时，Immer 会接收你的原始状态（`baseState`）。
    - 它不会直接修改 `baseState`，而是会创建一个该状态的**代理对象**，这个代理对象就是「草稿」（`draft`）。

2.  **代理拦截（Interception）**：

    - 这个草稿对象是一个 Proxy。当你像 `draft.user.name = 'Alice'` 这样修改它时，Proxy 会拦截这些「看似可变」的操作。
    - 它会在内部记录下所有你对草稿状态的修改路径（例如，「将 `user.name` 的属性值设置为 `'Alice'`」）。

3.  **生成新状态（Patching）**：

    - 一旦你的「修改」函数执行完毕，Immer 会遍历它记录的所有修改。
    - 然后，它**按需地**对原始 `baseState` 进行复制和修改。**只有那些被真正修改了的节点才会被创建新的对象**，而未被修改的部分则会保持对原状态的引用。

4.  **返回结果**：
    - 最终，Immer 返回一个全新的、包含了所有你所需更改的状态对象。

**简单比喻：**
就像你有一份重要的纸质文件（原始状态），需要修改几个字。Immer 的做法是：给你一份透明的临摹纸（草稿），你在临摹纸上随便改。改完后，Immer 会看着你的临摹纸，用笔和新的纸（新状态）重新誊写一份，只修改你标出的地方，其他地方照抄。原始文件完好无损。

**核心优势：**

- **语法简单**：像直接修改一样写代码。
- **性能高效**：结构共享（Structural Sharing）。只更新变化了的部分，未变化的部分保持引用相等，极大优化了性能和提高内存利用率。

---

## 如何在 Zustand 中简单使用？

在 Zustand 中使用 Immer 极其简单，主要有两种方式。

### 方式一：手动包装 `set` 函数（推荐，更灵活）

这是最常用和灵活的方式。你不需要安装任何额外的中间件，只需从 `immer` 包中导入 `produce` 函数，然后在 `set` 函数中用它包裹你的更新函数即可。

1.  **安装 Immer**：

    ```bash
    npm install immer
    ```

2.  **在 Store 中使用**：

    ```javascript
    import { create } from "zustand";
    import { produce } from "immer"; // 1. 导入 produce 函数

    const useStore = create((set) => ({
      user: {
        name: "Bob",
        age: 30,
        address: {
          city: "Boston",
          country: "USA",
        },
      },
      items: [],

      // 2. 在 set 函数中，用 produce 包裹更新函数
      updateAddress: (newCity) =>
        set(
          produce((state) => {
            // 现在你可以像直接修改一样写代码了！
            state.user.address.city = newCity;
          })
        ),

      addItem: (newItem) =>
        set(
          produce((state) => {
            state.items.push(newItem); // 直接 push！
          })
        ),

      updateItemName: (id, newName) =>
        set(
          produce((state) => {
            const itemToUpdate = state.items.find((item) => item.id === id);
            if (itemToUpdate) {
              itemToUpdate.name = newName; // 直接赋值！
            }
          })
        ),
    }));

    export default useStore;
    ```

### 方式二：使用 `zustand/immer` 中间件（自动化）

Zustand 提供了一个官方中间件，可以自动为所有的 `set` 调用应用 Immer。

1.  **从 `zustand/immer` 导入中间件**：

    ```javascript
    import { create } from "zustand";
    import { immer } from "zustand/middleware/immer"; // 导入中间件

    const useStore = create(
      // 用 immer 中间件包裹你的 store 创建函数
      immer((set) => ({
        user: {
          name: "Bob",
          age: 30,
        },
        // 现在所有的 set 函数都会自动被 Immer 处理
        updateUser: (newName) =>
          set((state) => {
            state.user.name = newName; // 直接修改！
            // 注意：这里不需要手动调用 produce 了！
          }),
      }))
    );
    ```

    > **注意**：使用此中间件后，`set` 函数内部的回调函数会自动接收到一个 Immer 的草稿 state，你可以直接修改它。**你不再需要也不能手动包裹 `produce`**。

---

## 总结与选择

| 特性       | 手动 `produce`                           | `immer` 中间件                                    |
| :--------- | :--------------------------------------- | :------------------------------------------------ |
| **灵活性** | **高**。可以选择性地只在复杂更新时使用。 | **中**。所有 `set` 调用都会被处理，无论是否需要。 |
| **代码量** | 需手动导入和包裹 `produce`。             | 设置一次，一劳永逸。                              |
| **性能**   | 更精细的控制，可能更优。                 | 对所有 `set` 都有极小的开销，通常可忽略。         |
| **推荐度** | ⭐⭐⭐⭐⭐ **(推荐)**                    | ⭐⭐⭐⭐                                          |

**个人建议**：
对于大多数项目，**采用「手动包装 `set` 函数」的方式**更好。因为它让你明确知道在哪里使用了 Immer，代码意图更清晰，并且避免了对所有简单更新（如 `set({ count: 1 })`）不必要的 Immer 开销。
