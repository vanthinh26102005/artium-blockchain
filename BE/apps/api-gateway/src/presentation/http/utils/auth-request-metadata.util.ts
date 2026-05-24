import { AuthRequestMetadata } from '@app/common';
import { Request } from 'express';

const MAX_METADATA_LENGTH = 512;

const firstHeaderValue = (
  value: string | string[] | undefined,
): string | undefined => {
  if (Array.isArray(value)) return value[0];
  return value;
};

const sanitizeMetadataValue = (
  value: string | string[] | undefined,
  maxLength = MAX_METADATA_LENGTH,
): string | undefined => {
  const rawValue = firstHeaderValue(value)?.trim();
  if (!rawValue) return undefined;
  return rawValue.slice(0, maxLength);
};

export const buildAuthRequestMetadata = (
  request: Request,
): AuthRequestMetadata => {
  return {
    ipAddress:
      sanitizeMetadataValue(request.ips?.[0]) ||
      sanitizeMetadataValue(request.ip) ||
      sanitizeMetadataValue(request.socket.remoteAddress),
    userAgent: sanitizeMetadataValue(request.headers['user-agent']),
    deviceId: sanitizeMetadataValue(request.headers['x-device-id'], 128),
  };
};
