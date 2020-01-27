const LOAD_ANIMATION_TIME = 1200;

describe('Home Page Test', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.injectAxe();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
  });
  it('Has no detectable a11y violations on load', () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(LOAD_ANIMATION_TIME);
    cy.checkA11y();
  });

  it('should have a title', () => {
    cy.get('h1').contains('Lunch.JS');
  });

  it('should link to the github issues', () => {
    cy.get('[data-test-id="join-button"]')
      .contains('Join a Lunch')
      .and('have.attr', 'href', 'https://github.com/jsla/lunch.js/issues');
  });

  it('should link to create a new issue', () => {
    cy.get('[data-test-id="new-button"]')
      .contains('Start a Lunch')
      .and('have.attr', 'href', 'https://github.com/jsla/lunch.js/issues/new');
  });
});
