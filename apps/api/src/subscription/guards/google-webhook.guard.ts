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
 * Guard to verify Google Play Real-time Developer Notification signatures
 * 
 * Google sends notifications via Cloud Pub/Sub with a signature in the header.
 * This guard verifies the signature to ensure the request is authentic.
 * 
 * Documentation: https://cloud.google.com/pubsub/docs/push#authentication_and_authorization
 */
@Injectable()
export class GoogleWebhookGuard implements CanActivate {
    private readonly logger = new Logger(GoogleWebhookGuard.name);
    private publicKeysCache: { [kid: string]: string } = {};
    private publicKeysCacheExpiry: number = 0;

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        // In development, allow webhooks without verification
        if (process.env.NODE_ENV === 'development' && process.env.SKIP_WEBHOOK_VERIFICATION === 'true') {
            this.logger.warn('⚠️  Webhook signature verification SKIPPED (development mode)');
            return true;
        }

        try {
            // Google Pub/Sub sends the message in a specific format
            const message = request.body?.message;

            if (!message) {
                throw new UnauthorizedException('Missing message in Google webhook');
            }

            // Verify the Pub/Sub JWT token if present
            const authHeader = request.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                // If no auth header, check if we have a push endpoint token
                const pushToken = request.query?.token;

                if (!pushToken || pushToken !== process.env.GOOGLE_PUBSUB_PUSH_TOKEN) {
                    throw new UnauthorizedException('Invalid or missing Google webhook token');
                }
            } else {
                // Verify JWT with Google's public keys
                const token = authHeader.substring(7);
                await this.verifyGoogleJWT(token);
            }

            // Decode the base64 message data
            if (message.data) {
                const decodedData = Buffer.from(message.data, 'base64').toString();
                request.googleWebhookData = JSON.parse(decodedData);
            }

            this.logger.log('✅ Google webhook signature verified');
            return true;
        } catch (error) {
            this.logger.error('❌ Google webhook signature verification failed:', error.message);
            throw new UnauthorizedException('Invalid Google webhook signature');
        }
    }

    /**
     * Verify Google JWT signature
     */
    private async verifyGoogleJWT(jwt: string): Promise<void> {
        const parts = jwt.split('.');
        if (parts.length !== 3) {
            throw new UnauthorizedException('Invalid JWT format in Google webhook');
        }

        // Decode header and payload
        const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString());
        const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());

        // Get Google's public keys
        const publicKeys = await this.getGooglePublicKeys();

        // Find the key matching the kid in the JWT header
        const publicKey = publicKeys[header.kid];
        if (!publicKey) {
            throw new UnauthorizedException('Public key not found for kid: ' + header.kid);
        }

        // Extract signature and data
        const signature = Buffer.from(parts[2], 'base64url');
        const data = `${parts[0]}.${parts[1]}`;

        // Verify signature
        const verifier = crypto.createVerify('RSA-SHA256');
        verifier.update(data);
        const isValid = verifier.verify(publicKey, signature);

        if (!isValid) {
            throw new UnauthorizedException('Invalid JWT signature');
        }

        // Validate claims
        this.validateGoogleClaims(payload);
    }

    /**
     * Fetch Google's public keys (with caching)
     */
    private async getGooglePublicKeys(): Promise<{ [kid: string]: string }> {
        const now = Date.now();

        // Return cached keys if still valid (cache for 1 hour)
        if (Object.keys(this.publicKeysCache).length > 0 && now < this.publicKeysCacheExpiry) {
            return this.publicKeysCache;
        }

        // Fetch new keys
        return new Promise((resolve, reject) => {
            https.get('https://www.googleapis.com/oauth2/v3/certs', (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const parsed = JSON.parse(data);
                        const keys: { [kid: string]: string } = {};

                        // Convert JWKs to PEM format
                        if (parsed.keys) {
                            for (const key of parsed.keys) {
                                keys[key.kid] = this.jwkToPem(key);
                            }
                        }

                        this.publicKeysCache = keys;
                        this.publicKeysCacheExpiry = now + 3600000; // 1 hour
                        resolve(this.publicKeysCache);
                    } catch (error) {
                        reject(new Error('Failed to parse Google public keys'));
                    }
                });
            }).on('error', (error) => {
                reject(new Error('Failed to fetch Google public keys: ' + error.message));
            });
        });
    }

    /**
     * Convert JWK to PEM format
     */
    private jwkToPem(jwk: any): string {
        // This is a simplified version - in production use a library like 'jwk-to-pem'
        const modulus = Buffer.from(jwk.n, 'base64url');
        const exponent = Buffer.from(jwk.e, 'base64url');

        // For RSA keys, we need to construct the proper ASN.1 structure
        // This is simplified - consider using 'jwk-to-pem' library for production
        const modulusHex = modulus.toString('hex');
        const exponentHex = exponent.toString('hex');

        return `-----BEGIN PUBLIC KEY-----\n${Buffer.from(modulusHex + exponentHex, 'hex').toString('base64')}\n-----END PUBLIC KEY-----`;
    }

    /**
     * Validate Google JWT claims
     */
    private validateGoogleClaims(payload: any): void {
        // Validate issuer
        const validIssuers = ['accounts.google.com', 'https://accounts.google.com'];
        if (!validIssuers.includes(payload.iss)) {
            throw new UnauthorizedException('Invalid issuer');
        }

        // Validate audience (should match your Google Cloud project)
        if (process.env.GOOGLE_CLOUD_PROJECT_ID && payload.aud !== process.env.GOOGLE_CLOUD_PROJECT_ID) {
            throw new UnauthorizedException('Invalid audience');
        }

        // Validate expiration
        const now = Math.floor(Date.now() / 1000);
        if (payload.exp && payload.exp < now) {
            throw new UnauthorizedException('JWT expired');
        }

        // Validate issued at
        if (payload.iat && payload.iat > now + 300) { // Allow 5 minutes clock skew
            throw new UnauthorizedException('JWT issued in the future');
        }
    }
}
