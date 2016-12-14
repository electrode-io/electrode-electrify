import React, {PropTypes} from "react";
import {Card, CardHeader, CardText} from "material-ui/Card";
import AssetVisualization from "./assets-visualization";

const WebpackAssets = (props) => {
  return (<Card initiallyExpanded={true}>
	<CardHeader showExpandableButton={true} actAsExpander={true} subtitle="Webpack Assets"/>
		<CardText expandable={true}>
		<AssetVisualization assets={props.assets} />
		</CardText>
	</Card>);
};

WebpackAssets.propTypes = {
  assets: PropTypes.array
};

export default WebpackAssets;
