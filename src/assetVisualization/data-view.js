import d3 from "d3";

let dataView = null;

export default (updateView) => {
  const views = d3.select('.dataView')
    .selectAll("li")
    .data(["shortened", "expanded"])
    .enter()
    .append("li")
    .style("cursor", "pointer")
    .style('display', 'inline')
    .style('margin-right', '25px')
    .append("text")
    .text((d) => `${d} view`)
    .on("click", (d) => updateView(d, true))
};