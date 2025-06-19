export interface UserProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  role: UserRole;
  phone?: string;
  avatar?: string;
  isBlocked: boolean;
  blockedAt?: Date;
  blockedBy?: string;
  blockReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
}

export class User {
  private constructor(private readonly props: UserProps) {}

  public static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): User {
    const now = new Date();
    return new User({
      ...props,
      id: '', // Will be set by the repository
      createdAt: now,
      updatedAt: now,
    });
  }

  public static fromPersistence(props: UserProps): User {
    return new User(props);
  }

  // Getters
  get id(): string {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get firstName(): string {
    return this.props.firstName;
  }

  get lastName(): string {
    return this.props.lastName;
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`;
  }

  get password(): string {
    return this.props.password;
  }

  get role(): UserRole {
    return this.props.role;
  }

  get phone(): string | undefined {
    return this.props.phone;
  }

  get avatar(): string | undefined {
    return this.props.avatar;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get isBlocked(): boolean {
    return this.props.isBlocked;
  }

  get blockedAt(): Date | undefined {
    return this.props.blockedAt;
  }

  get blockedBy(): string | undefined {
    return this.props.blockedBy;
  }

  get blockReason(): string | undefined {
    return this.props.blockReason;
  }

  // Business methods
  public updateProfile(firstName: string, lastName: string, phone?: string): void {
    this.props.firstName = firstName;
    this.props.lastName = lastName;
    this.props.phone = phone;
    this.props.updatedAt = new Date();
  }

  public updatePassword(hashedPassword: string): void {
    this.props.password = hashedPassword;
    this.props.updatedAt = new Date();
  }

  public updateAvatar(avatarUrl: string): void {
    this.props.avatar = avatarUrl;
    this.props.updatedAt = new Date();
  }

  public isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN;
  }

  public isStaff(): boolean {
    return this.props.role === UserRole.STAFF || this.props.role === UserRole.ADMIN;
  }

  public blockUser(blockedBy: string, reason?: string): void {
    this.props.isBlocked = true;
    this.props.blockedAt = new Date();
    this.props.blockedBy = blockedBy;
    this.props.blockReason = reason;
    this.props.updatedAt = new Date();
  }

  public unblockUser(): void {
    this.props.isBlocked = false;
    this.props.blockedAt = undefined;
    this.props.blockedBy = undefined;
    this.props.blockReason = undefined;
    this.props.updatedAt = new Date();
  }

  public toPlainObject(): UserProps {
    return { ...this.props };
  }
} 