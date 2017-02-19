    // getBoxes([x1,y1], [x2,y2]) {
    //     const pixelBox = {
    //         x1: x1 > x2 ? x2 : x1,
    //         y1: y1 > y2 ? y2 : y1,
    //         x2: x1 > x2 ? x1 : x2,
    //         y2: y1 > y2 ? y1 : y2
    //     };

    //     const dataBox = this.props.scaleGroups.reduce((result, groupName, index) => {
    //         const xScale = this.props.xScales[index];
    //         const yScale = this.props.yScales[index];
    //         const xScaleInvert = this.getScaleInvert(xScale);
    //         const yScaleInvert = this.getScaleInvert(yScale);

    //         result[groupName] = {
    //             x1: xScaleInvert(pixelBox.x1, 'lower'),
    //             y1: yScaleInvert(this.props.height - pixelBox.y1, 'lower'),
    //             x2: xScaleInvert(pixelBox.x2, 'upper'),
    //             y2: yScaleInvert(this.props.height - pixelBox.y2, 'upper')
    //         };

    //         return result;
    //     }, {});

    //     return {
    //         pixelBox,
    //         dataBox
    //     };
    // }

    // getScaleInvert(scale, align) {
    //     if(scale.invert) return scale.invert;
    //     if(scale.invertExtent) return scale.invertExtent;

    //     const scaleDomain = scale.domain();

    //     if(!scaleDomain instanceof Array || !scale.bandwidth) return console.error('Unable to invert scale');

    //     const scaleDomainBounds = scale.domain().map(item => {
    //         const lowerBound = scale(item);
    //         const upperBound = lowerBound + scale.bandwidth();

    //         return {
    //             lowerBound,
    //             upperBound,
    //             domainValue: item
    //         }
    //     })

    //     return (value) => {
    //         return scaleDomainBounds.reduce((closest, {lowerBound, upperBound, domainValue}) => {
    //             // Ignore items totally outside box
    //             if(align === 'lower' && upperBound < value) return closest;
    //             if(align === 'upper' && lowerBound > value) return closest;

    //             const distance = align === 'lower'
    //                 ? Math.abs(value - lowerBound)
    //                 : Math.abs(value - upperBound);

    //             if(!closest.distance || closest.distance > distance) {
    //                 return {
    //                     distance,
    //                     value: domainValue
    //                 };
    //             } else {
    //                 return closest;
    //             }
    //         }, {}).value;
    //     };
    // }

    // @TODO allow for threshold
    // calculateInsideBox(box) {
    //     return this.props.scaleGroups.reduce((result, groupName, index) => {
    //         // @TODO look at how this works with multiple columns
    //         const yScale = this.props.yScales[index];
    //         const xScale = this.props.xScales[index];
    //         const xColumn = this.props.xColumns[index][0];
    //         const yColumn = this.props.yColumns[index][0];

    //         return result.set(groupName, this.props.data.rows
    //             .map((row, index) => {
    //                 const rowX = xScale(row.get(xColumn)) + (xScale.bandwidth ? xScale.bandwidth() / 2 : 0);
    //                 const rowY = this.props.height - (yScale(row.get(yColumn)) + (yScale.bandwidth ? yScale.bandwidth() / 2 : 0));

    //                 return Map({
    //                     insideBox: rowX > box.x &&
    //                                rowX < box.x + box.width &&
    //                                rowY > box.y &&
    //                                rowY < box.y + box.height,
    //                     rowIndex: index
    //                 });
    //             })
    //             .filter(row => row.get('insideBox'))
    //         )

    //     }, Map());
    // }

    // calculateDistances(ee: MouseEvent) {
    //     const [xPos, yPos] = this.getCoordinates(ee);

    //     const distanceY = this.props.scaleGroups.reduce((result, groupName, index) => {
    //         const scale = this.props.yScales[index];
    //         return result.set(groupName, this.props.data.calculateRowDistances(
    //             this.props.yColumns[index],
    //             yPos,
    //             (a, b) => this.calculateDistanceBetweenPoints(a, scale(b), scale)
    //         ));
    //     }, Map());

    //     const distanceX = this.props.scaleGroups.reduce((result, groupName, index) => {
    //         const scale = this.props.xScales[index];
    //         return result.set(groupName, this.props.data.calculateRowDistances(
    //             this.props.xColumns[index],
    //             xPos,
    //             (a, b) => this.calculateDistanceBetweenPoints(a, scale(b), scale)
    //         ));
    //     }, Map());

    //     // @TODO remove column from XY
    //     const distanceXY = distanceY.map((group, groupName) => {
    //         return group.map((row, index) => {
    //             return row.set(
    //                 'distance',
    //                 Math.sqrt(
    //                     Math.pow(distanceY.getIn([groupName, index, 'distance']), 2) +
    //                     Math.pow(distanceX.getIn([groupName, index, 'distance']), 2)
    //                 )
    //             )
    //             .set('columnX', distanceX.getIn([groupName, index, 'column']))
    //             .set('columnY', distanceY.getIn([groupName, index, 'column']))
    //             .delete('column');
    //         });
    //     });

    //     return {
    //         distanceX,
    //         distanceY,
    //         distanceXY
    //     }
    // }

    // buildLines() {
    //     if(!this.state.rowDistances) return null;
    //     const maxDistance = this.state.rowDistances.map(row => row.get('distance')).max();
    //     const minDistance = this.state.rowDistances.map(row => row.get('distance')).min();

    //     const scale = scaleSequential(interpolateInferno)
    //         .domain([maxDistance, minDistance]);

    //     return this.state.rowDistances.map((row, index) => {
    //         return <line
    //             key={index}
    //             stroke={scale(row.get('distance'))}
    //             x1={this.state.xPos}
    //             y1={this.props.height - this.state.yPos}
    //             x2={this.props.xScales[0](row.getIn(['rowData', 'month']))}
    //             y2={this.props.height - this.props.yScales[0](row.getIn(['rowData', 'supply']))}
    //         />
    //     });
    // }