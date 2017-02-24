import React from 'react';
import {Route, IndexRoute} from 'react-router';

import AppHandler from 'components/AppHandler';
import ErrorHandler from 'components/ErrorHandler';
import ContentsPage from 'components/ContentsPage';
import LineExample from 'examples/LineExample';
import GraphExample from 'examples/GraphExample';
import AreaExample from 'examples/AreaExample';
import ColumnExample from 'examples/ColumnExample';
import BarExample from 'examples/BarExample';
import ScatterExample from 'examples/ScatterExample';
import AxisExample from 'examples/AxisExample';
import Plane2dExample from 'examples/Plane2dExample';

const routes = <Route component={AppHandler} path="/">
    <IndexRoute component={ContentsPage} />

    <Route path="planes">
        <Route path="plane2d" component={Plane2dExample}/>
    </Route>

    <Route path="canvas">
        <Route path="Line" component={LineExample}/>
        <Route path="Graph" component={GraphExample}/>
        <Route path="Area" component={AreaExample}/>
        <Route path="Bar" component={BarExample}/>
        <Route path="Column" component={ColumnExample}/>
        <Route path="Scatter" component={ScatterExample}/>
        <Route path="Axis" component={AxisExample}/>
    </Route>



    <Route path="*" component={ErrorHandler}/>
</Route>;

export default routes;
