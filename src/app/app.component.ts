import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgxSonnerToaster } from 'ngx-sonner';
import { inject } from '@vercel/analytics'; 
import { injectSpeedInsights } from '@vercel/speed-insights';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NgxSonnerToaster],
    template: `
    <router-outlet/>
    <ngx-sonner-toaster 
        position="top-right"
        theme="light"
        [closeButton]="true"
        [toastOptions]="{
        classes: {
            toast: '!bg-white !border !border-gray-200 !shadow-xl !rounded-lg !p-4 items-start gap-1',
            title: '!text-gray-900 !text-sm !font-semibold',
            description: '!text-gray-600 !text-xs !mt-1 leading-relaxed',
            actionButton: '!bg-gray-900 !text-white !text-xs !px-3 !py-2 !rounded-md hover:!bg-gray-800',
            cancelButton: '!bg-gray-100 !text-gray-700 !text-xs !px-3 !py-2 !rounded-md hover:!bg-gray-200',
        }
    }"/>
    `,
    styles: []
})

export class AppComponent implements OnInit {
    title = 'DenunciaSegura';

    ngOnInit() {
        inject();
        injectSpeedInsights();
    }
}
