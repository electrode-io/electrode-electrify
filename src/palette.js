import d3 from 'd3';

export default (schemes, useScheme) => {
  function _select(n) {
    palettes.each(function(d, i) {
      d3.select(this.parentNode)
        .classed('selected', () => i === n)
    })

    palettes
      .transition()
      .ease('bounce')
      .duration(500)
      .attr('height', (d, i) => i === n ? 0 : 48);

    [d3.select('body'), d3.select('html')].forEach((el) => {
      el.transition()
        .ease('sin-in-out')
        .duration(600)
        .style('background', schemes[n].background)
    })
  }
  function _useScheme(n) {
    _select(n);
    useScheme(n)
  }

  const paletteDiv = d3.select('.palette-wrap')
    .style('top', '185px')
    .selectAll('.palette')
    .data(schemes)
    .enter()
    .append('div')
    .classed('scheme-icon', true)

  paletteDiv.append('span')
    .classed('scheme-text', true)
    .text(d => d.name)

  const palettes = paletteDiv
    .append('svg')
    .style('display', 'inline-block')
    .classed('palette', true)
    .on('click', (d, i) => _useScheme(i))

  palettes.append('rect')
    .attr('width', 23)
    .attr('height', 48)
    .style('fill', d => d.background)

  palettes.selectAll('.color')
    .data(d => d.all)
    .enter()
    .append('rect')
    .style('fill', d => d)
    .attr('x', 25)
    .attr('y', (d, i, j) => 48 * i / schemes[j].all.length - 1)
    .attr('width', 22)
    .attr('height', (d, i, j) => 48 / schemes[j].all.length - 1)

  _select(0)
}
