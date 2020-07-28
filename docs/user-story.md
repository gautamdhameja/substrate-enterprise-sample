# Now

### Story 1
  - `Alice` creates an organization `ORG-A`
    - 


# In Future

### Story 1
  - `Alice` creates an organization `ORG-A` 
    - verify `Alice` is the owner of `ORG-A`

  - Alice add Bob and Charlies into the organization

  - `Alice` creates `ProductRegistry::Manage` && `ProductRegistry::Execute` role for `ORG-A`
    - verify this role is created for `ORG-A`

  - `Alice` assigns `ProductRegistry::Execute` role for `ORG-A` to `Bob`
    - **Before**: verify `Bob` fail to call ProductRegistry dispatchable on behalf of `ORG-A`
    - `Alice` assigns `Bob` `ProductRegistry::Execute` role for `ORG-A`
    - **After**: verify `Bob` can call ProductRegistry dispatchables on behalf of `ORG-A` (custom origin)

  - `Alice` assigns `ProductTracking::Execute` role to Charlie


  - Bob creates a product
  - Charlie create a shipment
    L verify that an external http request is made (off-chain worker)
  - Bob cannot create a shipment
  - Charlie cannot create a product

  - `Alice` removes `ProductRegistry::Execute` role for `ORG-A` from `Bob`
    - verify `Bob` calls ProductRegistry dispatchable on behalf of `ORG-A`, and fail.

### Story 2
  - Continue on story 1
  - `Alice` assigns back `ProductRegistry::Execute` role for `ORG-A` to `Bob`
  - `Charlie` creates an organization `ORG-A`
    - verify this fails
  - `Charlie` creates an organization `ORG-C`
    - verify `Charlie` become the owner of `ORG-C`
  - `Charlie` assigns `ProductRegistry::Execute` role for `ORG-C` to `Bob`
    - verify `Bob` can call ProductRegistry dispatchable on behalf of `ORG-A`
    - verify `Bob` can call ProductRegistry dispatchable on behalf of `ORG-C`

### Questions
  - Can `Alice` add `Bob` as co-owner of `ORG-A`? 
