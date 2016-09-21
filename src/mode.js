import d3 from 'd3';

let modes = null;

export default (updateMode) => {
  modes = d3.select('.scale-list')
    .selectAll('li')
    .data(['count', 'size'])
    .enter()
    .append('li')
    .attr('class', 'scale-icon scale-size')
    .on('click', function(d) { updateMode(d, true) });

  modes.append('span')
    .text(d => {
      return {
        count: 'File Count',
        size: 'File Size'
      }[d]
    })

  modes.append('svg')
    .attr({ width: 48, height: 48 })
    .append('g')
    .each(function(type) {
      d3.select(this)
        .attr('transform', 'translate(8, 8)')
        .selectAll('circle')
        .data(d3.range(0, 16))
        .enter()
        .append('circle').attr('fill', '#fff')
        .attr('r', (d, i) => type !== 'size' ? 3 : (i === 0 || i === 6) ? 6 : 3)
        .attr('transform', d => `translate(${[(d % 4) * 10, Math.floor(d / 4) * 10]})`)
    })
}

export const highlightMode = (mode) => {
  modes.style('opacity', d => d === mode ? 1 : null)
}
