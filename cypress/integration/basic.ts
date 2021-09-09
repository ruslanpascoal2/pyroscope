/// <reference types="cypress" />
describe('basic test', () => {
  it('successfully loads', () => {
    cy.visit('/')
    cy.title().should('eq', 'Pyroscope');
  });

  it('internal sidebar links work', () => {
    cy.visit('/')

    waitInDevMode(100);

    cy.findByTestId('sidebar-comparison').click();
    waitInDevMode(100);
    cy.location('pathname').should('eq', '/comparison');

    cy.findByTestId('sidebar-comparison-diff').click();
    waitInDevMode(100);
    cy.location('pathname').should('eq', '/comparison-diff');

    cy.findByTestId('sidebar-root').click();
    waitInDevMode(100);
    cy.location('pathname').should('eq', '/');
  });

  it('view buttons should change view when clicked', () => {
    cy.visit('/')
    cy.findByTestId('btn-table-view').click();
    cy.findByTestId('table-view').should('be.visible');
    cy.findByTestId('flamegraph-view').should('not.be.visible');

    cy.findByTestId('btn-both-view').click();
    cy.findByTestId('table-view').should('be.visible');
    cy.findByTestId('flamegraph-view').should('be.visible');

    cy.findByTestId('btn-flamegraph-view').click();
    cy.findByTestId('table-view').should('not.be.visible');
    cy.findByTestId('flamegraph-view').should('be.visible');
  });

  it.only('app selector works', () => {
    cy.intercept('**/render*', {
      fixture: 'render.json',
      times: 1
    })

    cy.visit('/');

    cy.fixture('render.json').then((data) => {
      cy.findByTestId('table-view').contains('td', data.flamebearer.names[0]).should('be.visible');
      cy.findByTestId('table-view').contains('td', data.flamebearer.names[data.flamebearer.names.length - 1]).should('be.visible');
    });

    cy.intercept('**/render*', {
      fixture: 'render2.json',
      times: 1
    })

    cy.findByTestId('app-selector-dropdown').select('pyroscope.server.cpu');

    cy.fixture('render2.json').then((data) => {
      cy.findByTestId('table-view').contains('td', data.flamebearer.names[0]).should('be.visible');
      cy.findByTestId('table-view').contains('td', data.flamebearer.names[data.flamebearer.names.length - 1]).should('be.visible');
    });

  });



})

// very nasty, just to avoid dealing with the following error
// which requires aborting fetch call and whatnot
// react-dom.development.js:21 Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in the componentWillUnmount method.
// in FlameGraphRenderer (created by Context.Consumer)
// in e (created by ConnectFunction)
// in ConnectFunction (created by PyroscopeApp)
// in div (created by PyroscopeApp)
// in div (created by PyroscopeApp)
// in PyroscopeApp (created by ConnectFunction)
// in ConnectFunction
function waitInDevMode(t: number) {
  if (!process.env.CI) {
    cy.wait(t);
  }
}
