import d3 from 'd3';
import formatSize from "../../lib/format-size";
import map from 'lodash/map';
import domready from 'domready'

export default function() {
  return domready(function() {
    const data = window.electrify.assets,
      width = 850,
      height = 500,
      barHeight = 40;

    const maxFileSize = d3.max(map(data, (d)=>d.size));
    const minFileSize = d3.min(map(data, (d)=>d.size));
    const logScale = d3.scale.log()
      .domain([minFileSize, maxFileSize])
      .range([0, width])
    //scaling asset size to log scale
    for(let i = 0; i < data.length; i++){
      data[i].size = logScale(data[i].size);
    }

    const chart = d3.select('.assets').append("svg");

    chart.attr("preserveAspectRatio", "xMinYMin meet") 
      .attr("viewBox", `0 0 ${width} ${barHeight*data.length*2}`)
      .append("g")
   
    const asset = chart.selectAll("g")
      .data(data)
      .enter()
      .append("g")

    asset.append("text")
      .attr("y", (d,i) => i*barHeight*2)
      .attr("dy", "1em")
      .text((d) => d.name)
      .style("font-size", "1.5em")
      .style('fill', 'white')

    const bars = asset.append('rect')
      .attr("transform", (d,i) => `translate(30,${i*barHeight*2+barHeight})`)
      .attr('height', barHeight*0.7)
      .style('fill', 'darkslategrey')
      .attr('width', '0')
      .transition()
      .duration(2000)
      .attr('width', (d) => d.size)

    asset.append("text")
      .attr("x", "50")
      .attr("y", (d,i) => i*barHeight*2+barHeight*1.35)
      .attr("dy", ".35em")
      .text((d) => formatSize(d.size))
      .style("font-size", "1.5em")
      .style('fill', 'orange')
  })
}
