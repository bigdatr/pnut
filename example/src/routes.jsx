import React from 'react';
import {Route, IndexRoute} from 'react-router';

import AppHandler from 'components/AppHandler';
import ErrorHandler from 'components/ErrorHandler';
import ContentsPage from 'components/ContentsPage';
import LineRenderableExample from 'examples/LineRenderableExample';
import ColumnRenderableExample from 'examples/ColumnRenderableExample';
import ScatterRenderableExample from 'examples/ScatterRenderableExample';
import AxisExample from 'examples/AxisExample';
import Plane2dExample from 'examples/Plane2dExample';

const routes = <Route component={AppHandler} path="/">
    <IndexRoute component={ContentsPage} />

    <Route path="planes">
        <Route path="plane2d" component={Plane2dExample}/>
    </Route>

    <Route path="canvas">
        <Route path="LineRenderable" component={LineRenderableExample}/>
        <Route path="ColumnRenderable" component={ColumnRenderableExample}/>
        <Route path="ScatterRenderable" component={ScatterRenderableExample}/>
        <Route path="Axis" component={AxisExample}/>
    </Route>



    <Route path="*" component={ErrorHandler}/>
</Route>;

export default routes;
