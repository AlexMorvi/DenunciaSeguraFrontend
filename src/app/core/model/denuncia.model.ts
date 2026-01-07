import { DenunciaCitizenViewResponse, DenunciaStaffViewResponse } from "@/core/api/denuncias/models";

export type DenunciaView = DenunciaCitizenViewResponse | DenunciaStaffViewResponse;

export function isStaffDenuncia(denuncia: DenunciaView): denuncia is DenunciaStaffViewResponse {
    return (denuncia as DenunciaStaffViewResponse).operadorId !== undefined;
}
