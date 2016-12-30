import React, {Component, PropTypes} from "react";
import Electrify from "./electrify";
import ModulesByPkg from "./modules-by-pkg";
import IconButton from "material-ui/IconButton";
import IconMenu from "material-ui/IconMenu";
import MenuItem from "material-ui/MenuItem";
import ContentFilter from "material-ui/svg-icons/content/filter-list";
import styles from "../../../src/styles/base.css";
import classNames from "classnames/bind";
// import {bundle} from "../../helpers/modules-helpers/parsing-utils";
// import createD3Visualization from "../../helpers/modules-helpers/d3visualization";
const cx = classNames.bind(styles);

class Modules extends Component {
  constructor(props) {
    super(props);
    this.state = { moduleMode: "electrify"};
  }

//TODO: Link MUI MenuItem buttons to D3
  /*
  componentDidMount(){
    const root = this.parseModules();
    const domElements = {
      svg: this.refs.svg,
      modeSelectors: this.refs.iconMenu
    }
    createD3Visualization(root, this.refs.svg, "size", true);
  }

  parseModules() {
    return bundle(this.props.modules, (data) => {
      return JSON.parse(data.data);
    });
  }

  createElectrifyContainer() {
    return (
      <div style={{width: 700}}>
        <div className={styles.electrifyChartContainer}>
          <div className ={styles.electrifyChart} ref="svg" />
        </div>
      </div>)
  }
  */

  createModuleTitle() {
    return (
      <div className={styles.title}>
        <div className={styles.iconContainer}>
          <i className={cx([
            {modulesIcon: true},
            "material-icons",
            "md-36",
            "md-light"
          ])}>
            group_work
          </i>
        </div>
        <h2 className={styles.titleText}>
          Modules
        </h2>
      </div>
    );
  }

  createModuleNavBar() {
    return (
      <div className={styles.modulesNavBar}>
        <div>
          <div
            onClick={() => this.setState({moduleMode: "electrify"})}
            className={this.state.moduleMode === "electrify" ?
              styles.modulesTab : styles.modulesTabSelected } >
            <h4>Electrify</h4>
          </div>
          <div
            onClick={() => this.setState({moduleMode: "byPkg"})}
            className={this.state.moduleMode === "byPkg" ?
              styles.modulesTab : styles.modulesTabSelected} >
            <h4>Modules by Package</h4>
          </div>
          {/*
          TODO: duplicate modules tab
          <div
            onClick={() => this.setState({moduleMode: "duplicates"})}
            className={this.state.moduleMode === "duplicates" ?
              styles.modulesTab : styles.modulesTabSelected } >
            <h4>Duplicate Modules</h4>
          </div>*/}
        </div>
        {/*
        TODO: Add search bar and electrify mode selectors
        <div style={{marginTop: 10}}>
          <form className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search"
            />
          </form>
          <IconMenu
            ref="iconMenu"
            style={{
              float: "right",
              marginRight: 15
            }}
            iconButtonElement={<IconButton><ContentFilter /></IconButton>}
            iconStyle ={{backgroundColor: "transparent", color: "white"}}
            anchorOrigin={{horizontal: "right", vertical: "top"}}
            targetOrigin={{horizontal: "right", vertical: "top"}}
          >
            <MenuItem
              ref="size"
              //These menu items need to be linked to D3 to intiate a mode change
              //onClick = {() => {
                //createD3Visualization(this.parseModules(), this.refs.svg)
              //}}
              style={{backgroundColor: "white", color: "#df2375"}}
              primaryText="File Size" />
            <MenuItem
              ref="count"
              style={{backgroundColor: "white", color: "#df2375"}}
              primaryText="File Count" />
          </IconMenu>
        </div>
        */}
      </div>
    );
  }

  createModules() {
    switch (this.state.moduleMode) {
    case "electrify":
      //note: if Electrify is not a separate component
      //switching between module tabs will not trigger D3 to re-render
      return <Electrify modules={this.props.modules}/>;
      // return this.createElectrifyContainer()
    case "byPkg":
      return (
        <ModulesByPkg
          modulesByPkg={this.props.modulesByPkg}
          totalSize={this.props.totalSize}
        />
      );
    // case "duplicates":
    //   return;
    default:
      return <Electrify modules={this.props.modules}/>;
      // return this.createElectrifyContainer()
    }
  }

  render() {
    return (
      <div>
        {this.createModuleTitle()}
        {this.createModuleNavBar()}
        <div className={styles.modulesContainer}>
          {this.createModules()}
        </div>
      </div>
    );
  }
}

Modules.propTypes = {
  modules: PropTypes.array,
  modulesByPkg: PropTypes.object,
  totalSize: PropTypes.number
};

export default Modules;
