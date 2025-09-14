---
slug: Zustand
title: Zustand
date: 2025-08-28
authors: cuiji
tags: [react, Zustand]
keywords: [react, Zustand]
description: Zustand
---
Zustand 是一个轻量级的 React 状态管理库，由 React 生态知名开发者创建。

<!-- truncate -->

# Zustand 学习笔记

## 1. Zustand 简介

### 什么是 Zustand？

Zustand 是一个轻量级的 React 状态管理库，由 React 生态知名开发者创建。它的特点是：

- 极简 API（只有一个 `create` 函数）
- 无需 Provider 包裹组件
- 支持 Hook 方式使用状态
- 自动处理状态更新和重渲染优化

### 与其他状态库对比

- 比 Redux 简单很多，减少模板代码
- 比 Context API 更高效，避免不必要的重渲染
- 比 MobX 更轻量，学习成本更低

## 2. 安装与引入

### 安装

```bash
npm install zustand
# 或
yarn add zustand
```

### 基础引入

```javascript
import { create } from "zustand";
```

## 3. 创建第一个 Store

### 基础 Store 创建

```javascript
import { create } from "zustand";

// 创建 store
const useStore = create((set, get) => ({
  // 状态
  count: 0,

  // Actions：更新状态的方法
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),

  // 异步 action 示例
  incrementAsync: async () => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    set((state) => ({ count: state.count + 1 }));
  },

  // 使用 get 函数访问当前状态
  logCount: () => {
    const currentCount = get().count;
    console.log("Current count:", currentCount);
  },
}));
```

## 4. 在组件中使用 Store

### 基础使用

```jsx
import React from "react";
import useStore from "./store";

function Counter() {
  // 获取整个 store
  const { count, increment, decrement } = useStore();

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}
```

### 选择性获取状态（性能优化）

```jsx
function Counter() {
  // 只订阅 count 状态，避免不必要的重渲染
  const count = useStore((state) => state.count);
  const increment = useStore((state) => state.increment);

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>+</button>
    </div>
  );
}
```

## 5. 高级封装模式

### 分离 State 和 Actions

```javascript
// store/countStore.js
export const createCountSlice = (set, get) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
});

// store/userStore.js
export const createUserSlice = (set, get) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
});

// store/index.js - 合并多个 slice
import { create } from "zustand";
import { createCountSlice } from "./countStore";
import { createUserSlice } from "./userStore";

export const useStore = create((...a) => ({
  ...createCountSlice(...a),
  ...createUserSlice(...a),
}));
```

### 使用 Immer 处理嵌套状态（可选）

```bash
npm install immer
```

```javascript
import { produce } from "immer";

const useStore = create((set) => ({
  user: {
    profile: {
      name: "",
      age: 0,
      address: {
        city: "",
        country: "",
      },
    },
  },

  // 使用 Immer 简化嵌套更新
  updateProfile: (updates) =>
    set(
      produce((state) => {
        state.user.profile = { ...state.user.profile, ...updates };
      })
    ),

  updateAddress: (address) =>
    set(
      produce((state) => {
        state.user.profile.address = {
          ...state.user.profile.address,
          ...address,
        };
      })
    ),
}));
```

## 6. 实战示例

### Todo 应用示例

```javascript
// store/todoStore.js
export const useTodoStore = create((set, get) => ({
  todos: [],
  filter: "all", // all, active, completed

  // Actions
  addTodo: (text) =>
    set(
      produce((state) => {
        state.todos.push({
          id: Date.now(),
          text,
          completed: false,
        });
      })
    ),

  toggleTodo: (id) =>
    set(
      produce((state) => {
        const todo = state.todos.find((todo) => todo.id === id);
        if (todo) todo.completed = !todo.completed;
      })
    ),

  removeTodo: (id) =>
    set(
      produce((state) => {
        state.todos = state.todos.filter((todo) => todo.id !== id);
      })
    ),

  setFilter: (filter) => set({ filter }),

  // 计算属性
  get filteredTodos() {
    const { todos, filter } = get();
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  },

  // 统计
  get stats() {
    const todos = get().todos;
    return {
      total: todos.length,
      completed: todos.filter((t) => t.completed).length,
      active: todos.filter((t) => !t.completed).length,
    };
  },
}));
```

### 在组件中使用

```jsx
function TodoApp() {
  const { filteredTodos, addTodo, toggleTodo, removeTodo, setFilter, stats } =
    useTodoStore();

  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      addTodo(input.trim());
      setInput("");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>

      <div>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("active")}>Active</button>
        <button onClick={() => setFilter("completed")}>Completed</button>
      </div>

      <div>
        <p>
          Total: {stats.total} | Completed: {stats.completed} | Active:{" "}
          {stats.active}
        </p>
      </div>

      <ul>
        {filteredTodos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />
            <span
              style={{
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => removeTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## 7. 在 Next.js 中使用 Zustand

### 基础设置（与 React 相同）

```javascript
// store/store.js
import { create } from "zustand";

export const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

### 处理服务端渲染 (SSR)

```javascript
// 使用 zustand/context 处理 SSR
import { createStore } from "zustand";
import { createContext } from "react";
import { useStoreWithEqualityFn } from "zustand/traditional";

// 创建 store 初始化函数
export const createMyStore = () =>
  createStore((set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
  }));

// 创建 React context
export const StoreContext = createContext(null);

// Provider 组件
export const StoreProvider = ({ children, initialState }) => {
  const storeRef = useRef();
  if (!storeRef.current) {
    storeRef.current = createMyStore(initialState);
  }
  return (
    <StoreContext.Provider value={storeRef.current}>
      {children}
    </StoreContext.Provider>
  );
};

// Hook 用于在组件中访问 store
export const useStore = (selector, equalityFn) => {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error("Missing StoreProvider");
  }
  return useStoreWithEqualityFn(store, selector, equalityFn);
};
```

### 在 Next.js 页面中使用

```jsx
// pages/_app.js
import { StoreProvider } from '../store'

export default function App({ Component, pageProps }) {
  return (
    <StoreProvider>
      <Component {...pageProps} />
    </StoreProvider>
  )
}

// pages/index.js
import { useStore } from '../store'

export default function HomePage() {
  const count = useStore(state => state.count)
  const increment = useStore(state => state.increment)

  return (
    <div>
      <h1>Count: {count}</h1>
      <button onClick={increment}>Increment</button>
    </div>
  )
}
```

### 处理 Hydration 问题

```javascript
// 解决 SSR hydration 不匹配问题
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useStore = create(
  persist(
    (set, get) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    {
      name: "app-storage", // 存储名称
      storage: createJSONStorage(() => localStorage), // 或 sessionStorage
      // 在 Next.js 中，你可能需要自定义存储以避免 SSR 问题
      // onRehydrateStorage: () => (state) => {
      //   console.log('hydration complete')
      // }
    }
  )
);
```

## 8. 性能优化技巧

### 1. 选择性订阅

```jsx
// 不好：组件会在任何状态变化时重渲染
const { count, user } = useStore();

// 好：只在 count 变化时重渲染
const count = useStore((state) => state.count);

// 好：使用 shallow 比较对象
import { shallow } from "zustand/shallow";
const { user, profile } = useStore(
  (state) => ({ user: state.user, profile: state.profile }),
  shallow
);
```

### 2. 使用 Derive 状态

```javascript
const useStore = create((set, get) => ({
  items: [],
  filter: "",

  // 使用 getter 计算派生状态
  get filteredItems() {
    const { items, filter } = get();
    return items.filter((item) => item.includes(filter));
  },
}));
```

### 3. 批量更新

```javascript
// 多个状态更新合并为一次重渲染
const useStore = create((set) => ({
  user: null,
  profile: null,
  loading: false,

  // 批量更新
  setUserData: (user, profile) => set({ user, profile }),

  // 或者使用函数式更新
  updateMultiple: () =>
    set((state) => ({
      user: { ...state.user, name: "New Name" },
      profile: { ...state.profile, age: 30 },
    })),
}));
```

## 9. 调试与开发工具

### 安装开发工具

```bash
npm install @redux-devtools/extension
```

### 启用 DevTools

```javascript
import { devtools } from "zustand/middleware";

const useStore = create(
  devtools(
    (set, get) => ({
      count: 0,
      increment: () => set((state) => ({ count: state.count + 1 })),
    }),
    { name: "MyStore" }
  )
);
```

## 10. 学习笔记文档

# Zustand 学习笔记

## 核心概念

### 1. Store 创建

- 使用 `create` 函数创建 store
- 接收 set、get 参数用于更新和访问状态
- 返回一个 hook 用于在组件中使用

### 2. 状态更新

- `set` 函数用于更新状态
- 支持直接设置值或函数式更新
- 自动合并浅层状态（深层需要手动处理或使用 Immer）

### 3. 组件使用

- 使用生成的 hook 访问 store
- 可以通过 selector 函数选择性订阅状态
- 使用 `shallow` 比较优化对象/数组的重新渲染

## 最佳实践

### 1. 组织代码

- 按功能模块拆分 store
- 使用 slice 模式组合相关状态
- 将复杂逻辑提取到自定义 hooks

### 2. 性能优化

- 总是使用选择性订阅
- 对对象/数组使用浅比较
- 使用派生状态避免重复计算

### 3. 类型安全（TypeScript）

```typescript
interface StoreState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useStore = create<StoreState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));
```

## 常见问题解决

### 1. 循环依赖

- 避免在 store 中直接导入组件
- 使用函数参数或回调解决依赖问题

### 2. 测试

```javascript
// 测试 store
import { act } from "@testing-library/react";
import { useStore } from "./store";

test("increment increases count by 1", () => {
  const { increment, getState } = useStore;

  act(() => {
    increment();
  });

  expect(getState().count).toBe(1);
});
```

### 3. 服务端渲染

- 使用 zustand/context 处理 SSR
- 注意 hydration 不匹配问题
- 考虑使用 persist middleware 处理状态持久化

### 3. 常见坑

- 创建 create 对象要注意它本身就是个 hook，因此在抛出的时候要不就直接抛出，要不就设定成一个回调函数，不然会报错，因为 hook 不可以在顶层使用
- 在 Server Component 调用 useStore：不允许，必须在 Client Component 使用。
- persist 与 SSR：localStorage 仅在浏览器；不要在服务端触发持久化。
- 跨请求状态泄漏：服务端不要持久化修改单例 store；使用“数据注水”而不是共享实例。
- 选择器返回新对象：每次返回新引用会导致重渲；配合 shallow 或只订原子字段。
