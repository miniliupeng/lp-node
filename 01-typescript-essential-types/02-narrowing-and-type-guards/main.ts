/**
 * 02-narrowing-and-type-guards
 * 演示类型收窄、自定义类型守卫 (Type Guard) 与可辨识联合穷尽性检查
 */

// 1. 自定义类型守卫：判断是否为标准 API 业务异常响应
interface ApiBusinessError {
  code: number;
  message: string;
}

function isApiBusinessError(error: unknown): error is ApiBusinessError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).code === 'number' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

// 2. 可辨识联合 (Discriminated Unions) 状态建模
type OrderEvent =
  | { type: 'PAID'; orderId: string; amount: number }
  | { type: 'REFUNDED'; orderId: string; reason: string }
  | { type: 'CANCELLED'; orderId: string };

function processOrderEvent(event: OrderEvent): string {
  switch (event.type) {
    case 'PAID':
      return `支付成功 [订单 ${event.orderId}]: 收到金额 ¥${event.amount.toFixed(2)}`;
    case 'REFUNDED':
      return `退款处理 [订单 ${event.orderId}]: 退款原因 "${event.reason}"`;
    case 'CANCELLED':
      return `订单已取消 [订单 ${event.orderId}]`;
    default: {
      // 编译期穷尽性检查 (Exhaustiveness Check): 如果漏处理分支，此处编译直接报错
      const _exhaustiveCheck: never = event;
      throw new Error(`未处理的事件类型: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}

function run(): void {
  console.log('=== 类型收窄与类型守卫实战 ===');

  // 1. 验证自定义类型守卫
  const unknownError: unknown = { code: 403, message: '权限不足，禁止访问' };
  if (isApiBusinessError(unknownError)) {
    // 经过守卫后，unknown 成功收窄为 ApiBusinessError
    console.log(`1. 守卫成功识别错误: [${unknownError.code}] ${unknownError.message}`);
  }

  // 2. 验证可辨识联合处理
  const events: OrderEvent[] = [
    { type: 'PAID', orderId: 'ORD-1001', amount: 299 },
    { type: 'REFUNDED', orderId: 'ORD-1002', reason: '商品缺货' },
    { type: 'CANCELLED', orderId: 'ORD-1003' },
  ];

  console.log('2. 可辨识联合事件处理流:');
  for (const ev of events) {
    console.log(`   - ${processOrderEvent(ev)}`);
  }

  console.log('===============================');
}

run();
