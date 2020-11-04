import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { DashboardPage } from './pages/DashboardPage'
import { AuthPage } from './pages/AuthPage'
import { StatisticPage } from './pages/StatisticPage'
import { SettingsPage } from './pages/SettingsPage'
import { EditPage } from './pages/EditPage'
import { OfferPage } from './pages/OfferPage'
import { InfoPage } from './pages/InfoPage'

export const useRouter = (isAuthenticated: boolean) => {
  if (isAuthenticated) {
    return (
      <Switch>
        <Route path="/dashboard" exact component={DashboardPage} />
        <Route path="/group/:id" exact component={EditPage} />
        <Route path="/statistic" exact component={StatisticPage} />
        <Route path="/offers" exact component={OfferPage} />
        <Route path="/settings" exact component={SettingsPage} />
        <Route path="/information" exact component={InfoPage} />
        <Redirect to="/dashboard" />
      </Switch>
    )
  }
  return (
    <Switch>
      <Route path="/auth" exact component={AuthPage} />
      <Redirect to="/auth" />
    </Switch>
  )
}
