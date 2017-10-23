import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Icon from '@folio/stripes-components/lib/Icon';

import List from '../../components/list';
import PackageListItem from '../../components/package-list-item';

function PackageSearchResults({
  location,
  query: { search },
  isPending,
  isResolved,
  isRejected,
  content,
  error
}) {
  return isPending ? (
    <Icon icon='spinner-ellipsis' />
  ) : isRejected ? (
    <p data-test-package-search-error-message>
      {error.length ? error[0].message : error.message}
    </p>
  ) : isResolved && !content.length ? (
    <p data-test-package-search-no-results>
      No packages found for <strong>{`"${search}"`}</strong>.
    </p>
  ) : (
    <List data-test-package-search-results-list>
      {content.map(pkg => (
        <PackageListItem
          key={pkg.packageId}
          link={{
            pathname: `/eholdings/vendors/${pkg.vendorId}/packages/${pkg.packageId}`,
            search: location.search
          }}
          item={pkg}
        />
      ))}
    </List>
  );
}

PackageSearchResults.propTypes = {
  location: PropTypes.object.isRequired,
  query: PropTypes.shape({
    search: PropTypes.string
  }).isRequired,
  isPending: PropTypes.bool.isRequired,
  isResolved: PropTypes.bool.isRequired,
  isRejected: PropTypes.bool.isRequired,
  content: PropTypes.array.isRequired,
  error: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ])
};

export default connect(
  ({ eholdings: { search } }) => ({ ...search.packages })
)(PackageSearchResults);
