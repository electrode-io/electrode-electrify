import React, {PropTypes} from "react";
import {bundle} from "../../helpers/modules-helpers/parsing-utils";
import createD3Visualization from "../../helpers/modules-helpers/d3visualization";
import styles from "../../../src/styles/base.css";

export default class D3ElectrifyChart extends React.Component {
  parseModules() {
    return bundle(this.props.modules, (data) => {
      return JSON.parse(data.data);
    });
  }

  componentDidMount() {
    const root = this.parseModules();
    createD3Visualization(root, this.refs.svg);
  }

  render() {
    return (
      <div style={{width: 700}}>
        <div className={styles.electrifyChartContainer}>
          <div className ={styles.electrifyChart} ref="svg" />
        </div>
      </div>
    );
  }
}

D3ElectrifyChart.propTypes = {
  modules: PropTypes.array
};
