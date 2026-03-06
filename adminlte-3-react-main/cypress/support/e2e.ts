// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// serving support files with the 'supportFile' configuration
// option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

Cypress.on("uncaught:exception", (err) => {
  if (
    err.message.includes("Hydration failed") ||
    err.message.includes("initial UI does not match") ||
    err.message.includes("There was an error while hydrating") ||
    err.message.includes("NEXT_REDIRECT")
  ) {
    return false;
  }
});
