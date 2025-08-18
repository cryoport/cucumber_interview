Feature: Login
  As a user
  I want to log in from the web UI
  So that I can access my dashboard

  Background:
    Given the API is running
    And I reset the system

  Scenario: Invalid credentials show inline error
    Given I open the login page
    When I fill the login form with email "wrong@example.com" and password "nope"
    And I submit the login form
    Then I should see an inline error "Invalid email or password"

  Scenario: Valid credentials redirect to dashboard
    Given I open the login page
    And I submit the login form
    Then I should be on the dashboard page
    And I should see my user label "user@example.com"
