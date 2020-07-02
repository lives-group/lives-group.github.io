---
layout: post
title: "Natural Deduction as a Dependent type"
author: Felipe Péret
date: 2020-06-30 17:00 -0300
permalink: /blog/natural-deduction-as-a-dependet-type

categories:
- proof theory

---

In this work, we'll use Agda to formalize important concepts from Mathematical Logic.

Agda is a dependently typed functional programming language.

Resource for learning Agda: [https://plfa.github.io/]()

Using the propositions-as-types paradigm (equivalence between functional programs and mathematical proofs), Agda can also be viewed as a proof assistant  (a tool that helps mathematicians to prove theorems).

In logic and proof theory, Natural Deduction is a formal system that deals with the notion of a mathematical proof.

## Formal System

A set of rules of inference, represented as a dependent type in Agda.

```haskell
-- Natural deduction inference rules
data _⊢_ : Context → Form → Set where

  `_ : ∀ {Γ A}
    → Γ ∋ A
    → Γ ⊢ A

  ƛ_  : ∀ {Γ A B}
    → Γ , A ⊢ B
    → Γ ⊢ A ⇒ B

  _∙_ : ∀ {Γ A B}
    → Γ ⊢ A ⇒ B
    → Γ ⊢ A
    → Γ ⊢ B

  ⟨_,_⟩ : ∀ {Γ A B}
    → Γ ⊢ A
    → Γ ⊢ B
    → Γ ⊢ A ∧ B

  fst_ : ∀ {Γ A B}
    → Γ ⊢ A ∧ B
    → Γ ⊢ A

  snd_ : ∀ {Γ A B}
    → Γ ⊢ A ∧ B
    → Γ ⊢ B

  inl_ : ∀ {Γ A B}
    → Γ ⊢ A
    → Γ ⊢ A ∨ B

  inr_ : ∀ {Γ A B}
    → Γ ⊢ B
    → Γ ⊢ A ∨ B

  case_of_∣_ : ∀ {Γ A B C}
    → Γ ⊢ A ∨ B
    → Γ , A ⊢ C
    → Γ , B ⊢ C
    → Γ ⊢ C

  T-intro : ∀ {Γ}
    → Γ ⊢ ⊤

  ⊥-elim : ∀ {Γ C}
    → Γ , ⊥ ⊢ C
```

here we are defining a dependent data type and calling it  ______⊢________.

**Notice:**   the __ serve to show us that ____⊢____ is an infix operator.

    The ______⊢________ type is indexed by a context and a formula,  for example:

Γ ⊢ A            means        

    "the context Γ proves the formula A in the Natural Deduction system"

## Consistency

Being the Natural Deduction a formal system that is concerned with the notion of a mathematical proof, it is important to prove it's consistency.

The consistency property tell us that it is not possible to derive ⊥ (absurdum) from a context empty of premises.  In other words, we cannot derive ∅ ⊢ ⊥.

If we were able to derive ⊥ from no premises, our formal system would be capable of providing a proof for every possible proposition, which is completely nonsense.

However, we cannot use structural recursion in Natural Deduction derivation trees, since there are derivations with redundancies, i.e : an introduction followed by an elimination of the same rule.

One way to prove consistency for Natural Deduction is by translating it to another formal system who can only represent normal terms (derivations without redundancy), called "Bi-directional Natural Deduction".

This formal system, with the addition of another rule called "contraction", is equivalent to the original natural deduction system, and equivalent to the Sequent Calculus with the cut rule, a formal system whose consistency is trivial.

We'll publish both Sequent Calculus and Bi-directional Natural Deduction formalizations, and the final result formalizing the consistency proof for Natural Deduction.

Next post : [Sequent Calculus as a Dependent Type](/blog/sequent-calculus-as-a-dependent-type)
