// @flow
import React from 'react';


type SvgShape = {fill?: string, stroke?: string, strokeWidth?: string, shapeRendering?: string};

export type LinePosition = SvgShape & {x1: number, x2: number, y1: number, y2: number};
export type TextPosition = SvgShape & {x: number, y: number, children: any};
export type CirclePosition = SvgShape & {cx: number, cy: number, r: number};
export type RectPosition = SvgShape & {x: number, y: number, width: number, height: number};
export type PathPosition = SvgShape & {d: string};


export const renderLine = ({position}: {position: LinePosition}) => <line {...position} />;
export const renderCircle = ({position}: {position: CirclePosition}) => <circle {...position} />;
export const renderRect = ({position}: {position: RectPosition}) => <rect {...position} />;
export const renderText = ({position}: {position: TextPosition}) => <text {...position} />;
export const renderPath = ({position}: {position: PathPosition}) => <path {...position} />;
