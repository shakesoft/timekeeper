import { Injector, Pipe, PipeTransform, inject } from '@angular/core';
import { FeatureCheckerService } from 'abp-ng2-module';

@Pipe({ name: 'checkFeature' })
export class FeatureCheckerPipe implements PipeTransform {
    featureCheckerService: FeatureCheckerService;

    constructor(...args: unknown[]);

    constructor() {
        const injector = inject(Injector);

        this.featureCheckerService = injector.get(FeatureCheckerService);
    }

    transform(feature: string): boolean {
        return this.featureCheckerService.isEnabled(feature);
    }
}
