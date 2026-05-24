export interface AuthRequestMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
}

export interface AuthRpcPayload<T> {
  input: T;
  meta?: AuthRequestMetadata;
}
