import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, from } from 'rxjs';

import { CiudadanoService as DenunciasApiService } from '@/app/core/api/denuncias/services';
import { DenunciaCitizenViewResponse } from '@/app/core/api/denuncias/models';

@Injectable({
    providedIn: 'root'
})
export class DenunciaService {
    private api = inject(DenunciasApiService);

    public denuncias = toSignal(
        from(this.api.denunciasMeGet()).pipe(
            catchError(error => {
                console.error('Error cargando denuncias:', error);
                return of([]);
            })
        ),
        { initialValue: [] as DenunciaCitizenViewResponse[] }
    );

    createDenuncia(data: DenunciaCitizenViewResponse) {
        // Aquí llamarías a this.api.createDenuncia(data)...
    }
}
