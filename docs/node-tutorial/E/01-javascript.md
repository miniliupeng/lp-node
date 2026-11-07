# E01 JavaScript 语言

示例：[A02](../../../examples/node-tutorial/A/02-values.mjs)、[A03](../../../examples/node-tutorial/A/03-functions.mjs)、[A04](../../../examples/node-tutorial/A/04-json.mjs)。

### Q1. `typeof null` 是什么？怎样判断 null？

- 难度：初级
- 考察点：历史行为与严格判断
- 参考答案：`typeof null` 是 `"object"`。判断用 `value === null`。`== null` 会同时接受 `undefined`，只有在合同写明“两者等价”时才用。
- 易错点：用 `typeof x === 'object'` 当成“是普通对象”，数组和 `null` 都会进去。数组再用 `Array.isArray`。
- 追问：`typeof` 一个函数？`"function"`。

### Q2. `===` 和 `Object.is` 的差别？

- 难度：初级
- 考察点：NaN 与负零
- 参考答案：`===` 下 `NaN` 不等于 `NaN`，`+0` 等于 `-0`。`Object.is` 下 `NaN` 等于 `NaN`，`+0` 不等于 `-0`。`assert.equal` 走 `Object.is`。示例用 `Number('-0')` 和 `1 / negativeZero === -Infinity` 把负零固定下来。
- 易错点：把 `Object.is` 说成深度比较。它只比较两个值。
- 追问：`Set` 怎样对待 `NaN`？按 SameValueZero，`NaN` 只保留一个。

### Q3. 闭包是什么？有什么代价？

- 难度：初级
- 考察点：作用域与内存
- 参考答案：函数保留对定义位置绑定的引用。`makeCounter` 返回的函数每次让自己的 `n` 加一。两份计数器互不影响。代价是被引用的绑定不能回收。定时器或监听器如果抓住大对象，对象会跟定时器一样长寿。
- 易错点：说闭包一定造成泄漏。只有引用比预期活得更久才是问题。
- 追问：循环里 `var` 配定时器会怎样？`var` 只有一个绑定，回调都看到最后的值。用 `let` 每次迭代有自己的绑定。

### Q4. 严格模式下把方法拆出来调用，`this` 是什么？

- 难度：中级
- 考察点：调用方式
- 参考答案：ESM 是严格模式。`box.method()` 的 `this` 是 `box`。`const detached = box.method; detached()` 的 `this` 是 `undefined`，读 `this.n` 抛 `TypeError`。箭头函数使用外层的 `this`，不因调用方式改变。
- 易错点：说箭头函数的 `this` 是“定义时的外层对象”。外层如果是普通函数且当时 `this` 是 `undefined`，箭头函数也是 `undefined`。
- 追问：怎样固定接收者？`bind`，或继续用 `box.method()`。

### Q5. `structuredClone` 会保留类方法吗？

- 难度：中级
- 考察点：结构化克隆的边界
- 参考答案：不会。示例里的 `Box` 克隆后是普通对象 `{ n: 3 }`，原型是 `Object.prototype`，`double` 消失。`Date` 会保留成 `Date`。函数不能克隆。循环引用可以。
- 易错点：把它说成深拷贝一切。它有明确的可克隆类型列表。
- 追问：和 `JSON.parse(JSON.stringify(x))` 比？JSON 会丢掉函数、把 `Date` 变字符串、拒绝 `bigint` 和循环引用。

### Q6. `JSON.stringify` 怎样处理 `undefined`？

- 难度：中级
- 考察点：序列化规则
- 参考答案：对象字段里的 `undefined` 被省略。数组元素里的 `undefined` 变成 `null`。示例断言 `'{"b":1,"c":"ok","d":[1,null,3]}'`。`bigint` 抛 `TypeError`。`Date` 变成 ISO 字符串，解析后仍是字符串。
- 易错点：说 `undefined` 总会变成 `null`。
- 追问：怎样传超过 `MAX_SAFE_INTEGER` 的整数？用字符串或在双方约定的编码里用 `bigint`，不要用 JSON 数字。

### Q7. `JSON.parse('{"__proto__":{"admin":true}}')` 会提升权限吗？

- 难度：高级
- 考察点：原型污染的真实位置
- 参考答案：在 22.23.4 上不会。`__proto__` 是自有属性，`parsed.admin` 是 `undefined`，原型仍是 `Object.prototype`。污染发生在递归合并：代码看见这个键就去改了 `Object.prototype`。防御是合并时跳过 `__proto__`、`prototype`、`constructor`，或使用 `Object.create(null)` 当字典。
- 易错点：把所有 `__proto__` 字符串都说成已经污染。
- 追问：`Object.create(null)` 有什么使用差别？没有 `toString` 等继承方法，适合当纯字典，不适合当任意对象传入只接受普通对象的 API。

### Q8. `??` 和 `||` 的差别？

- 难度：初级
- 考察点：默认值
- 参考答案：`??` 只在左侧是 `null` 或 `undefined` 时取右侧。`0 ?? 1` 是 `0`。`||` 在左侧为假值时取右侧，`0 || 1` 是 `1`。端口、数量、空字符串这些合法值用 `??`。
- 易错点：用 `||` 给分页大小做默认值，把用户传入的 `0` 换成默认值。
- 追问：默认参数何时生效？实参是 `undefined` 时。传入 `null` 不会用默认参数。

### Q9. 可选链短路的结果是什么？

- 难度：初级
- 考察点：`?.`
- 参考答案：中间是 `null` 或 `undefined` 时，整段表达式的结果是 `undefined`，不再读取后面的属性。示例断言 `user?.profile?.title` 为 `undefined`。它不把结果变成 `null`。
- 易错点：说它能防止任意异常。右侧函数如果执行了，里面的异常仍会抛出。
- 追问：`a?.b()` 在 `a` 存在但 `b` 不是函数时？仍会抛 `TypeError`。
