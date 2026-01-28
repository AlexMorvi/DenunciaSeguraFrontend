export const environment = {
    production: false,
    apiUrl: 'http://localhost:8081',
    // Apuntar siempre al gateway para OIDC en local
    authIssuer: 'http://localhost:8081/auth',
    requireHttps: false,
    showDebugInformation: true
};
