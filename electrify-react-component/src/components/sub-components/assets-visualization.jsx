/* eslint react/prop-types: 0 */
import React, {PropTypes} from "react";
import styles from "../../../src/styles/base.css";
import pretty from "prettysize";
import {sample, max, min, each} from "lodash";
import d3 from "d3";

const Asset = (props) => {
  const color = sample([
    "#ff6e30",
    "#008586",
    "#ff4d64",
    "#9e9f34",
    "#00fdfe"
  ]);
  const assetSize = pretty(props.asset.size).split(" ");

  return (
    <div className={styles.assetItem}>
      <div style={{backgroundColor: color}} className={styles.assetSize}>
        <h4>{assetSize[0]}</h4>
        <h4>{assetSize[1]}</h4>
      </div>
      <div className={styles.assetProgressBarContainer}>
        <h4 style={{marginLeft: 15}}>
          {props.asset.name}
        </h4>
        <div className={styles.assetProgressBar}>
          <div style={{
            width: `${props.scaledSize}%`,
            height: "100%",
            backgroundColor: color,
            borderRadius: 25
          }}>
          </div>
        </div>
      </div>
    </div>
  );
};

const WebpackAssets = (props) => {
  const maxAssetFileSize = max(props.assets.map((asset) => asset.size));
  const minAssetFileSize = min(props.assets.map((asset) => asset.size));
  const logScale = d3.scale
      .log()
      .domain([minAssetFileSize, maxAssetFileSize])
      .range([1, 100]); //eslint-disable-line no-magic-numbers

  each(props.assets, (asset) => asset.logScaledSize = logScale(asset.size));

  return (
  <div style={{height: 480, overflow: "scroll"}}>
  {props.assets.map((asset) => {
    return (<Asset key={asset.size} asset={asset} scaledSize={asset.logScaledSize} />);
  })}
  </div>);
};

export default WebpackAssets;

WebpackAssets.propTypes = {
  assets: PropTypes.array
};
