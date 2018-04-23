import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import { describeApplication } from './helpers';
import PackageSearchPage from './pages/package-search';
import PackageShowPage from './pages/package-show';
import ResourceShowPage from './pages/resource-show';

describeApplication('PackageSearch', () => {
  let pkgs;

  beforeEach(function () {
    pkgs = this.server.createList('package', 3, 'withProvider', 'withTitles', {
      name: i => `Package${i + 1}`,
      isSelected: i => !!i,
      titleCount: 3,
      selectedCount: i => i,
      contentType: i => (!i ? 'ebook' : 'ejournal')
    });

    this.server.create('package', 'withProvider', {
      name: 'SomethingElse'
    });

    return this.visit('/eholdings/?searchType=packages', () => {
      expect(PackageSearchPage.exists).to.be.true;
    });
  });

  it('has a searchbox', () => {
    expect(PackageSearchPage.hasSearchField).to.be.true;
  });

  it('has disabled search button', () => {
    expect(PackageSearchPage.isSearchDisabled).to.be.true;
  });

  it('has a pre-results pane', () => {
    expect(PackageSearchPage.hasPreSearchPane).to.equal(true);
  });

  describe('searching for a package', () => {
    beforeEach(() => {
      return PackageSearchPage.search('Package');
    });

    it('removes the pre-results pane', () => {
      expect(PackageSearchPage.hasPreSearchPane).to.equal(false);
    });

    it("displays package entries related to 'Package'", () => {
      expect(PackageSearchPage.packageList()).to.have.lengthOf(3);
    });

    it('displays the package name in the list', () => {
      expect(PackageSearchPage.packageList(0).name).to.equal('Package1');
    });

    it('displays the package provider name name in the list', () => {
      expect(PackageSearchPage.packageList(0).providerName).to.equal(pkgs[0].provider.name);
    });

    it('displays a loading indicator where the total results will be', () => {
      expect(PackageSearchPage.totalResults).to.equal('Loading...');
    });

    it('displays the total number of search results', () => {
      expect(PackageSearchPage.totalResults).to.equal('3 search results');
    });

    it.skip('hides search filters on smaller screen sizes (due to new search term)', () => {
      expect(PackageSearchPage.isSearchVignetteHidden).to.equal(true);
    });

    describe('clicking a search results list item', () => {
      beforeEach(() => {
        return PackageSearchPage.interaction
          .once(() => PackageSearchPage.hasLoaded)
          .do(() => PackageSearchPage.packageList(0).clickThrough());
      });

      it('clicked item has an active state', () => {
        expect(PackageSearchPage.packageList(0).isActive).to.be.true;
      });

      it('shows the preview pane', () => {
        expect(PackageSearchPage.packagePreviewPaneIsPresent).to.be.true;
      });

      it.always('should not display button in UI', () => {
        expect(PackageSearchPage.hasBackButton).to.be.false;
      });

      describe('conducting a new search', () => {
        beforeEach(() => {
          return PackageSearchPage.search('SomethingElse');
        });

        it('removes the preview detail pane', () => {
          expect(PackageSearchPage.packagePreviewPaneIsPresent).to.be.false;
        });

        it('preserves the last history entry', function () {
          // this is a check to make sure duplicate entries are not added
          // to the history. Ensuring the back button works as expected
          let history = this.app.history;
          expect(history.entries[history.index - 1].search).to.include('q=Package');
        });

        it.skip('hides search filters on smaller screen sizes (due to new search term)', () => {
          expect(PackageSearchPage.isSearchVignetteHidden).to.equal(true);
        });
      });

      describe('selecting a package', () => {
        beforeEach(() => {
          return PackageShowPage.toggleIsSelected();
        });

        it('reflects the selection in the results list', () => {
          expect(PackageSearchPage.packageList(0).isSelected).to.be.true;
        });
      });

      // the browser needs to be a specific size for this test to pass
      describe.skip('clicking the vignette behind the preview pane', () => {
        beforeEach(() => {
          return PackageSearchPage.clickSearchVignette();
        });

        it('hides the preview pane', () => {
          expect(PackageSearchPage.packagePreviewPaneIsPresent).to.be.false;
        });
      });

      describe('clicking the close button on the preview pane', () => {
        beforeEach(() => {
          return PackageSearchPage.clickCloseButton();
        });

        it('hides the preview pane', () => {
          expect(PackageSearchPage.packagePreviewPaneIsPresent).to.be.false;
        });

        it('displays the original search', () => {
          expect(PackageSearchPage.searchFieldValue).to.equal('Package');
        });

        it('displays the original search results', () => {
          expect(PackageSearchPage.packageList()).to.have.lengthOf(3);
        });
      });

      describe('clicking an item within the preview pane', () => {
        beforeEach(() => {
          return PackageSearchPage.packageTitleList(0).clickToTitle();
        });

        it('hides the search ui', () => {
          expect(PackageSearchPage.exists).to.be.false;
        });

        describe('and clicking the back button', () => {
          beforeEach(() => {
            return ResourceShowPage.clickBackButton();
          });

          it('displays the original search', () => {
            expect(PackageSearchPage.searchFieldValue).to.equal('Package');
          });

          it('displays the original search results', () => {
            expect(PackageSearchPage.packageList()).to.have.lengthOf(3);
          });
        });
      });
    });

    describe('filtering by content type', () => {
      beforeEach(() => {
        return PackageSearchPage.interaction
          .once(() => PackageSearchPage.hasLoaded)
          .clickFilter('type', 'ebook');
      });

      it('only shows results for ebook content types', () => {
        expect(PackageSearchPage.packageList()).to.have.lengthOf(1);
      });

      it('reflects the filter in the URL query params', function () {
        expect(this.app.history.location.search).to.include('filter[type]=ebook');
      });

      it.skip('shows search filters on smaller screen sizes (due to filter change only)', () => {
        expect(PackageSearchPage.isSearchVignetteHidden).to.equal(false);
      });

      describe('clearing the filters', () => {
        beforeEach(() => {
          return PackageSearchPage.interaction
            .once(() => PackageSearchPage.hasLoaded)
            .clearFilter('type');
        });

        it.always('removes the filter from the URL query params', function () {
          expect(this.app.history.location.search).to.not.include('filter[type]');
        });
      });

      describe('visiting the page with an existing filter', () => {
        beforeEach(function () {
          return PackageSearchPage.interaction
            .once(() => PackageSearchPage.hasLoaded)
            .do(() => (
              this.visit('/eholdings/?searchType=packages&q=Package&filter[type]=ejournal', () => {
                expect(PackageSearchPage.exists).to.be.true;
              })
            ));
        });

        it('shows the existing filter in the search form', () => {
          expect(PackageSearchPage.getFilter('type')).to.equal('ejournal');
        });

        it('only shows results for e-journal content types', () => {
          expect(PackageSearchPage.packageList()).to.have.lengthOf(2);
        });
      });
    });

    describe('filtering by selection status', () => {
      beforeEach(() => {
        return PackageSearchPage.interaction
          .once(() => PackageSearchPage.hasLoaded)
          .clickFilter('selected', 'true');
      });

      it('only shows results for selected packages', () => {
        expect(PackageSearchPage.packageList()).to.have.lengthOf(2);
        expect(PackageSearchPage.packageList(0).isSelected).to.be.true;
      });

      it('reflects the filter in the URL query params', function () {
        expect(this.app.history.location.search).to.include('filter[selected]=true');
      });

      describe('clearing the filters', () => {
        beforeEach(() => {
          return PackageSearchPage.interaction
            .once(() => PackageSearchPage.hasLoaded)
            .clearFilter('selected');
        });

        it.always('removes the filter from the URL query params', function () {
          expect(this.app.history.location.search).to.not.include('filter[selected]');
        });
      });

      describe('visiting the page with an existing filter', () => {
        beforeEach(function () {
          return PackageSearchPage.interaction
            .once(() => PackageSearchPage.hasLoaded)
            .do(() => (
              this.visit('/eholdings/?searchType=packages&q=Package&filter[selected]=false', () => {
                expect(PackageSearchPage.exists).to.be.true;
              })
            ));
        });

        it('shows the existing filter in the search form', () => {
          expect(PackageSearchPage.getFilter('selected')).to.equal('false');
        });

        it('only shows results for non-selected packages', () => {
          expect(PackageSearchPage.packageList()).to.have.lengthOf(1);
        });
      });
    });

    describe('with a more specific query', () => {
      beforeEach(() => {
        return PackageSearchPage.interaction
          .once(() => PackageSearchPage.hasLoaded)
          .search('Package1');
      });

      it('only shows a single result', () => {
        expect(PackageSearchPage.packageList()).to.have.lengthOf(1);
      });
    });

    describe('clicking another search type', () => {
      beforeEach(() => {
        return PackageSearchPage.interaction
          .once(() => PackageSearchPage.hasLoaded)
          .do(() => PackageSearchPage.packageList(0).click())
          .changeSearchType('titles');
      });

      it('only shows one search type as selected', () => {
        expect(PackageSearchPage.selectedSearchType()).to.have.lengthOf(1);
      });

      it('displays an empty search', () => {
        expect(PackageSearchPage.titleSearchFieldValue).to.equal('');
      });

      it('does not display any more results', () => {
        expect(PackageSearchPage.hasResults).to.be.false;
      });

      it('does not show the preview pane', () => {
        expect(PackageSearchPage.titlePreviewPaneIsPresent).to.be.false;
      });

      describe('navigating back to packages search', () => {
        beforeEach(() => {
          return PackageSearchPage.changeSearchType('packages');
        });

        it('displays the original search', () => {
          expect(PackageSearchPage.searchFieldValue).to.equal('Package');
        });

        it('displays the original search results', () => {
          expect(PackageSearchPage.packageList()).to.have.lengthOf(3);
        });

        it('shows the preview pane', () => {
          expect(PackageSearchPage.packagePreviewPaneIsPresent).to.be.true;
        });
      });
    });
  });

  describe('sorting packages', () => {
    beforeEach(function () {
      this.server.create('package', {
        name: 'Academic ASAP'
      });
      this.server.create('package', {
        name: 'Search Networks'
      });
      this.server.create('package', {
        name: 'Non Matching'
      });
      this.server.create('package', {
        name: 'Academic Search Elite'
      });
      this.server.create('package', {
        name: 'Academic Search Premier'
      });
    });

    describe('searching for packages', () => {
      beforeEach(() => {
        return PackageSearchPage.search('academic search');
      });

      it('has search filters', () => {
        expect(PackageSearchPage.hasSearchFilters).to.be.true;
      });

      it('shows the default sort filter of relevance in the search form', () => {
        expect(PackageSearchPage.getFilter('sort')).to.equal('relevance');
      });

      it("displays package entries related to 'academic search'", () => {
        expect(PackageSearchPage.packageList()).to.have.lengthOf(4);
      });

      it('displays the packages sorted by relevance', () => {
        expect(PackageSearchPage.packageList(0).name).to.equal('Academic Search Elite');
        expect(PackageSearchPage.packageList(1).name).to.equal('Academic Search Premier');
        expect(PackageSearchPage.packageList(2).name).to.equal('Academic ASAP');
        expect(PackageSearchPage.packageList(3).name).to.equal('Search Networks');
      });

      it.always('does not reflect the default sort=relevance in url', function () {
        expect(this.app.history.location.search).to.not.include('sort=relevance');
      });

      describe('then filtering by sort options', () => {
        beforeEach(() => {
          return PackageSearchPage.interaction
            .once(() => PackageSearchPage.hasLoaded)
            .clickFilter('sort', 'name');
        });

        it('displays the packages sorted by package name', () => {
          expect(PackageSearchPage.packageList(0).name).to.equal('Academic ASAP');
          expect(PackageSearchPage.packageList(1).name).to.equal('Academic Search Elite');
          expect(PackageSearchPage.packageList(2).name).to.equal('Academic Search Premier');
          expect(PackageSearchPage.packageList(3).name).to.equal('Search Networks');
        });

        it('shows the sort filter of name in the search form', () => {
          expect(PackageSearchPage.getFilter('sort')).to.equal('name');
        });

        it('reflects the sort in the URL query params', function () {
          expect(this.app.history.location.search).to.include('sort=name');
        });

        describe('then searching for other packages', () => {
          beforeEach(() => {
            return PackageSearchPage.search('search');
          });

          it('keeps the sort filter of name in the search form', () => {
            expect(PackageSearchPage.getFilter('sort')).to.equal('name');
          });

          it('displays the packages sorted by package name', () => {
            expect(PackageSearchPage.packageList(0).name).to.equal('Academic Search Elite');
            expect(PackageSearchPage.packageList(1).name).to.equal('Academic Search Premier');
            expect(PackageSearchPage.packageList(2).name).to.equal('Search Networks');
          });

          it('shows the sort filter of name in the search form', () => {
            expect(PackageSearchPage.getFilter('sort')).to.equal('name');
          });

          describe('then clicking another search type', () => {
            beforeEach(() => {
              return PackageSearchPage.interaction
                .once(() => PackageSearchPage.hasLoaded)
                .changeSearchType('titles');
            });

            it('does not display any results', () => {
              expect(PackageSearchPage.hasResults).to.be.false;
            });

            describe('navigating back to packages search', () => {
              beforeEach(() => {
                return PackageSearchPage.changeSearchType('packages');
              });

              it('keeps the sort filter of name in the search form', () => {
                expect(PackageSearchPage.getFilter('sort')).to.equal('name');
              });

              it('displays the last results', () => {
                expect(PackageSearchPage.packageList()).to.have.lengthOf(3);
              });

              it('reflects the sort=name in the URL query params', function () {
                expect(this.app.history.location.search).to.include('sort=name');
              });
            });
          });
        });
      });
    });

    describe('visiting the page with an existing sort', () => {
      beforeEach(function () {
        return this.visit('/eholdings/?searchType=packages&q=academic&sort=name', () => {
          expect(PackageSearchPage.exists).to.be.true;
        });
      });

      it('displays search field populated', () => {
        expect(PackageSearchPage.searchFieldValue).to.equal('academic');
      });

      it('displays the sort filter of name as selected in the search form', () => {
        expect(PackageSearchPage.getFilter('sort')).to.equal('name');
      });

      it('displays the expected results', () => {
        expect(PackageSearchPage.packageList()).to.have.lengthOf(3);
      });

      it('displays results sorted by name', () => {
        expect(PackageSearchPage.packageList(0).name).to.equal('Academic ASAP');
        expect(PackageSearchPage.packageList(1).name).to.equal('Academic Search Elite');
        expect(PackageSearchPage.packageList(2).name).to.equal('Academic Search Premier');
      });
    });

    describe('clearing the search field', () => {
      beforeEach(() => {
        return PackageSearchPage.fillSearch('');
      });

      it('has disabled search button', () => {
        expect(PackageSearchPage.isSearchDisabled).to.be.true;
      });
    });
  });

  describe('with multiple pages of packages', () => {
    beforeEach(function () {
      this.server.createList('package', 75, {
        name: i => `Other Package ${i + 1}`
      });
    });

    describe('searching for packages', () => {
      beforeEach(() => {
        return PackageSearchPage.search('other');
      });

      it('shows the first page of results', () => {
        expect(PackageSearchPage.packageList(0).name).to.equal('Other Package 5');
      });

      describe('and then scrolling down', () => {
        beforeEach(() => {
          return PackageSearchPage.interaction
            .once(() => PackageSearchPage.hasLoaded)
            .scrollToOffset(26);
        });

        it('shows the next page of results', () => {
          // when the list is scrolled, it has a threshold of 5 items. index 4,
          // the 5th item, is the topmost visible item in the list
          expect(PackageSearchPage.packageList(4).name).to.equal('Other Package 30');
        });

        it('updates the offset in the URL', function () {
          expect(this.app.history.location.search).to.include('offset=26');
        });
      });
    });

    describe('navigating directly to a search page', () => {
      beforeEach(function () {
        return this.visit('/eholdings/?searchType=packages&offset=51&q=other', () => {
          expect(PackageSearchPage.exists).to.be.true;
        });
      });

      it('should show the search results for that page', () => {
        // see comment above about packageList index number
        expect(PackageSearchPage.packageList(4).name).to.equal('Other Package 55');
      });

      it('should retain the proper offset', function () {
        expect(this.app.history.location.search).to.include('offset=51');
      });

      describe('and then scrolling up', () => {
        beforeEach(() => {
          return PackageSearchPage.interaction
            .once(() => PackageSearchPage.hasLoaded)
            .scrollToOffset(0);
        });

        // it might take a bit for the next request to be triggered after the scroll
        it.always('shows the total results', () => {
          expect(PackageSearchPage.totalResults).to.equal('75 search results');
        }, 500);

        it('shows the prev page of results', () => {
          expect(PackageSearchPage.packageList(0).name).to.equal('Other Package 5');
        });

        it('updates the offset in the URL', function () {
          expect(this.app.history.location.search).to.include('offset=0');
        });
      });
    });
  });

  describe("searching for the package 'fhqwhgads'", () => {
    beforeEach(() => {
      return PackageSearchPage.search('fhqwhgads');
    });

    it("displays 'no results' message", () => {
      expect(PackageSearchPage.noResultsMessage).to.equal('No packages found for "fhqwhgads".');
    });
  });

  describe('encountering a server error', () => {
    beforeEach(function () {
      this.server.get('/packages', {
        errors: [{
          title: 'There was an error'
        }]
      }, 500);

      return PackageSearchPage.search("this doesn't matter");
    });

    it('dies with dignity', () => {
      expect(PackageSearchPage.hasErrors).to.be.true;
    });
  });
});
