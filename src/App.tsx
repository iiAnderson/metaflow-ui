import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { QueryParamProvider } from 'use-query-params';
import { ThemeProvider } from 'styled-components';
import { useTranslation } from 'react-i18next';

import Root from './pages/Root';

import GlobalStyle from './GlobalStyle';
import './theme/font/roboto.css';
import theme from './theme';

import { Page } from './components/Structure';
import AppBar from './components/AppBar';
import { NotificationsProvider, Notifications } from './components/Notifications';
import ErrorBoundary from './components/GeneralErrorBoundary';
import { TimezoneProvider } from './components/TimezoneProvider';
import { LoggingProvider } from './hooks/useLogger';
import FeatureFlagLoader from './components/FeatureLoader';
import Logger from './components/Logger';

import { fetchServiceVersion } from './utils/VERSION';
import { fetchFeaturesConfig } from './utils/FEATURE';
import Announcements from './components/Announcement';
import { PluginsProvider } from './components/Plugins/PluginManager';
import HeadlessPluginSlot from './components/Plugins/HeadlessPluginSlot';
import PluginRegisterSystem from './components/Plugins/PluginRegisterSystem';
import { ExternalButtonLink } from './components/Button';

// Modified by Aero Technology under the Apache 2.0 License

import Amplify from 'aws-amplify';
import { CookieStorage } from 'amazon-cognito-identity-js';
import awsmobile from './aws-exports';
import Auth from '@aws-amplify/auth';

// Aero Technology: Added cookie based authentication using Amplify
const domain = 'aeroplatform.co.uk';

console.log(domain);

Amplify.configure({
  ...awsmobile,
  Analytics: {
    disabled: true,
  },
  storage: new CookieStorage({ secure: true, domain: domain }),
});

const App: React.FC = () => {
  const { t } = useTranslation();
  // Features list must be fetched before we render application so we don't render things that
  // are disabled by backend service.
  const [flagsReceived, setFlagsReceived] = useState(false);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    // Get info about backend versions.
    fetchServiceVersion();
    // Get info about features that are enabled by server
    fetchFeaturesConfig(() => setFlagsReceived(true));
  }, []);

  Auth.currentSession()
    .then((_) => {
      console.log('Logged in!');
      setLoggedIn(true);
      return Promise.resolve();
    })
    .catch((e) => {
      console.log('Failed');
      console.log(e);

      setLoggedIn(false);
    });

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary message={t('error.application-error')}>
        <NotificationsProvider>
          <TimezoneProvider>
            <PluginsProvider>
              <LoggingProvider>
                <GlobalStyle />
                <Router>
                  <QueryParamProvider ReactRouterRoute={Route}>
                    {flagsReceived ? (
                      <>
                        <Notifications />
                        <Announcements />
                        <AppBar />
                        <Page>
                          {isLoggedIn ? (
                            <>
                              <Root />
                            </>
                          ) : (
                            <>
                              <ExternalButtonLink
                                to={'http://site.aeroplatform.co.uk/login'}
                                tabIndex={0}
                                data-testid={'home-button'}
                                variant="primaryText"
                              >
                                Login
                              </ExternalButtonLink>
                            </>
                          )}
                        </Page>
                        <Logger />
                      </>
                    ) : (
                      <FeatureFlagLoader />
                    )}
                  </QueryParamProvider>
                </Router>
              </LoggingProvider>
              <PluginRegisterSystem />
              <HeadlessPluginSlot />
            </PluginsProvider>
          </TimezoneProvider>
        </NotificationsProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
