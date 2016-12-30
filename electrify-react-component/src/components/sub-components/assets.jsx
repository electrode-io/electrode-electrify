import React, {PropTypes} from "react";
import AssetsVisualization from "./assets-visualization";
import styles from "../../../src/styles/base.css";
import classNames from "classnames/bind";
const cx = classNames.bind(styles);

const WebpackAssets = (props) => {
  return (
    <div>
      <div className={styles.title}>
        <div className={styles.iconContainer}>
          <i className={cx([
            {modulesIcon: true},
            "material-icons",
            "md-36",
            "md-light"
          ])}>
            content_copy
          </i>
        </div>
        <h2 className={styles.titleText}>Assets</h2>
      </div>
      <AssetsVisualization assets={props.assets} />
    </div>
  );
};

WebpackAssets.propTypes = {
  assets: PropTypes.array
};

export default WebpackAssets;
