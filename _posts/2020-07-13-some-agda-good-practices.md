---
layout: post
title: 'Some Agda Good Practices 🚧'
date: 2020-07-13 17:30:00 -0300
permalink: /blog/agda-good-practices
author: Maycon Amaro
categories:
  - software engineering
---

In this post, I'll list some programming practices in Agda that I believe programmers should follow, in order to provide more readable, maintaining code. I'm not an Agda expert (yet), so I'll update this post everytime I realize some other good practice.

## Imports matter!

You know, the Agda's Standard Library is getting bigger by the time, even if it's not even close to Coq's available libraries (this chicken coop is becoming a mansion). When we see someone's code, we would want to easily find which module of Standard Library exports some specific definition, or to find out that some definition is exported by a module in the first place. Look at the following code:

```haskell
module Example where

open import Function
open import Data.Product

compose : ∀ {A B C : Set} → (A → B) × (B → C) → (A → C)
compose p = proj₂ p ∘ proj₁ p
```

Everyone who already knows Agda won't have a hard time figuring out that projections and product come from `Data.Product` and function composition come from `Function`. But this example is way too simple. Real Agda modules can use a lot of external definitions that not everyone is familiar with. Figuring out what comes from what can be a real pain, as well as figuring out for what purpose each module is being imported. We can make our Agda code a lot easier to maintain and our ideas easy to reproduce if we make good use of `using`:

```haskell
module Example where

open import Function using (_∘_)
open import Data.Product using (_×_; proj₁; proj₂)

compose : ∀ {A B C : Set} → (A → B) × (B → C) → (A → C)
compose p = proj₂ p ∘ proj₁ p
```

I know it can be boring to describe our imports like this, but it is worth the effort. Also, some modules could export definitions with the same name. Without `using` you'd be finding yourself having to declare `hiding` in some modules. If it wasn't hard enough to see why the module  was there now we have to WONDER why something is being kept apart, since we cannot see which module is in conflict. `using` only brings to us what we explicitly ask for, and thus we'll be avoiding the conflicts! Of course, we can still use `renaming` to avoid conflicts when we indeed need both definitions, or if want to re-use the name of a definition we're importing:

```haskell
module Example where

open import Function using (_∘_)
open import Data.Product using (_×_) renaming (proj₁ to fst; proj₂ to snd)
open import MyCustomModule using (proj₁; proj₂)

compose : ∀ {A B C : Set} → (A → B) × (B → C) → (A → C)
compose p = snd p ∘ fst p
```

Notice that renaming brings the definitions into scope without have to `using` them, so it's a pretty good choice if you want to rename a definition for another reason.

If you know you'll be already using so much definitions from a module, it's better to make a qualified import, as we'd say in Haskell (in Agda it's just the default import):

```haskell
module Example where

open import Function using (_∘_)
import Data.Product

compose : ∀ {A B C : Set} → (A → B) Data.Product.× (B → C) → (A → C)
compose p = Data.Product.proj₂ p ∘ Data.Product.proj₁ p
```

I agree this is now *annoying* to the programmer, but we can rename the module so the qualified import is more similar to what we do and love in Haskell:

```haskell
module Example where

open import Function using (_∘_)
import Data.Product as Prod

compose : ∀ {A B C : Set} → (A → B) Prod.× (B → C) → (A → C)
compose p = Prod.proj₂ p ∘ Prod.proj₁ p
```

Much better, uh? Now everything that comes from `Data.Product` have to be accessed through `Prod`. Notice that I took out the `open` in the two examples above because I don't want to bring things into the current module scope. I want to keep things apart. If we're using `using` for the other imports, we'll know that this import is *qualified* because we need so much things from it, and we can look out for them by looking for the module's name or renaming, in the code.

If you think a module's name is way too large to import it and declare the `using` definitions, you can break the import in two lines by opening a renamed module:

```haskell
import Relation.Binary.PropositionalEquality as Eq
open Eq using (_≡_; refl; sym; subst; cong; trans)
```

Combining those things, our imports can be way more descriptive and helpful for those reading our code. Just by looking at my imports below you can know why which module is being imported, and when you see a definition in my code, you can just come back to the imports to check where you can access it in the Standard Library.

```haskell
import Relation.Binary.PropositionalEquality as Eq
open Eq using (_≡_; refl; sym; subst; cong; trans)
open import Relation.Nullary using (¬_; Dec; yes; no)
open import Data.List using (List; []; _∷_; _++_; length)
open import Data.Sum using (_⊎_;inj₁; inj₂)
open import Function using (_∘_; _$_; _⟨_⟩_)
open import Level using (_⊔_)
open import Relation.Binary using (DecTotalOrder)
open import Data.Nat using (ℕ; zero; _+_; suc; pred)
import Counting as Cnt
```

## (De)composing things is better than making them big

`-- TODO`
