/* global describe, beforeEach */
import { expect } from 'chai';
import it, { convergeOn } from './it-will';

import { describeApplication } from './helpers';
import VendorSearchPage from './pages/vendor-search';

describeApplication('VendorSearch', () => {
  beforeEach(function () {
    this.server.createList('vendor', 3, 'withPackagesAndTitles', {
      name: i => `Vendor${i + 1}`,
      packagesSelected: 1,
      packagesTotal: 3
    });

    this.server.create('vendor', {
      name: 'Totally Awesome Co'
    });

    return this.visit('/eholdings/?searchType=vendors', () => {
      expect(VendorSearchPage.$root).to.exist;
    });
  });

  it('has a searchbox', () => {
    expect(VendorSearchPage.$searchField).to.exist;
  });

  describe('searching for a vendor', () => {
    beforeEach(() => {
      VendorSearchPage.search('Vendor');
    });

    it("displays vendor entries related to 'Vendor'", () => {
      expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(3);
    });

    it('displays the vendor name in the list', () => {
      expect(VendorSearchPage.vendorList[0].name).to.equal('Vendor1');
    });

    it('displays the number of selected packages for a vendor in the list', () => {
      expect(VendorSearchPage.vendorList[0].numPackagesSelected).to.equal(1);
    });

    it('displays the total number of packages for a vendor in the list', () => {
      expect(VendorSearchPage.vendorList[0].numPackages).to.equal(3);
    });

    it('displays a loading indicator where the total results will be', () => {
      expect(VendorSearchPage.totalResults).to.equal('Loading...');
    });

    it('displays the total number of search results', () => {
      expect(VendorSearchPage.totalResults).to.equal('3 search results');
    });

    describe('clicking a search results list item', () => {
      beforeEach(() => {
        return convergeOn(() => {
          // wait for the previous search to complete
          expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(3);
        }).then(() => VendorSearchPage.$searchResultsItems[0].click());
      });

      it('shows the preview pane', () => {
        expect(VendorSearchPage.previewPaneIsVisible).to.be.true;
      });

      it('should not display button in UI', () => {
        expect(VendorSearchPage.$backButton).to.not.exist;
      });

      describe('clicking the vignette behind the preview pane', () => {
        beforeEach(() => {
          VendorSearchPage.clickSearchVignette();
        });

        it('hides the preview pane', () => {
          expect(VendorSearchPage.previewPaneIsVisible).to.be.false;
        });
      });

      describe('clicking an item within the preview pane', () => {
        beforeEach(() => {
          return VendorSearchPage.clickPackage(0);
        });

        it('hides the search ui', () => {
          expect(VendorSearchPage.$root).to.not.exist;
        });

        describe('and clicking the back button', () => {
          beforeEach(() => {
            return VendorSearchPage.clickBackButton();
          });

          it('displays the original search', () => {
            expect(VendorSearchPage.$searchField).to.have.value('Vendor');
          });

          it('displays the original search results', () => {
            expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(3);
          });
        });
      });
    });

    describe('filtering the search results further', () => {
      beforeEach(() => {
        return convergeOn(() => {
          expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(3);
        }).then(() => (
          VendorSearchPage.search('Vendor1')
        ));
      });

      it('only shows a single result', () => {
        expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(1);
      });
    });

    describe('clicking another search type', () => {
      beforeEach(() => {
        return convergeOn(() => {
          // wait for the previous search to complete
          expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(3);
        }).then(() => VendorSearchPage.changeSearchType('packages'));
      });

      it('displays an empty search', () => {
        expect(VendorSearchPage.$searchField).to.have.value('');
      });

      it('does not display any more results', () => {
        expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(0);
      });

      describe('navigating back to vendors search', () => {
        beforeEach(() => {
          return VendorSearchPage.changeSearchType('vendors');
        });

        it('displays the original search', () => {
          expect(VendorSearchPage.$searchField).to.have.value('Vendor');
        });

        it('displays the original search results', () => {
          expect(VendorSearchPage.$searchResultsItems).to.have.lengthOf(3);
        });
      });
    });
  });

  describe('with multiple pages of vendors', () => {
    beforeEach(function () {
      this.server.createList('vendor', 75, {
        name: i => `Other Vendor ${i + 1}`
      });
    });

    describe('searching for vendors', () => {
      beforeEach(() => {
        VendorSearchPage.search('other');
      });

      it('shows the first page of results', () => {
        expect(VendorSearchPage.vendorList[0].name).to.equal('Other Vendor 5');
      });

      describe('and then scrolling down', () => {
        beforeEach(() => {
          return convergeOn(() => {
            expect(VendorSearchPage.vendorList.length).to.be.gt(0);
          }).then(() => {
            VendorSearchPage.scrollToOffset(26);
          });
        });

        it('shows the next page of results', () => {
          // when the list is scrolled, it has a threshold of 5 items. index 4,
          // the 5th item, is the topmost visible item in the list
          expect(VendorSearchPage.vendorList[4].name).to.equal('Other Vendor 30');
        });

        it('updates the offset in the URL', function () {
          expect(this.app.history.location.search).to.include('offset=26');
        });
      });
    });

    describe('navigating directly to a search page', () => {
      beforeEach(function () {
        return this.visit('/eholdings/?searchType=vendors&offset=51&q=other', () => {
          expect(VendorSearchPage.$root).to.exist;
        });
      });

      it('should show the search results for that page', () => {
        // see comment above about vendorList index number
        expect(VendorSearchPage.vendorList[4].name).to.equal('Other Vendor 55');
      });

      it('should retain the proper offset', function () {
        expect(this.app.history.location.search).to.include('offset=51');
      });

      describe('and then scrolling up', () => {
        beforeEach(() => {
          return convergeOn(() => {
            expect(VendorSearchPage.vendorList.length).to.be.gt(0);
          }).then(() => {
            VendorSearchPage.scrollToOffset(0);
          });
        });

        // it might take a bit for the next request to be triggered after the scroll
        it.still('shows the total results', () => {
          expect(VendorSearchPage.totalResults).to.equal('75 search results');
        }, 500);

        it('shows the prev page of results', () => {
          expect(VendorSearchPage.vendorList[0].name).to.equal('Other Vendor 5');
        });

        it('updates the offset in the URL', function () {
          expect(this.app.history.location.search).to.include('offset=0');
        });
      });
    });
  });

  describe("searching for the vendor 'fhqwhgads'", () => {
    beforeEach(() => {
      VendorSearchPage.search('fhqwhgads');
    });

    it("displays 'no results' message", () => {
      expect(VendorSearchPage.noResultsMessage).to.equal('No vendors found for "fhqwhgads".');
    });
  });

  describe('encountering a server error', () => {
    beforeEach(function () {
      this.server.get('/vendors', {
        errors: [{
          title: 'There was an error'
        }]
      }, 500);

      VendorSearchPage.search("this doesn't matter");
    });

    it('shows an error', () => {
      expect(VendorSearchPage.hasErrors).to.be.true;
    });

    it('displays the error message returned from the server', () => {
      expect(VendorSearchPage.errorMessage).to.equal('There was an error');
    });
  });
});
