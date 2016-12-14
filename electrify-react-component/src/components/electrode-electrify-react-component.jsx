import React, {PropTypes} from "react";
import Assets from "./sub-components/assets";
import Modules from "./sub-components/modules";
import styles from "../../src/styles/electrify.css";

export default class ElectrodeElectrifyReactComponent extends React.Component {
  render() {
    return (
      <div>
        <div className={styles.leftColumn}>
          <Modules
            modules={this.props.modules}
            modulesByPkg={this.props.modulesByPkg}
            totalSize={this.props.totalSizeByPkg}
          />
        </div>
        <div className={styles.rightColumn}>
          <Assets assets={this.props.assets}/>
        </div>
      </div>
    );
  }
}

ElectrodeElectrifyReactComponent.displayName = "ElectrodeElectrifyReactComponent";

ElectrodeElectrifyReactComponent.propTypes = {
  modules: PropTypes.object,
  modulesByPkg: PropTypes.object,
  totalSizeByPkg: PropTypes.number,
  assets: PropTypes.object
};

ElectrodeElectrifyReactComponent.defaultProps = {};
