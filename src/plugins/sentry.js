import Vue from 'vue'
import * as Sentry from '@sentry/browser';
import {Vue as VueIntegration} from '@sentry/integrations';

Sentry.init({
  dsn: 'https://3f2682e69f27445caa07cf104de56202@o145080.ingest.sentry.io/5259653',
  integrations: [new VueIntegration({Vue, attachProps: true})],
});

