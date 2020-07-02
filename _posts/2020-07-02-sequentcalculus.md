---
layout: post
title: "Sequent Calculus as a Dependent type"
author: Felipe Péret
date: 2020-07-01 16:30 -0300
permalink: /blog/sequent-calculus-as-a-dependent-type
categories:
- proof theory

---

In this work, we’ll use Agda to formalize important concepts from Mathematical Logic.

Agda is a dependently typed functional programming language.

Resource for learning Agda: [https://plfa.github.io/](https://plfa.github.io/%5D)

Using the propositions-as-types paradigm (equivalence between functional programs and mathematical proofs), Agda can also be viewed as a proof assistant (a tool that helps mathematicians to prove theorems).

In logic and proof theory, Sequent Calculus is a formal system that deals with the notion of a mathematical proof.

## Inference Rules

Just as we did with the Natural Deduction system, we'll represent Sequent Calculus as a dependent type using Agda as a metalanguage.

```haskell
-- Inference rules for Sequent Calculus.
data _==>_ : Context → Form → Set where

  init : ∀ {Γ A}
    → Γ , A ==> A

  ∧R : ∀ {Γ A B}
    → Γ ==> A
    → Γ ==> B
    → Γ ==> A ∧ B

  ∧L₁ : ∀ {Γ A B C}
    → Γ , A ∧ B , A ==> C
    → Γ , A ∧ B     ==> C

  ∧L₂ : ∀ {Γ A B C}
    → Γ , A ∧ B , B ==> C
    → Γ , A ∧ B     ==> C

  ⇒R : ∀ {Γ A B}
    → Γ , A ==> B
    → Γ     ==> A ⇒ B

  ⇒L : ∀ {Γ A B C}
    → Γ , A ⇒ B     ==> A
    → Γ , A ⇒ B , B ==> C
    → Γ , A ⇒ B     ==> C

  ∨R₁ : ∀ {Γ A B}
    → Γ ==> A
    → Γ ==> A ∨ B

  ∨R₂ : ∀ {Γ A B}
    → Γ ==> B
    → Γ ==> A ∨ B

  ∨L : ∀ {Γ A B C}
    → Γ , A ∨ B , A ==> C
    → Γ , A ∨ B , B ==> C
    → Γ , A ∨ B     ==> C

  ⊤R : ∀ {Γ}
    → Γ ==> ⊤

  ⊥L : ∀ {Γ C}
    → Γ , ⊥ ==> C

  exchange : ∀ {Γ Δ C}     -- Structural rule
    → Γ ~ Δ
    → Γ ==> C
    → Δ ==> C
```

here we are defining a *sequent*, ie: a derivation in the Sequent Calculus system.

Γ ==> C means

```
"the context Γ proves the formula C in the Sequent Calculus system"
```

Now we can prove properties about this system by writing functional programs.

## Consistency

One of the things that make Sequent Calculus interesting to us is that it is trivially consistent.

In other words, the proof of consistency for Sequent Calculus is fairly easy.

```haskell
==>-consistency : ¬ (∅ ==> ⊥)
==>-consistency (exchange x D) rewrite ~-∅ _ x = ==>-consistency D
```

## Weakening

We can also prove, for example, that this formal system admits weakening: 

A structural rule where hypotheses of a sequent may be extended with an additional member.

```haskell
-- Proving that Sequent Calculus admits weakening.
==>-weakening : ∀ {Γ F C}
  → Γ     ==> C
  → Γ , F ==> C
==>-weakening init      = exchange Swap init
==>-weakening (∧R D D₁) = ∧R (==>-weakening D) (==>-weakening D₁)
==>-weakening (∧L₁ D)   = exchange Swap (∧L₁ (exchange (Trans Swap (Skip Swap)) (==>-weakening D)))
==>-weakening (∧L₂ D)   = exchange Swap (∧L₂ (exchange (Trans Swap (Skip Swap)) (==>-weakening D)))
==>-weakening (⇒R D)    = ⇒R (exchange Swap (==>-weakening D))
==>-weakening (⇒L D D₁) = exchange Swap (⇒L (exchange Swap (==>-weakening D))
  (exchange (Trans Swap (Skip Swap)) (==>-weakening D₁)))
==>-weakening (∨R₁ D)   = ∨R₁ (==>-weakening D)
==>-weakening (∨R₂ D)   = ∨R₂ (==>-weakening D)
==>-weakening (∨L D D₁) = exchange Swap (∨L (exchange (Trans Swap (Skip Swap)) (==>-weakening D))
  (exchange (Trans Swap (Skip Swap)) (==>-weakening D₁)))
==>-weakening ⊤R        = ⊤R
==>-weakening ⊥L        = exchange Swap ⊥L
==>-weakening (exchange D x) = exchange (Skip D) (==>-weakening x)
```

## Contraction

Is another structural rule that the Sequent Calculus admits, where two equal members of the hypotheses may be replaced by a single member.

```haskell
-- Proving that Sequent Calculus admits contraction.
-- (Here we are using fuel because Agda's termination checker
--  doesn't see that the (exchange D) keeps the size of the derivation D).
==>-contraction : ∀ {Γ A C}
  → ℕ
  → Γ , A , A ==> C
  → Maybe (Γ , A ==> C)
==>-contraction zero _ = nothing
==>-contraction (suc n) init = just init
==>-contraction (suc n) (∧R D D₁) with (==>-contraction n D) | (==>-contraction n D₁)
==>-contraction (suc n) (∧R D D₁) | nothing | nothing = nothing
==>-contraction (suc n) (∧R D D₁) | nothing | just x = nothing
==>-contraction (suc n) (∧R D D₁) | just x | nothing = nothing
==>-contraction (suc n) (∧R D D₁) | just x | just x₁ = just (∧R x x₁)
==>-contraction (suc n) (∧L₁ D) with (==>-contraction n (exchange (Trans Swap (Skip Swap)) D))
==>-contraction (suc n) (∧L₁ D) | nothing = nothing
==>-contraction (suc n) (∧L₁ D) | just x = just (∧L₁ (exchange Swap x))
==>-contraction (suc n) (∧L₂ D) with (==>-contraction n (exchange (Trans Swap (Skip Swap)) D))
==>-contraction (suc n) (∧L₂ D) | nothing = nothing
==>-contraction (suc n) (∧L₂ D) | just x = just (∧L₂ (exchange Swap x))
==>-contraction (suc n) (⇒R D) with (==>-contraction n (exchange (Trans Swap (Skip Swap)) D))
==>-contraction (suc n) (⇒R D) | nothing = nothing
==>-contraction (suc n) (⇒R D) | just x = just (⇒R (exchange Swap x))
==>-contraction (suc n) (⇒L D D₁) with (==>-contraction n D) |
  (==>-contraction n (exchange (Trans Swap (Skip Swap)) D₁))
==>-contraction (suc n) (⇒L D D₁) | nothing | nothing = nothing
==>-contraction (suc n) (⇒L D D₁) | nothing | just x = nothing
==>-contraction (suc n) (⇒L D D₁) | just x | nothing = nothing
==>-contraction (suc n) (⇒L D D₁) | just x | just x₁ = just (⇒L x (exchange Swap x₁))
==>-contraction (suc n) (∨R₁ D) with (==>-contraction n D)
==>-contraction (suc n) (∨R₁ D) | nothing = nothing
==>-contraction (suc n) (∨R₁ D) | just x = just (∨R₁ x)
==>-contraction (suc n) (∨R₂ D) with (==>-contraction n D)
==>-contraction (suc n) (∨R₂ D) | nothing = nothing
==>-contraction (suc n) (∨R₂ D) | just x = just (∨R₂ x)
==>-contraction (suc n) (∨L D D₁) with (==>-contraction n (exchange (Trans Swap (Skip Swap)) D)) |
  (==>-contraction n (exchange (Trans Swap (Skip Swap)) D₁))
==>-contraction (suc n) (∨L D D₁) | nothing | nothing = nothing
==>-contraction (suc n) (∨L D D₁) | nothing | just x = nothing
==>-contraction (suc n) (∨L D D₁) | just x | nothing = nothing
==>-contraction (suc n) (∨L D D₁) | just x | just x₁ = just (∨L (exchange Swap x) (exchange Swap x₁))
==>-contraction (suc n) ⊤R = just ⊤R
==>-contraction (suc n) ⊥L = just ⊥L
==>-contraction (suc n) (exchange x D) with (==>-contraction n (exchange x D))
==>-contraction (suc n) (exchange x D) | nothing = nothing
==>-contraction (suc n) (exchange x D) | just x₁ = just x₁
```

**Notice that**: we are using 'fuel' here to prove the proposition.

This is because the Agda termination checker doesn't know that the exchange rule we are using in our system mantains the size of the derivation.



Next post: Cut and Translation
