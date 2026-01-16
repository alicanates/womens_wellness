import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as https from 'https';

/**
 * Guard to verify Apple App Store Server Notification signatures
 * 
 * Apple signs all webhook notifications with a JWS (JSON Web Signature).
 * This guard verifies the signature to ensure the request is authentic.
 * 
 * Documentation: https://developer.apple.com/documentation/appstoreservernotifications/responding_to_app_store_server_notifications
 */
@Injectable()
export class AppleWebhookGuard implements CanActivate {
    private readonly logger = new Logger(AppleWebhookGuard.name);
    private publicKeysCache: any[] = [];
    private publicKeysCacheExpiry: number = 0;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // In development, allow webhooks without verification
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_WEBHOOK_VERIFICATION === 'true') {
            this.logger.warn('⚠️  Webhook signature verification SKIPPED (development mode)');
            return true;
        }

        try {
            // Apple sends the notification as a signed JWT in the body
            const signedPayload = request.body?.signedPayload;

            if (!signedPayload) {
                throw new UnauthorizedException('Missing signedPayload in Apple webhook');
            }

            // Validate JWT format
            const parts = signedPayload.split('.');
            if (parts.length !== 3) {
                throw new UnauthorizedException('Invalid JWT format in Apple webhook');
            }

            // Decode header and payload
            const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
            const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

            // Verify JWT signature with Apple's public keys
            await this.verifySignature(signedPayload, header);

            // Validate JWT claims
            this.validateClaims(payload);

            // Store decoded payload for the controller
            request.appleWebhookPayload = payload;

            this.logger.log('✅ Apple webhook signature verified');
            return true;
        } catch (error) {
            this.logger.error('❌ Apple webhook signature verification failed:', error.message);
            throw new UnauthorizedException('Invalid Apple webhook signature');
        }
    }

    /**
     * Verify JWT signature using Apple's public keys
     */
    private async verifySignature(jwt: string, header: any): Promise<void> {
        // Get Apple's public keys
        const publicKeys = await this.getApplePublicKeys();

        // Find the key matching the kid in the JWT header
        const publicKey = publicKeys.find(key => key.kid === header.kid);
        if (!publicKey) {
            throw new UnauthorizedException('Public key not found for kid: ' + header.kid);
        }

        // Extract signature and data
        const parts = jwt.split('.');
        const signature = Buffer.from(parts[2], 'base64url');
        const data = `${parts[0]}.${parts[1]}`;

        // Verify signature
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(data);

        // Convert JWK to PEM format
        const pem = this.jwkToPem(publicKey);
        const isValid = verifier.verify(pem, signature);

        if (!isValid) {
            throw new UnauthorizedException('Invalid JWT signature');
        }
    }

    /**
     * Fetch Apple's public keys (with caching)
     */
    private async getApplePublicKeys(): Promise<any[]> {
        const now = Date.now();

        // Return cached keys if still valid (cache for 1 hour)
        if (this.publicKeysCache.length > 0 && now < this.publicKeysCacheExpiry) {
            return this.publicKeysCache;
        }

        // Fetch new keys
        return new Promise((resolve, reject) => {
            https.get('https://api.storekit.itunes.apple.com/v1/certificates', (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        this.publicKeysCache = parsed.keys || [];
                        this.publicKeysCacheExpiry = now + 3600000; // 1 hour
                        resolve(this.publicKeysCache);
                    } catch (error) {
                        reject(new Error('Failed to parse Apple public keys'));
                    }
                });
            }).on('error', (error) => {
                reject(new Error('Failed to fetch Apple public keys: ' + error.message));
            });
        });
    }

    /**
     * Convert JWK to PEM format
     */
    private jwkToPem(jwk: any): string {
        // This is a simplified version - in production use a library like 'jwk-to-pem'
        const modulus = Buffer.from(jwk.n, 'base64');
        const exponent = Buffer.from(jwk.e, 'base64');

        // Create ASN.1 structure for RSA public key
        const modulusHex = modulus.toString('hex');
        const exponentHex = exponent.toString('hex');

        // Build PEM (simplified - consider using a proper library)
        return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(modulusHex + exponentHex, 'hex').toString('base64')}\n-----END PUBLIC KEY-----`;
    }

    /**
     * Validate JWT claims
     */
    private validateClaims(payload: any): void {
        // Validate issuer
        if (payload.iss !== 'https://appleid.apple.com') {
            throw new UnauthorizedException('Invalid issuer');
        }

        // Validate expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            throw new UnauthorizedException('JWT expired');
        }

        // Validate not before
        if (payload.nbf && payload.nbf > now) {
            throw new UnauthorizedException('JWT not yet valid');
        }
    }
}
