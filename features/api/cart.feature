Feature: Cart pricing and shipping rules

  Background:
    Given the API is running
    And I reset the system
    And I log in as "user@example.com" with password "secret"
    And the catalog contains:
      | sku   | name        | price | stock |
      | A100  | Water Bottle| 15.00 |  10   |
      | B200  | Backpack    | 45.00 |   5   |

  Scenario: Discount applies before tax and affects free shipping threshold
    When I add 1 unit of "A100" to my cart
    And I add 1 unit of "B200" to my cart
    And I apply coupon "SAVE10"
    And I request the cart totals
    Then the subtotal should be "$60.00"
    And the discount should be "$6.00"
    And the taxable amount should be "$54.00"
    And the tax should be "$4.46"
    And the shipping should be "$0.00"
    And the total should be "$58.46"

  Scenario: Coupon is case-insensitive and free shipping is removed when below threshold
    When I reset the system
    And I log in as "user@example.com" with password "secret"
    And I add 2 units of "A100" to my cart
    And I apply coupon "fReeShIp"
    And I request the cart totals
    Then the subtotal should be "$30.00"
    And the discount should be "$0.00"
    And the shipping should be "$7.00"
    And the total should be "$39.48"

#    Additional scenarios: