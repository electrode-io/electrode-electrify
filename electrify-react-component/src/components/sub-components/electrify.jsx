import React, {PropTypes} from "react";
import {bundle} from "../../helpers/modules-helpers/parsing-utils";
import createD3Visualization from "../../helpers/modules-helpers/d3visualization";
import styles from "../../../src/styles/electrify.css";

export default class D3ElectrifyChart extends React.Component {
  parseModules() {
    return bundle(this.props.modules, (data) => {
      return JSON.parse(data.data);
    });
  }

  componentDidMount() {
    const root = this.parseModules();
    createD3Visualization({
      refs: this.refs,
      root
    });
  }

  render() {
    return (
      <div>
        <input
          type="search"
          className={styles.searchBox}
          placeholder="Search File..."
          ref="search"
        />
        <div className={styles.modes}>
          <ul ref="scaleList"className={styles.scaleList}>
          </ul>
        </div>
        <div className={styles.electrifyChartContainer}>
          <div className ={styles.electrifyChart} ref="svg" />
        </div>
        <div ref="paletteWrap" />
      </div>
    );
  }
}

D3ElectrifyChart.propTypes = {
  modules: PropTypes.array
};
