import { CircleProps } from '../../../code/svg/elements/circle';
import { LineProps } from '../../../code/svg/elements/line';

export const nodeRadius = 16;
export const defaultDistance = 6 * nodeRadius;

export const nodeProperties: Pick<CircleProps, 'radius' | 'color'> = {
    radius: nodeRadius,
    color: 'green',
}

export const relayProperties: Pick<CircleProps, 'radius' | 'color'> = {
    radius: nodeRadius,
    color: 'blue',
}

export const linkProperties: Pick<LineProps, 'color' | 'marker'> = {
    color: 'yellow',
    marker: ['start', 'end'],
};

export const lineProperties: Pick<LineProps, 'color' | 'marker'> = {
    color: 'yellow',
    marker: [],
};
