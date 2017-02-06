import React from 'react';
import {Route, IndexRoute} from 'react-router';

import AppHandler from 'components/AppHandler';
import ErrorHandler from 'components/ErrorHandler';
import ContentsPage from 'components/ContentsPage';
import LineCanvasExample from 'examples/LineCanvasExample';
import ColumnCanvasExample from 'examples/ColumnCanvasExample';
import ScatterCanvasExample from 'examples/ScatterCanvasExample';
import AxisExample from 'examples/AxisExample';
import Plane2dExample from 'examples/Plane2dExample';

const routes = <Route component={AppHandler} path="/">
    <IndexRoute component={ContentsPage} />

    <Route path="planes">
        <Route path="plane2d" component={Plane2dExample}/>
    </Route>

    <Route path="canvas">
        <Route path="LineCanvas" component={LineCanvasExample}/>
        <Route path="ColumnCanvas" component={ColumnCanvasExample}/>
        <Route path="ScatterCanvas" component={ScatterCanvasExample}/>
        <Route path="Axis" component={AxisExample}/>
    </Route>



    <Route path="*" component={ErrorHandler}/>
</Route>;

export default routes;
