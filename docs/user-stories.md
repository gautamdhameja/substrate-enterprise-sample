# Substrate Seminar

### Story 1 - Org creation, role creation & assignment, org role-based access control

  - Account `Alice` is converted into an org `ORG-A`.
    - verify: succeed.
    - note: `Alice` now act as an admin for `ORG-A`.  

  - Using `Alice` to add `Bob` into `ORG-A`
    - verify: succeed. `Bob` belongs to `ORG-A`

  - `Alice` register a product for `ORG-A` (*false*)
    - verify: fail, as no right role has been assigned for `Alice` yet

  - `Bob` registers a new product
    - verify: fail, as no right role has been assigned for `Alice` yet

  - `Alice` creates a role `ProductRegistry::Manage`
    - verify: succeed

  - `Bob` creates a role `ProductRegistry::Execute`
    - verify: fail, as he is not an admin of `ORG-A`

  - `Alice` creates a role `ProductRegistry::Execute`
    - verify: succeed

  - `Alice` assigns role `ProductRegistry::Execute` of `ORG-A` to `Bob`
    - verofy: succeed

  - `Bob` registers a new product
    - verify: succeed

  - `Bob` registers a new shipment
    - verify: fail, as `Bob` does not have `ProductTracking::Execute` role

  - `Alice` creates two roles `ProductTracking::Manage` and `ProductTracking::Execute`. 
    - verify: succeed

  - `Alice` assigns `ProductTracking::Execute` to `Charlies`
    - verify: fail, because `Charlies` does not belong to `ORG-A`

  - `Alice` adds `Charlies` to `ORG-A` and assign the same role to `Charlies`
    - verify: succeed

  - Grants `Charlies` some tokens. `Charlies` registers a new shipment
    - verify: succeed

  - `Charlies` registers a new product
    - verify: fail. No corresponding role

  - `Bob` registers a new shipment or updates shipment
    - verify: fail. No corresponding role

### Story 2 - Validator Demo

  - Video: https://www.youtube.com/watch?v=lIYxE-tOAdw

---

# Upcoming

### Story 1 - Org creation, role creation & assignment, org role-based access control

  - `Alice` creates an organization `ORG-A` 
    - verify: succeed, and `Alice` is now an admin of `ORG-A`

  - `Alice` calls ProductRegistry dispatchables on behalf of `ORG-A`
    - verify: fail, as Alice has not been assigned the right role

  - `Bob` calls ProductRegistry dispatchables on behalf of `ORG-A`
    - verify: fail, as Bob is not in `ORG-A`

  - `Alice` adds `Bob` and `Charlies` into the organization
    - verify: succeed, and Bob and Charlies are in `ORG-A`

  - `Alice` creates `ProductRegistry::ManageExecute` && `ProductRegistry::Execute` roles for `ORG-A`
    - verify: succeed, and these two roles are created for `ORG-A`
    - verify: `Alice` have been assigned for these two roles

  - `Alice` creates a new product (ProductRegistry dispatchable) on behalf of `ORG-A`
    - verify: succeed, and a new product is created of `ORG-A`

  - `Bob` creates a new product on behalf of `ORG-A`
    - verify: fail, as `Bob` has not been assigned the right role

  - `Alice` assigns `ProductRegistry::Execute` of `ORG-A` to `Bob`, and Bob create a product.
    - verify: succeed, and a new product is created of `ORG-A`

  - `Alice` creates `ProductTracking::ManageExecute` && `ProductTracking::Execute` for `ORG-A`
  - `Alice` assigns `ProductTracking::Execute` of `ORG-A` to `Charles`
  - `Charles` registers a new shipment (`ProductTracking` dispatchable)
    - verify: succeed, and a new shipment is created

  - `Charles` creates a new product for `ORG-A`
    - verify: fail, as Charles does not have `ProductRegistry::Execute` of `ORG-A`

  - `Bob` creates a new shipment for `ORG-A`
    - verify: fail, as Bob does not have `ProductTracking::Execute` of `ORG-A`

  - `Alice` removes `ProductRegistry::Execute` from `Bob` for `ORG-A`
  - `Bob` creates a new product on behalf of `ORG-A`
    - verify: fail, as `Bob` has not been assigned the right role

### Story 2 - Org admins

  - continue setup from Story 1

  - `Alice` assigns `Dave` as `ORG-A` admin
    - verify: fail, as `Dave` is not in `ORG-A`

  - `Bob` adds `Dave` into the organization
    - verify: fail, as Bob is not an admin of `ORG-A`

  - `Bob` creates `Balance::ManageExecute` role of `ORG-A`
    - verify: fail, as Bob is not an admin of `ORG-A`

  - `Bob` assigns `ProductRegistry::Execute` role of `ORG-A` to `Charles`
    - verify: fail, as Bob is not an admin of `ORG-A`

  - `Alice` assigns `Bob` as `ORG-A` admin
    - verify: succeed, and `Dave` is added to `ORG-A`

  - `Bob` adds `Dave` into `ORG-A`
    - verify: succeed, `Dave` added into `ORG-A`

  - `Bob` creates `Balance::ManageExecute` role of `ORG-A`
    - verify: succeed, `Bob` creates `Balance::ManageExecute` role of `ORG-A`

  - `Bob` assigns `ProductRegistry::Execute` role of `ORG-A` to `Charles`
    - verify: succeed

### Story 3 - admin across multiple organizations

  - continue setup from Story 2

  - `Dave` creates an organization `ORG-D`
    -  verify: succeed, and `Dave` is now an admin of `ORG-D`

  - `Dave` assigns `Alice` as `ORG-D` admin
    - verify: succeed. There are two admins for `ORG-D`, `Alice` and `Dave`

  - `Alice` creates and assigns `ProductRegistry::Execute` role of `ORG-D` to herself
    - verify: succeed

  - `Alice` creates a new product for `ORG-D`
    - verify: succeed

  - `Alice` creates a new product for `ORG-A`
    - verify: succeed
