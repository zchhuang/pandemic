import React, { Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import SpinnerPage from './SpinnerPage';

// route components
const HomePage = React.lazy(() => import('./HomePage/HomePage'));
const GameRouter = React.lazy(() => import('./GameRouter'));
const NotFoundPage = React.lazy(() => import('./NotFoundPage'));

export default function Router() {
  return (
    <BrowserRouter>
      <Suspense fallback={<SpinnerPage />}>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/game/:gameId" component={GameRouter} />
          <Route component={NotFoundPage} />
        </Switch>
      </Suspense>
    </BrowserRouter>
  );
}
