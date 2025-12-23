import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { DenunciaFacade } from '@/app/data/services/denuncia.facade';

@Injectable({ providedIn: 'root' })
export class DenunciasResolver implements Resolve<boolean> {
    constructor(private denunciaService: DenunciaFacade) { }

    async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        try {
            console.debug('[DenunciasResolver] resolving -> calling denunciaService.refresh()');
            await this.denunciaService.refresh();
            console.debug('[DenunciasResolver] resolved -> denuncias length =', this.denunciaService.denuncias().length);
            return true;
        } catch (err) {
            console.error('[DenunciasResolver] error during refresh', err);
            return true; // allow activation even on error; component can show error state
        }
    }
}
