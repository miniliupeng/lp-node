# 02-buffer-and-binary: 二进制数据与 Buffer 内存切片原理

JavaScript 最初为浏览器设计，只能处理字符串。但在服务端，网络通信（TCP）、文件读写、图像处理面对的全都是**二进制原始字节（0 与 1）**，这就是 Buffer 诞生的原因。

---

## 💡 核心原理三段式

### 1. 是什么？
- **`Buffer`**：Node.js 原生全局提供的类，代表在 V8 虚拟机堆外直接向操作系统申请的**固定大小的原始连续内存块**。
- **内存分配双轨制**：
  - `Buffer.alloc(size)`：安全清零分配（会将内存每个字节初始化为 `0`）。
  - `Buffer.allocUnsafe(size)`：快速裸分配（直接向系统申请内存，**不进行清零操作**，速度极快但可能包含旧的敏感内存残留）。

### 2. 为什么需要搞透它？
- **安全红线 (Information Leak)**：如果用 `allocUnsafe` 申请了内存后没有完全覆写，就直接通过网络发送给客户端，可能会将之前其他用户留存在物理内存里的密码、Token 等敏感数据泄露出去！
- **切片内存共享陷阱 (Memory Sharing Trap)**：`buf.subarray()` 或旧版 `buf.slice()` **绝不会**在内存中开辟新空间，它只是创建了一个指向原 Buffer 同一物理内存段的“新视图（View）”。修改切片会直接修改原 Buffer；同时，如果原 Buffer 有 100MB，你只保留了 1KB 的切片引用，**整个 100MB 的大 Buffer 就永远无法被垃圾回收（GC）**，引发隐蔽的内存泄漏！

### 3. 日常工作中怎么用？
- 二进制编解码（如加密签名转 `hex`、图片转 `base64`）；
- 如果需要真正独立的切片，使用 `Buffer.from(slice)` 进行物理深拷贝。

---

## 🔬 核心代码切片

```typescript
const buf = Buffer.from("NodeJS");

// 切片陷阱：共享底层连续内存
const sub = buf.subarray(0, 4); // "Node"
sub[0] = 67; // 将 'N' 篡改为 'C' (ASCII 67)

console.log(buf.toString()); // 原 Buffer 变成了 "CodeJS"！
```

---

## 🖥️ 控制台预期输出快照

```text
=== Buffer 二进制与内存模型实战 ===
1. Buffer 分配与编码互转:
   - 原始字符串: "Hello Node"
   - Hex 十六进制: 48656c6c6f204e6f6465
   - Base64 编码: SGVsbG8gTm9kZQ==
2. Buffer.alloc vs allocUnsafe 内存安全性:
   - alloc(8) 默认全清零安全: <Buffer 00 00 00 00 00 00 00 00>
3. Buffer 切片 (subarray) 内存共享与防泄漏陷阱:
   - 原 Buffer 内容: "Hello"
   - 篡改切片 sub[0] 为 'J' 后...
   - ⚠️ 原 Buffer 物理内存被同步改变: "Jello" (证明底层共享同一内存)
   - 解决方案: 必须使用 Buffer.from(sub) 执行物理内存深拷贝隔离
==================================
```

---

## 🏃 运行方式

```bash
pnpm exec tsx 03-fs-buffer-and-streams/02-buffer-and-binary/main.ts
```
