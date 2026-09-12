# 03-utility-types-practical: 高频实用工具类型实战

在企业级 CRUD 和微服务开发中，数据对象在不同生命周期（创建、更新、返回前端）具有不同字段形态。熟练运用 TypeScript 内置工具类型，可以避免成倍地重复手写接口。

---

## 💡 核心原理三段式

### 1. 是什么？
- **工具类型 (Utility Types)**：TypeScript 内置的泛型类型函数，通过接收已有类型并对其属性进行映射、过滤或重构，派生出全新的类型。
- **高频核心原语**：
  - `Partial<T>`：将所有属性变为可选（常用于 PATCH 更新）；
  - `Pick<T, K>`：仅挑选指定字段；
  - `Omit<T, K>`：剔除敏感或非必要字段（常用于剔除 password、secret）；
  - `Record<K, V>`：构建标准键值映射字典；
  - `ReturnType<F>`：提取函数返回值的类型。

### 2. 为什么需要它？
- **保持“单一片真源”（Single Source of Truth）**：只需要定义一个基准 `User` 实体接口，创建接口 DTO（`Omit<User, 'id'>`）、更新接口 DTO（`Partial<Omit<User, 'id'>>`）均从基类派生，基类一改，所有衍生类型自动联动，杜绝字段不同步。

### 3. 日常工作中怎么用？
- 数据库 Entity -> 业务 DTO -> API 响应 VO 的类型层层派生。

---

## 🔬 核心代码切片

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

// 派生安全的前端响应对象 (剔除密码)
type PublicUser = Omit<User, "passwordHash">;

// 派生更新入参 (剔除 id 且全可选)
type UpdateUserDto = Partial<Omit<User, "id" | "passwordHash">>;
```

---

## 🖥️ 控制台预期输出快照

```text
=== 高频实用工具类型派生实战 ===
1. 完整用户实体 (Entity):
   - ID: u_101, Name: 工程师A, Email: dev@example.com (含加密哈希)
2. 派生公开 DTO (Omit 剔除敏感 passwordHash):
   - 安全展示: {"id":"u_101","name":"工程师A","email":"dev@example.com"}
3. 派生更新 DTO (Partial 仅更新部分字段):
   - 更新负载: {"name":"资深工程师A"}
4. 字典映射 (Record 映射角色权限表):
   - admin 权限数: 3, guest 权限数: 1
================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 01-typescript-essential-types/03-utility-types-practical/main.ts
```
