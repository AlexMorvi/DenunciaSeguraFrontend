export class DenunciaDetailsComponent {
    //TODO: No utilizar any, sino el tipo de openapi correcto
    denuncia = input.required<any>();
    // denuncia = input.required<DenunciaStaffViewResponse>();
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            // TODO: Loguear correctamente esto
            console.warn('[Security] Coordenadas inválidas detectadas', d);
            return null;
        }
