/**
 * 03-utility-types-practical
 * 演示 Partial, Pick, Omit, Record 与 ReturnType 在企业级数据传输对象 (DTO) 中的应用
 */

// 1. 基准数据库实体 (Single Source of Truth)
interface UserEntity {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// 2. 利用工具类型派生业务 DTO
// 对外公开安全用户视图：剔除密码与哈希
type PublicUserDto = Omit<UserEntity, 'passwordHash'>;

// 更新用户入参：不可修改 id 与创建时间，其余字段均可选
type UpdateUserDto = Partial<Omit<UserEntity, 'id' | 'createdAt' | 'passwordHash'>>;

// 角色权限字典表：使用 Record 约束键值结构
type Role = 'admin' | 'editor' | 'guest';
type RolePermissionsMap = Record<Role, readonly string[]>;

const ROLE_PERMISSIONS: RolePermissionsMap = {
  admin: ['read', 'write', 'delete'],
  editor: ['read', 'write'],
  guest: ['read'],
};

// 3. 业务处理函数与 ReturnType 类型派生
function createPublicUser(entity: UserEntity): PublicUserDto {
  const { passwordHash: _, ...publicView } = entity;
  return publicView;
}

// 使用 ReturnType 自动反推函数返回类型
type DerivedPublicUser = ReturnType<typeof createPublicUser>;

function run(): void {
  console.log('=== 高频实用工具类型派生实战 ===');

  const rawUser: UserEntity = {
    id: 'usr_99824',
    name: 'Alex',
    email: 'alex@company.internal',
    passwordHash: 'sha256$8f92b...secret',
    createdAt: new Date(),
  };

  // 1. 验证 Omit 派生安全视图
  const publicUser: DerivedPublicUser = createPublicUser(rawUser);
  console.log('1. 安全公开用户视图 (Omit 密码):');
  console.log(`   - 姓名: ${publicUser.name}, 邮箱: ${publicUser.email}`);
  console.log(`   - 是否包含密码字段: ${'passwordHash' in publicUser ? '是' : '否'}`);

  // 2. 验证 Partial 增量更新 DTO
  const updatePayload: UpdateUserDto = { name: 'Alexander' }; // 仅更新名字，合法
  console.log('2. 增量更新入参 (Partial 派生):');
  console.log(`   - 目标更新载荷: ${JSON.stringify(updatePayload)}`);

  // 3. 验证 Record 字典
  console.log('3. 角色字典映射 (Record 派生):');
  console.log(`   - admin 权限数: ${ROLE_PERMISSIONS.admin.length}`);
  console.log(`   - guest 权限数: ${ROLE_PERMISSIONS.guest.length}`);
  console.log('================================');
}

run();
