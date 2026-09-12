# 阶段 03: 文件系统、Buffer 与流式数据处理

在服务端开发中，我们不可避免要处理文件上传、日志落地、音视频转码和海量报表导出。如果处理不当，几十兆的文件就足以让 Node.js 进程内存被打爆（OOM）。本阶段我们将掌握 Node.js 处理二进制与海量数据的三大杀手锏：**fs/promises、Buffer 与 Stream 背压**。

---

## ☕ 生活化心智：大运河与水管工程

1. **fs/promises (现代文件系统)**：
   - 就像现代化智能快递柜。全面告别回调地狱（Callback Hell）和同步阻塞版（`readFileSync`，会导致整个服务器卡死），用 Promise 优雅操作文件读写、目录递归与文件原子重命名。
2. **Buffer (二进制内存块)**：
   - 就像**固定容量的储物箱**。JavaScript 字符串无法直接表达底层的原始字节（0 与 1），Buffer 是 V8 堆外直接向 C++ 申请的原始物理内存，专门存放网络数据包或图片字节。
   - **切片陷阱**：用 `subarray()` 切割 Buffer 并不是复制了一份新数据，而是给了你一块**指向同一块内存的窥视镜**，修改切片会直接修改原 Buffer！
3. **Stream 与背压 (Backpressure)**：
   - 就像**给水管安装带浮阀的水箱**。上游供水极快（100MB/s 读文件），下游水龙头出水极慢（1MB/s 写磁盘）。如果没有背压，水箱瞬间溢出（内存 OOM）；有了背压机制，下游水龙头一旦被塞满，就会拉动拉绳通知上游“暂停供水（pause）”，等消化完再通知“继续供水（drain）”。
4. **Web Streams 与 Node.js 原生流互通**：
   - 就像**统一接口的国际通用插头**。Node 历史悠久的 Classic Streams 与现代浏览器/Fetch 规范的 `ReadableStream` 终于可以无缝转换对接。

---

## 🗺️ 阶段专题导航

| 专题目录 | 核心原语 | 关键掌握目标 |
| :--- | :--- | :--- |
| **[01-fs-and-path-basics](./01-fs-and-path-basics)** | 现代文件与路径操作 | 掌握 `node:fs/promises`、跨平台 `path.join/resolve` 与原子写入/临时文件替换 |
| **[02-buffer-and-binary](./02-buffer-and-binary)** | 二进制数据与 Buffer 切片 | 掌握 `Buffer.alloc` vs `allocUnsafe`、内存切片共享陷阱与编码转换 |
| **[03-streams-and-backpressure](./03-streams-and-backpressure)** | 流式传输与背压控制 | 深入剖析 `pipeline`、`highWaterMark` 水位线与 `drain` 事件防止内存 OOM |
| **[04-web-streams-interop](./04-web-streams-interop)** | 现代 Web Streams 互通 | 掌握 Web 标准 `TransformStream` 与 Node 原生流无缝桥接 (`fromWeb`/`toWeb`) |

---

## 🚀 统一运行指令

```bash
make run-03
```
