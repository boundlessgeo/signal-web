import React, { Component, PropTypes } from "react";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import Header from "../components/Header";
import SideMenu from "../components/SideMenu";
import * as authActions from "../reducers/auth";
import * as menuActions from "../reducers/menu";
import "../style/App.less";
import * as R from "ramda";

const getWindowWidth = () => {
  const w = window;
  const d = document;
  const documentElement = d.documentElement;
  const body = d.getElementsByTagName("body")[0];
  const width = w.innerWidth || documentElement.clientWidth || body.clientWidth;

  return width;
};

class AppContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      width: getWindowWidth()
    };

    this.toggleMenu = this.toggleMenu.bind(this);
    this.closeMenu = this.closeMenu.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions.bind(this));
    if (getWindowWidth() >= 600) {
      this.props.menuActions.openMenu();
    } else {
      this.props.menuActions.closeMenu();
    }
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  toggleMenu() {
    this.props.menuActions.toggleMenu();
  }

  closeMenu() {
    if (this.state.width < 600) {
      this.props.menuActions.closeMenu();
    }
  }

  updateDimensions() {
    this.setState({ width: getWindowWidth() });
  }

  render() {
    return (
      <div id="app">
        <Header
          {...this.props}
          logout={this.props.actions.logout}
          toggleMenu={this.toggleMenu}
        />
        <div className="main-container">
          <SideMenu
            {...this.props}
            closeMenu={this.closeMenu}
            menuOpen={this.props.menu.open}
          />
          {this.props.children}
        </div>
      </div>
    );
  }
}

AppContainer.propTypes = {
  children: PropTypes.object,
  menu: PropTypes.object.isRequired,
  menuActions: PropTypes.object.isRequired
};

const mapStateToProps = (state, ownProps) => ({
  isAuthenticated: state.sc.auth.isAuthenticated,
  userName: R.pathOr("N/A", ["sc", "auth", "user", "name"], state),
  id: ownProps.params.id,
  menu: state.sc.menu
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(authActions, dispatch),
  menuActions: bindActionCreators(menuActions, dispatch)
});

export default connect(mapStateToProps, mapDispatchToProps)(AppContainer);
