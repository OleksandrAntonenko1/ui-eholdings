import model, { belongsTo } from './model';

class Resource {
  name = '';
  titleId = 0;
  providerId = 0;
  providerName = '';
  packageId = 0;
  packageName = '';
  package = belongsTo();
  title = belongsTo();
  isSelected = false;
  url = null;
  managedCoverages = [];
  customCoverages = [];
  managedEmbargoPeriod = {};
  customEmbargoPeriod = {};
  visibilityData = {};
  coverageStatement = '';
  proxy = {};
  tags = {
    tagList: [],
  };

  // these are really title attributes, but have to stick around
  // until /PUT titles is available in mod-kb-ebsco
  publisherName = '';
  edition = '';
  publicationType = '';
  contentType = '';
  subjects = [];
  contributors = [];
  identifiers = [];
  isTitleCustom = false;
  isPeerReviewed = false;
  description = '';

  serialize() {
    const data = {
      id: this.id,
      type: this.type,
      attributes: {
        packageId: this.packageId,
        titleId: this.titleId,
        url: this.url,
      },
    };

    if (this.data.attributes.name) {
      data.attributes = {
        ...data.attributes,
        name: this.name,
        providerId: this.providerId,
        providerName: this.providerName,
        packageName: this.packageName,
        isSelected: this.isSelected,
        managedCoverages: this.managedCoverages,
        customCoverages: this.customCoverages,
        managedEmbargoPeriod: this.managedEmbargoPeriod,
        customEmbargoPeriod: this.customEmbargoPeriod,
        visibilityData: this.visibilityData,
        coverageStatement: this.coverageStatement,
        proxy: this.proxy,
        publisherName: this.publisherName,
        edition: this.edition,
        publicationType: this.publicationType,
        subjects: this.subjects,
        contributors: this.contributors,
        identifiers: this.identifiers,
        isTitleCustom: this.isTitleCustom,
        isPeerReviewed: this.isPeerReviewed,
        description: this.description,
        tags: this.tags,
      };
    }

    return { data };
  }
}

export default model({
  type: 'resources',
  path: '/eholdings/resources'
})(Resource);
