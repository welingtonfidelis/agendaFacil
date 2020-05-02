import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Main from './pages/Main';
import Login from './pages/Login';


export default function Routes() {
    const user = useSelector(state => state.data);

    function PrivateRoute() {
        if(user.token && user.token !== '') return Main
        else return Login
    }

    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" exact component={Login} />
                <Route path="/main" component={PrivateRoute()} />
            </Switch>
        </BrowserRouter>
    )
}