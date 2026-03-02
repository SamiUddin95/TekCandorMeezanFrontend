import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JwtDecoderService {

  constructor() { }

  // Decode JWT token without using external libraries
  decodeToken(token: string): any {
    try {
      // JWT tokens have 3 parts separated by dots
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid JWT token structure');
      }

      // The payload is the second part
      const payload = parts[1];
      
      // Base64 decode the payload
      const decodedPayload = atob(this.fixBase64Padding(payload));
      
      // Parse the JSON
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  // Fix base64 padding issues
  private fixBase64Padding(base64: string): string {
    // Replace URL-safe characters
    base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    while (base64.length % 4) {
      base64 += '=';
    }
    
    return base64;
  }

  // Extract specific claims from token
  getTokenClaims(token: string): {
    userId?: number;
    name?: string;
    loginName?: string;
    permissions?: string[];
    role?: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
  } {
    const decoded = this.decodeToken(token);
    
    if (!decoded) {
      return {};
    }

    // Handle different permission field names
    let permissions: string[] = [];
    
    // Check for permissions (array)
    if (decoded.permissions && Array.isArray(decoded.permissions)) {
      permissions = decoded.permissions;
    }
    // Check for Permission (string) - split by comma if multiple
    else if (decoded.Permission && typeof decoded.Permission === 'string') {
      permissions = decoded.Permission.split(',').map((p: string) => p.trim());
    }
    // Check for Permission (array)
    else if (decoded.Permission && Array.isArray(decoded.Permission)) {
      permissions = decoded.Permission;
    }
    // Check for roles
    else if (decoded.roles && Array.isArray(decoded.roles)) {
      permissions = decoded.roles;
    }
    // Check for role (string)
    else if (decoded.role && typeof decoded.role === 'string') {
      permissions = [decoded.role];
    }

    return {
      userId: parseInt(decoded.sub) || decoded.userId || decoded.sub,
      name: decoded.name || decoded.fullName || decoded.unique_name || decoded.username,
      loginName: decoded.unique_name || decoded.loginName || decoded.email || decoded.username,
      permissions: permissions,
      role: decoded.role || decoded.userType || permissions[0],
      exp: decoded.exp,
      iat: decoded.iat,
      ...decoded // Include any other claims
    };
  }

  // Check if token is expired
  isTokenExpired(token: string): boolean {
    const claims = this.getTokenClaims(token);
    
    if (!claims.exp) {
      return false; // If no exp claim, assume not expired
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return claims.exp < currentTime;
  }

  // Get user permissions from token
  getUserPermissions(token: string): string[] {
    const claims = this.getTokenClaims(token);
    return claims.permissions || [];
  }

  // Check if user has specific permission
  hasPermission(token: string, permission: string): boolean {
    const permissions = this.getUserPermissions(token);
    return permissions.includes(permission);
  }

  // Check if user has any of the specified permissions
  hasAnyPermission(token: string, permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions(token);
    return permissions.some(permission => userPermissions.includes(permission));
  }

  // Check if user has all specified permissions
  hasAllPermissions(token: string, permissions: string[]): boolean {
    const userPermissions = this.getUserPermissions(token);
    return permissions.every(permission => userPermissions.includes(permission));
  }
}
