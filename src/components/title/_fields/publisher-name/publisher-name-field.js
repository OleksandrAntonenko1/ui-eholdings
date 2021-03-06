import React from 'react';
import { Field } from 'react-final-form';

import { TextField } from '@folio/stripes/components';
import { FormattedMessage } from 'react-intl';

function validate(value) {
  return value && value.length > 250 ? <FormattedMessage id="ui-eholdings.validate.errors.publisherName.length" /> : undefined;
}

function PublisherNameField() {
  return (
    <div data-test-eholdings-publisher-name-field>
      <Field
        name="publisherName"
        component={TextField}
        label={<FormattedMessage id="ui-eholdings.title.publisherName" />}
        validate={validate}
      />
    </div>
  );
}

export default PublisherNameField;
