import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

export interface StatCard {
    label: string;
    value: number | string;
    subtext: string;
    subtextClass: string;
    icon: IconDefinition;
    iconBgClass: string;
    iconColorClass: string;
}
