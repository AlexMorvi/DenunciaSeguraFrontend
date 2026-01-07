// import { Injectable } from '@angular/core';
// import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
// import { DenunciaFacade } from '@/data/services/denuncia.facade';

// @Injectable({ providedIn: 'root' })
// export class DenunciasResolver implements Resolve<boolean> {
//     constructor(private denunciaService: DenunciaFacade) { }

//     async resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
//         try {
//             await this.denunciaService.loadAll();
//             return true;
//         } catch (err) {
//             return true; // allow activation even on error; component can show error state
//         }
//     }
// }
