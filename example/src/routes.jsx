import React from 'react';
import {Route, IndexRoute} from 'react-router';

import AppHandler from 'components/AppHandler';
import ErrorHandler from 'components/ErrorHandler';
import ContentsPage from 'components/ContentsPage';

const routes = <Route component={AppHandler} path="/">
    <IndexRoute component={ContentsPage} />

    {/*<Route path="component">
        <Route path="Table" component={TableExample}/>
        <Route path="Button" component={ButtonExample}/>
        <Route path="Label" component={LabelExample}/>
    </Route>*/}

    <Route path="*" component={ErrorHandler}/>
</Route>;

export default routes;
