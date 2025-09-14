---
slug: Zustand 基础封装
title: Zustand 基础封装
date: 2025-08-31
authors: cuiji
tags: [react, Zustand,nextjs]
keywords: [react, Zustand,nextjs]
description: Zustand, Zustand 基础封装
---
Zustand 基础封装以及nextjs使用补充

<!-- truncate -->
# Next.js + Zustand 状态管理最佳实践

## 目录
1. [项目背景](#项目背景)
2. [Zustand 基础使用](#zustand-基础使用)
3. [中间件封装](#中间件封装)
4. [Store 工厂函数](#store-工厂函数)
5. [Next.js 集成方案](#nextjs-集成方案)
6. [使用示例](#使用示例)
7. [最佳实践](#最佳实践)
8. [高级封装方案](#高级封装方案)

## 高级封装方案

### 核心封装实现
```typescript
import type { StateCreator } from 'zustand';
import type { DevtoolsOptions, PersistOptions } from 'zustand/middleware';

import { createStore as createStoreFunction } from 'zustand';
import { devtools, persist, redux, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/**
 * 创建包含订阅、immer 以及 devtools 功能的普通状态商店
 * @param creator 状态创建器
 * @param devtoolsOptions DevTools 配置选项
 * @returns Zustand store
 */
export const createStore = <T extends object>(
    creator: StateCreator<
        T,
        [
            ['zustand/subscribeWithSelector', never],
            ['zustand/immer', never],
            ['zustand/devtools', never],
        ]
    >,
    devtoolsOptions?: DevtoolsOptions,
) => {
    return createStoreFunction<T>()(
        subscribeWithSelector(immer(devtools(creator, devtoolsOptions))),
    );
};

/**
 * 创建包含订阅、immer 以及 devtools 功能的持久化状态商店
 * 同时支持自动存储到客户端，默认存储到 localStorage
 * @param creator 状态创建器
 * @param persistOptions 持久化配置选项
 * @param devtoolsOptions DevTools 配置选项
 * @returns Zustand store
 */
export const createPersistStore = <T extends object, P = T>(
    creator: StateCreator<
        T,
        [
            ['zustand/subscribeWithSelector', never],
            ['zustand/immer', never],
            ['zustand/devtools', never],
            ['zustand/persist', P],
        ]
    >,
    persistOptions: PersistOptions<T, P>,
    devtoolsOptions?: DevtoolsOptions,
) => {
    return createStoreFunction<T>()(
        subscribeWithSelector(
            immer(devtools(persist(creator as unknown as any, persistOptions), devtoolsOptions)),
        ),
    );
};

/**
 * 创建包含订阅、immer 以及 devtools 功能的 reducer 状态商店
 * 支持 Redux 风格的状态管理
 * @param reducer 状态更新函数
 * @param initialState 初始状态
 * @param devtoolsOptions DevTools 配置选项
 * @returns Zustand store
 */
export const createReduxStore = <
    T extends object,
    A extends {
        type: string;
    },
>(
    reducer: (state: T, action: A) => T,
    initialState: T,
    devtoolsOptions?: DevtoolsOptions,
) =>
    createStoreFunction(
        subscribeWithSelector(immer(devtools(redux(reducer, initialState), devtoolsOptions))),
    );

/**
 * 创建包含订阅、immer 以及 devtools 功能的持久化 reducer 状态商店
 * 支持 Redux 风格的状态管理，同时支持持久化
 * @param reducer 状态更新函数
 * @param initialState 初始状态
 * @param persistOptions 持久化配置选项
 * @param devtoolsOptions DevTools 配置选项
 * @returns Zustand store
 */
export const createPersistReduxStore = <
    T extends object,
    A extends {
        type: string;
    },
    P = T,
>(
    reducer: (state: T, action: A) => T,
    initialState: T,
    persistOptions: PersistOptions<T, P>,
    devtoolsOptions?: DevtoolsOptions,
) =>
    createStoreFunction(
        subscribeWithSelector(
            immer(
                devtools(
                    persist(redux(reducer, initialState), persistOptions as any),
                    devtoolsOptions,
                ),
            ),
        ),
    );
```

### 类型定义补充
```typescript
// src/libs/store/types.ts
import type { StateCreator, StoreApi } from 'zustand';
import type { DevtoolsOptions, PersistOptions } from 'zustand/middleware';

/**
 * 基础 Store 类型（无持久化）
 */
export type BaseStoreCreator<T> = StateCreator<
    T,
    [
        ['zustand/subscribeWithSelector', never],
        ['zustand/immer', never],
        ['zustand/devtools', never],
    ]
>;

/**
 * 持久化 Store 类型
 */
export type PersistStoreCreator<T, P = T> = StateCreator<
    T,
    [
        ['zustand/subscribeWithSelector', never],
        ['zustand/immer', never],
        ['zustand/devtools', never],
        ['zustand/persist', P],
    ]
>;

/**
 * Redux Action 类型
 */
export interface ReduxAction {
    type: string;
    [key: string]: any;
}

/**
 * Redux Reducer 类型
 */
export type ReduxReducer<T, A extends ReduxAction> = (state: T, action: A) => T;

/**
 * Store 实例类型
 */
export type StoreInstance<T> = StoreApi<T>;
```

### 使用示例补充

#### 1. 基础 Store 使用
```typescript
// src/stores/counter.ts
import { createStore } from '@/libs/store';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useCounterStore = createStore<CounterState>(
  (set) => ({
    count: 0,
    increment: () => set((state) => ({ count: state.count + 1 })),
    decrement: () => set((state) => ({ count: state.count - 1 })),
  }),
  {
    name: 'Counter Store',
    enabled: process.env.NODE_ENV === 'development',
  }
);
```

#### 2. 持久化 Store 使用
```typescript
// src/stores/user.ts
import { createPersistStore } from '@/libs/store';

interface UserState {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  setUser: (user: UserState['user']) => void;
  logout: () => void;
}

export const useUserStore = createPersistStore<UserState>(
  (set) => ({
    user: null,
    setUser: (user) => set({ user }),
    logout: () => set({ user: null }),
  }),
  {
    name: 'user-storage',
    partialize: (state) => ({ user: state.user }), // 只持久化 user 字段
  },
  {
    name: 'User Store',
    enabled: process.env.NODE_ENV === 'development',
  }
);
```

#### 3. Redux 风格 Store 使用
```typescript
// src/stores/todo.ts
import { createReduxStore } from '@/libs/store';

interface TodoState {
  todos: Array<{ id: string; text: string; completed: boolean }>;
}

interface TodoAction {
  type: 'ADD_TODO' | 'TOGGLE_TODO' | 'REMOVE_TODO';
  payload?: any;
}

const todoReducer: ReduxReducer<TodoState, TodoAction> = (state, action) => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          {
            id: Date.now().toString(),
            text: action.payload.text,
            completed: false,
          },
        ],
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload.id
            ? { ...todo, completed: !todo.completed }
            : todo
        ),
      };
    case 'REMOVE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload.id),
      };
    default:
      return state;
  }
};

const initialState: TodoState = {
  todos: [],
};

export const useTodoStore = createReduxStore<TodoState, TodoAction>(
  todoReducer,
  initialState,
  {
    name: 'Todo Store',
    enabled: process.env.NODE_ENV === 'development',
  }
);

// 创建 action creators
export const todoActions = {
  addTodo: (text: string) => ({ type: 'ADD_TODO' as const, payload: { text } }),
  toggleTodo: (id: string) => ({ type: 'TOGGLE_TODO' as const, payload: { id } }),
  removeTodo: (id: string) => ({ type: 'REMOVE_TODO' as const, payload: { id } }),
};

// 在组件中使用
export const useTodoActions = () => {
  const store = useTodoStore.getState();
  
  return {
    addTodo: (text: string) => store.dispatch(todoActions.addTodo(text)),
    toggleTodo: (id: string) => store.dispatch(todoActions.toggleTodo(id)),
    removeTodo: (id: string) => store.dispatch(todoActions.removeTodo(id)),
  };
};
```

#### 4. 持久化 Redux Store 使用
```typescript
// src/stores/settings.ts
import { createPersistReduxStore } from '@/libs/store';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  notifications: boolean;
}

interface SettingsAction {
  type: 'SET_THEME' | 'SET_LANGUAGE' | 'TOGGLE_NOTIFICATIONS';
  payload?: any;
}

const settingsReducer: ReduxReducer<SettingsState, SettingsAction> = (state, action) => {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload.theme };
    case 'SET_LANGUAGE':
      return { ...state, language: action.payload.language };
    case 'TOGGLE_NOTIFICATIONS':
      return { ...state, notifications: !state.notifications };
    default:
      return state;
  }
};

const initialState: SettingsState = {
  theme: 'light',
  language: 'zh',
  notifications: true,
};

export const useSettingsStore = createPersistReduxStore<SettingsState, SettingsAction>(
  settingsReducer,
  initialState,
  {
    name: 'settings-storage',
    partialize: (state) => ({
      theme: state.theme,
      language: state.language,
      notifications: state.notifications,
    }),
  },
  {
    name: 'Settings Store',
    enabled: process.env.NODE_ENV === 'development',
  }
);
```

### 高级特性说明

#### 1. **类型安全**
```typescript
// 完整的类型推导
const store = createStore<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));

// TypeScript 会自动推导出正确的类型
const { count, increment } = store.getState();
```

#### 2. **中间件组合优势**
```typescript
// 中间件按顺序组合，每个都有特定作用
subscribeWithSelector(immer(devtools(creator)))

// subscribeWithSelector: 提供选择性订阅
// immer: 允许直接修改状态
// devtools: 提供开发者工具支持
```

#### 3. **Redux 兼容性**
```typescript
// 支持传统的 Redux 模式
const store = createReduxStore(reducer, initialState);

// 可以使用标准的 Redux 工具
store.dispatch(action);
store.getState();
store.subscribe(listener);
```

#### 4. **性能优化**
```typescript
// 使用 subscribeWithSelector 进行精确订阅
const store = useStore.getState();

store.subscribe(
  (state) => state.todos, // 只订阅 todos 变化
  (todos) => {
    console.log('Todos updated:', todos);
  }
);
```

## 总结

这个高级封装方案的优势：

1. **类型安全**：完整的 TypeScript 中间件类型支持
2. **性能优化**：中间件按最优顺序组合
3. **Redux 兼容**：支持传统的 reducer 模式
4. **开发体验**：内置 DevTools 和 Immer 支持
5. **灵活性**：支持持久化和非持久化两种模式
6. **代码简洁**：相比之前的方案更加直接和高效

这种封装方式特别适合需要 Redux 兼容性的项目，同时保持了 Zustand 的简洁性。