import domready from 'domready';
import createVisualizaton from './createVisualization'

domready(() => window.electrify ? createVisualizaton(window.electrify) : null)
