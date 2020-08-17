import React from 'react'
import {useRouter} from "./routes"
import {useAuth} from "./hooks/auth.hook"
import {AuthContext} from "./context/AuthContext"
import {Loader} from "./components/Loader"
import {Layout} from "./components/Layout";
import {GroupState} from "./context/GroupState";
import { StatisticState } from './context/StatisticState'


const App: React.FC = () => {
    const {login, logout, ready, userId} = useAuth()
    let isAuthenticated: boolean = !!userId
    const routes = useRouter(isAuthenticated)


    if (!ready) {
        return <Loader/>
    }

    if (!isAuthenticated) {
        return (
            <AuthContext.Provider value={{userId, isAuthenticated, login, logout}}>
                {routes}
            </AuthContext.Provider>
        )
    }

    return (
        <AuthContext.Provider value={{userId, isAuthenticated, login, logout}}>
            <GroupState>
                <StatisticState>
                <Layout>
                    {routes}
                </Layout>
                </StatisticState>
            </GroupState>
        </AuthContext.Provider>
    )
}

export default App
