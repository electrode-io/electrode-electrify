/**
 * Client tests
 */
import React from "react";
import { shallow } from "enzyme";

import ElectrodeElectrifyReactComponent from "src/components/electrode-electrify-react-component";

describe("components/electrode-electrify-react-component", () => {

  describe("Mounting", () => {

    it("should render into the document", () => {
      const component = shallow(<ElectrodeElectrifyReactComponent />);
      expect(component).to.not.be.null;
    });

  });

});
