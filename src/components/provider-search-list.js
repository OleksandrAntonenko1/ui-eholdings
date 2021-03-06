import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';

import QueryList from './query-list';
import ProviderListItem from './provider-list-item';

const ITEM_HEIGHT = 53;

export default function ProviderSearchList({
  activeId,
  collection,
  fetch,
  onUpdateOffset,
  params,
  shouldFocusItem,
  onClickItem
}) {
  return (
    <QueryList
      type="providers"
      offset={parseInt(params.offset || 0, 10)}
      fetch={fetch}
      collection={collection}
      onUpdateOffset={onUpdateOffset}
      itemHeight={ITEM_HEIGHT}
      notFoundMessage={(
        <FormattedMessage
          id="ui-eholdings.provider.resultsNotFound"
          values={{ query: params.q }}
        />
      )}

      fullWidth
      renderItem={item => (
        <ProviderListItem
          item={item.content}
          link={item.content && {
            pathname: `/eholdings/providers/${item.content.id}`
          }}
          active={item.content && activeId && item.content.id === activeId}
          shouldFocus={item.content && shouldFocusItem && item.content.id === shouldFocusItem}
          onClick={() => onClickItem(`/eholdings/providers/${item.content.id}`)}
        />
      )}
    />
  );
}

ProviderSearchList.propTypes = {
  activeId: PropTypes.string,
  collection: PropTypes.object.isRequired,
  fetch: PropTypes.func.isRequired,
  onClickItem: PropTypes.func.isRequired,
  onUpdateOffset: PropTypes.func.isRequired,
  params: PropTypes.object.isRequired,
  shouldFocusItem: PropTypes.string
};
