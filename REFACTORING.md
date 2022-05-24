# Refactoring to V2

## Problem

Too much logic in the models.

Lack of SRP (check all the models and `GameRepositoryDatabase#findOneByAccessToken` for examples)

## Roadmap

[x] Unify models and entities (includes removing unneeded models)
[ ] Fix unit specs
[ ] Fix e2e specs
[ ] Remove logic from models
