/**
 * 01-primitive-and-reference
 * 演示原始类型的按值传递、引用传递副作用及原生 structuredClone 深度隔离
 */

interface Profile {
  name: string;
  metadata: {
    role: string;
    permissions: string[];
  };
}

// 1. 验证原始值传递 (Pass-by-Value)
function incrementValue(val: number): number {
  let innerVal = val;
  innerVal += 10;
  return innerVal;
}

// 2. 演示浅拷贝与深拷贝差异
function run(): void {
  console.log('=== 原始类型 vs 引用模型演示 ===');

  // 1. 原始值按值传递
  const baseNumber = 42;
  const returnedNumber = incrementValue(baseNumber);
  console.log(
    `1. 原始值按值传递: 函数返回值为 ${returnedNumber}，而外部原值 baseNumber 依然为 ${baseNumber} (无副作用)`
  );

  // 2. 引用对象与浅拷贝陷阱
  const originalProfile: Profile = {
    name: 'Alice',
    metadata: { role: 'admin', permissions: ['read', 'write'] },
  };

  // 浅拷贝仅复制最外层属性
  const shallowCopy: Profile = { ...originalProfile };
  shallowCopy.name = 'Bob'; // 最外层独立
  shallowCopy.metadata.role = 'superadmin'; // 嵌套引用被共享篡改！

  console.log('2. 浅拷贝陷阱:');
  console.log(`   - 浅拷贝修改最外层 name -> 原对象 name: "${originalProfile.name}" (独立)`);
  console.log(
    `   - 浅拷贝修改嵌套 metadata.role -> 原对象 role: "${originalProfile.metadata.role}" (被污染!)`
  );

  // 3. 现代原生 structuredClone 深度隔离
  const deepIsolated: Profile = structuredClone(originalProfile);
  deepIsolated.metadata.role = 'guest';
  deepIsolated.metadata.permissions.push('execute');

  console.log('3. 原生 structuredClone 深度隔离验证:');
  console.log(`   - 深拷贝修改 metadata.role: "${deepIsolated.metadata.role}"`);
  console.log(`   - 原对象 metadata.role 保持安全: "${originalProfile.metadata.role}"`);
  console.log(
    `   - 原对象权限列表长度: ${originalProfile.metadata.permissions.length} (深拷贝为 ${deepIsolated.metadata.permissions.length})`
  );
  console.log('================================');
}

run();
