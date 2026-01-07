// // src/app/components/map-viewer/map-viewer.component.ts
// import { Component, Input, ElementRef, ViewChild, AfterViewInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
// import { isPlatformBrowser } from '@angular/common';
// import * as L from 'leaflet';

// @Component({
//     selector: 'app-map-viewer',
//     standalone: true,
//     template: `<div #mapContainer class="w-full h-48 rounded-lg border border-gray-300 shadow-sm z-0"></div>`
// })
// export class MapViewerComponent implements AfterViewInit, OnDestroy {
//     @Input({ required: true }) lat!: number;
//     @Input({ required: true }) lng!: number;

//     @ViewChild('mapContainer') mapContainer!: ElementRef;
//     private map: L.Map | undefined;

//     constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

//     ngAfterViewInit() {
//         // Seguridad: Solo inicializar si estamos en el navegador
//         if (isPlatformBrowser(this.platformId)) {
//             this.initMap();
//         }
//     }

//     private initMap(): void {
//         this.map = L.map(this.mapContainer.nativeElement, {
//             center: [this.lat, this.lng],
//             zoom: 15,
//             dragging: false,      // Solo lectura (como en tu original)
//             scrollWheelZoom: false,
//             zoomControl: true
//         });

//         L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
//             attribution: '© OpenStreetMap'
//         }).addTo(this.map);

//         L.marker([this.lat, this.lng]).addTo(this.map);
//     }

//     ngOnDestroy() {
//         this.map?.remove(); // Evitar fugas de memoria
//     }
// }
