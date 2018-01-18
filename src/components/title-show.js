import React from 'react';
import PropTypes from 'prop-types';

import IconButton from '@folio/stripes-components/lib/IconButton';
import PaneMenu from '@folio/stripes-components/lib/PaneMenu';

import DetailsView from './details-view';
import KeyValueLabel from './key-value-label';
import ScrollView from './scroll-view';
import PackageListItem from './package-list-item';
import IdentifiersList from './identifiers-list';
import ContributorsList from './contributors-list';

export default function TitleShow({ model }, { router, queryParams }) {
  let historyState = router.history.location.state;

  return (
    <DetailsView
      type="title"
      model={model}
      showPaneHeader={!queryParams.searchType}
      paneHeaderFirstMenu={historyState && historyState.eholdings && (
        <PaneMenu>
          <div data-test-eholdings-title-show-back-button>
            <IconButton icon="left-arrow" onClick={() => router.history.goBack()} />
          </div>
        </PaneMenu>
      )}
      bodyContent={(
        <div>
          <ContributorsList data={model.contributors} />

          <KeyValueLabel label="Publisher">
            <div data-test-eholdings-title-show-publisher-name>
              {model.publisherName}
            </div>
          </KeyValueLabel>

          <KeyValueLabel label="Publication Type">
            <div data-test-eholdings-title-show-publication-type>
              {model.publicationType}
            </div>
          </KeyValueLabel>

          <IdentifiersList data={model.identifiers} />

          {model.subjects.length > 0 && (
            <KeyValueLabel label="Subjects">
              <div data-test-eholdings-title-show-subjects-list>
                {model.subjects.map(subjectObj => subjectObj.subject).join('; ')}
              </div>
            </KeyValueLabel>
          )}

          <hr />
        </div>
      )}
      listHeader="Packages"
      renderList={scrollable => (
        <ScrollView
          itemHeight={70}
          items={model.customerResources}
          scrollable={scrollable}
          data-test-query-list="title-packages"
        >
          {item => (
            <PackageListItem
              link={`/eholdings/customer-resources/${item.id}`}
              packageName={item.packageName}
              item={item}
            />
          )}
        </ScrollView>
      )}
    />
  );
}

TitleShow.propTypes = {
  model: PropTypes.object.isRequired
};

TitleShow.contextTypes = {
  router: PropTypes.object,
  queryParams: PropTypes.object
};
