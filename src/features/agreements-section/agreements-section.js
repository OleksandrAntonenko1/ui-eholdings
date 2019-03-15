import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  FormattedMessage,
} from 'react-intl';

import {
  Pluggable,
} from '@folio/stripes-core';

import {
  Accordion,
  Headline,
  Button,
} from '@folio/stripes/components';

import selectAgreements from '../../redux/selectors';
import {
  attachAgreement as attachAgreementAction,
  getAgreements as getAgreementsAction,
} from '../../redux/actions';

import AgreementsList from '../../components/agreements-list';

import Agreement from './model';

class AgreementsSection extends Component {
  static propTypes = {
    agreements: PropTypes.object,
    attachAgreement: PropTypes.func.isRequired,
    getAgreements: PropTypes.func.isRequired,
    id: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func,
    referenceId: PropTypes.string.isRequired,
  }

  componentDidMount() {
    const {
      getAgreements,
      referenceId,
    } = this.props;

    getAgreements({ referenceId });
  }

  getAgreementsSectionHeader = () => {
    return (
      <Headline
        size="large"
        tag="h3"
      >
        <FormattedMessage id="ui-eholdings.agreements" />
      </Headline>
    );
  }

  renderFindAgreementTrigger = (props) => {
    return (
      <Button {...props}>
        <FormattedMessage id="ui-eholdings.add" />
      </Button>
    );
  }

  getAgreementsSectionButtons() {
    return (
      <Pluggable
        dataKey="find-agreements"
        type="find-agreement"
        renderTrigger={this.renderFindAgreementTrigger}
        onAgreementSelected={this.onAddAgreementHandler}
      />
    );
  }

  onAddAgreementHandler = ({ name, id }) => {
    const {
      referenceId,
      attachAgreement,
    } = this.props;

    attachAgreement({
      id,
      referenceId,
      agreement: new Agreement({ reference: referenceId, label: name }),
    });
  };

  render() {
    const {
      agreements,
      isOpen,
      id,
      onToggle,
    } = this.props;

    return (
      <Accordion
        id={id}
        open={isOpen}
        label={this.getAgreementsSectionHeader()}
        displayWhenOpen={this.getAgreementsSectionButtons()}
        onToggle={onToggle}
      >
        <AgreementsList agreements={agreements} />
      </Accordion>
    );
  }
}

export default connect(
  (store, { referenceId }) => ({
    agreements: selectAgreements(store, referenceId),
  }), {
    getAgreements: getAgreementsAction,
    attachAgreement: attachAgreementAction,
  }
)(AgreementsSection);
