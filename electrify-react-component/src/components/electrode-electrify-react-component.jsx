import React from "react";
import Assets from "./sub-components/assets";
import Modules from "./sub-components/modules";
import styles from "../../src/styles/electrify.css";

export default class ElectrodeElectrifyReactComponent19 extends React.Component {
  render() {
    return (
     <div>
	  <div className={styles.leftColumn}>
	    <Modules
	      pureWebpackStats={this.props.webpackInfo.pureWebpackStats}
	      modulesByPkg={this.props.webpackInfo.modulesByPkg}
	      totalSize={this.props.webpackInfo.totalSizeByPkg}
	    />
      </div>
	  <div className={styles.rightColumn}>
	    <Assets webpackInfo={this.props.webpackInfo}/>
	  </div>
    </div>
    );
  }
}

ElectrodeElectrifyReactComponent19.displayName = "ElectrodeElectrifyReactComponent19";

ElectrodeElectrifyReactComponent19.propTypes = {};

ElectrodeElectrifyReactComponent19.defaultProps = {};
