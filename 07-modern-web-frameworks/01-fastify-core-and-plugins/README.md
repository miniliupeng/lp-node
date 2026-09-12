# 01-fastify-core-and-plugins: Fastify 极速入门与插件封装思想

在现代微服务与高吞吐量场景中，**Fastify** 已经成为 Node.js 官方推荐的首选高性能框架。

---

## 💡 核心原理三段式

### 1. 是什么？
- **Fastify**：一个专为极致速度与极低开销设计的 Web 框架，默认基于 JSON Schema 进行入参验证与极速出参序列化。
- **插件封装模型 (Plugin Encapsulation)**：在 Fastify 中，“一切皆是插件”。每个通过 `fastify.register()` 挂载的插件都会自动生成一个**独立的子作用域（Child Context）**。
- **作用域继承规则**：父作用域里装饰的属性（`decorate`）和钩子（`addHook`）会向下传递给子作用域；但子作用域内添加的装饰和钩子**绝对不会向上污染父级或其他兄弟插件**（除非显式使用 `fastify-plugin` 跨越隔离）。

### 2. 为什么它比 Express 快数倍？
- **JIT 模式 JSON 序列化 (fast-json-stringify)**：Express 的 `res.json()` 底层调用 `JSON.stringify()`，需要全量遍历动态推断对象字段；Fastify 依据预先定义的 JSON Schema 编译出一段高度内联、纯字符串拼接的专用 C++ 级别 JS 函数，序列化速度提升 2~3 倍！
- **基数树路由 (Radix Tree Router)**：使用 `find-my-way` 路由库，匹配速度比 Express 的线性正则遍历快一个数量级。

### 3. 日常工作中怎么用？
- 使用插件对业务模块进行垂直切分（如 `authPlugin`, `userPlugin`, `orderPlugin`），各模块生命周期互不干扰。

---

## 🔬 核心代码切片

```typescript
// 插件注册与局部作用域隔离
fastify.register(async (subApp) => {
  // 仅在当前子作用域生效的钩子
  subApp.addHook("onRequest", async (req) => {
    console.log("子路由专用拦截");
  });
  subApp.get("/v1/items", async () => ["item1", "item2"]);
});
```

---

## 🖥️ 控制台预期输出快照

```text
=== Fastify 核心思想与插件作用域实战 ===
1. 初始化核心轻量应用引擎 (模拟 Fastify 上下文树)
2. 注册全局通用插件 (注入全局数据库装饰器 decorate):
   ✔ 全局作用域已挂载: db: "ConnectedPool"
3. 挂载隔离子插件 (AuthPlugin 作用域):
   - 子作用域成功继承父级 db: "ConnectedPool"
   - 子作用域新增私有属性: tokenSecret: "private_key"
4. 验证封装隔离性 (Encapsulation Guard):
   ✔ 父级全局上下文保持纯净，未被子插件的 tokenSecret 污染
=======================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 07-modern-web-frameworks/01-fastify-core-and-plugins/main.ts
```
