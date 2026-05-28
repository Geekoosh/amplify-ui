import * as exported from '..';

const sortedExportKeys = Object.keys(exported).sort();

describe('@saasontools/amplify-ui-react-core', () => {
  it('exports should match snapshot', () => {
    expect(sortedExportKeys).toMatchSnapshot();
  });
});
