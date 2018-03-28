/* global describe, beforeEach, afterEach */
/* istanbul ignore file */
import React from 'react';
import chai from 'chai';
import chaiJquery from 'chai-jquery';
import $ from 'jquery';
import { render, unmountComponentAtNode } from 'react-dom';
import Convergence from '@bigtest/convergence';
import axe from 'axe-core';
import { it } from '@bigtest/mocha';
import { expect } from 'chai';
import startMirage from '../mirage/start';
import TestHarness from './harness';
import AxeResults from './axe-results';

// use jquery matchers
chai.use((chai, utils) => chaiJquery(chai, utils, $)); // eslint-disable-line no-shadow

// helper to trigger native change events for react elements
export { default as triggerChange } from 'react-trigger-change';

/**
 * Sets up the entire Folio application with mirage, mounts it, and tears it down
 * Use this helper for end-to-end acceptance testing intead of the normal 'describe'
 *
 * ```
 * describeApplication('Acceptance', function() {
 *   it('should show something awesome', function() {
 *     expect($('h1')).to.have.text('something awesome');
 *   });
 * })
 * ```
 * @param {String} name - name of the test suite, passed to mocha's `describe`
 * @param {Function} setup - suite definition, also passed to `describe`
 */
export function describeApplication(name, setup, describe = window.describe) {
  describe(name, function () {
    let rootElement;

    beforeEach(function () {
      rootElement = document.createElement('div');
      rootElement.id = 'react-testing';
      rootElement.style.height = '100%';
      document.body.appendChild(rootElement);

      this.server = startMirage(setup.scenarios);
      this.server.logging = false;

      this.app = render(<TestHarness />, rootElement);

      this.visit = visit.bind(null, this); // eslint-disable-line no-use-before-define
    });

    afterEach(function () {
      this.server.shutdown();
      unmountComponentAtNode(rootElement);
      document.body.removeChild(rootElement);
      rootElement = null;
    });

    let doSetup = typeof setup.suite === 'function' ? setup.suite : setup;

    doSetup.call(this);
  });
}

describeApplication.skip = describe.skip;
describeApplication.only = function (name, setup) {
  return describeApplication(name, setup, describe.only);
};


/**
 * Triggers a navigation, and ensures that it happens correctly.
 *
 * In order to run an acceptance test, you need to navigate to various
 * parts of the application and then make assertions on them. However,
 * you don't want to start making assertions until you know that you
 * went somewhere.
 *
 * `visit` return a promise that resolves when `convergenceCheck` has
 * been met.
 *
 *   // tests will not continue until the convergence check has been made.
 *   beforeEach(function() {
 *     this.app = render(<TestHarness/>, rootElement);
 *     return visit(this, '/eholdings', function() {
 *       expect($('[data-my-app]')).to.exist;
 *     });
 *   });
 *
 * @param {Object} context - a mocha test context.
 * @param {String|Location} path - where to navigate.
 * @param {Function} convergenceCheck - assertion to run to ensure
 * that the navigation worked.
 * @return {Promise} resolved when navigation is complete.
 */
function visit(context, path, convergenceCheck) {
  return new Convergence()
    .do(() => context.app.visit(path))
    .once(convergenceCheck)
    .timeout(context.timeout())
    .run();
}

// Wrap Axe in a promise for a nicer API
let runAxe = new Promise((resolve, reject) => {
  axe.run((err, results) => {
    if (err) reject(err);
    resolve(results);
  });
});

export function checkA11y() {
  describe('Axe accessibility check', () => {
    let err, results;

    beforeEach(() => {
      err = results = null;
      return runAxe.then(axeResults => {
        results = new AxeResults(axeResults);
      }).catch(error => {
        err = error;
      });
    });

    it('passes axe accessibility check', () => {
      expect(err).to.not.exist;
      expect(results).to.not.be.empty;
      expect(results.violationCount).to.have.equal(0, results.printViolations());
    });
  });
}
